"""Find real reading/video links without asking the language model to invent URLs."""

import asyncio
import hashlib
import ipaddress
import json
import re
import time
from collections import OrderedDict
from dataclasses import dataclass
from urllib.parse import quote, urlsplit, urlunsplit
from xml.etree import ElementTree

import httpx

from app.schemas.resources import ReferenceView
from app.schemas.roadmap import ResourceView
from app.services.resource_relevance import relevant_results, topic_context


@dataclass(frozen=True)
class SearchResult:
    title: str
    url: str
    type: str
    provider: str
    description: str = ""


def public_url(value: str) -> str | None:
    """Only expose public web URLs; never fetch a URL returned by a search result."""
    try:
        parsed = urlsplit(value.strip())
        host = parsed.hostname or ""
        if parsed.scheme not in {"https", "http"} or parsed.username or parsed.password:
            return None
        if not host or "." not in host or host.endswith((".local", ".localhost", ".internal")):
            return None
        if parsed.port not in {None, 80, 443}:
            return None
        try:
            if not ipaddress.ip_address(host).is_global:
                return None
        except ValueError:
            pass
        return urlunsplit(parsed._replace(fragment=""))
    except ValueError:
        return None


def parse_readings(body: bytes, limit=3) -> list[SearchResult]:
    root = ElementTree.fromstring(body)
    if root.tag != "rss":
        raise ValueError("Unexpected search response")
    results = []
    seen = set()
    for item in root.findall("./channel/item"):
        url = public_url(item.findtext("link", ""))
        title = item.findtext("title", "").strip()
        if not url or not title or url in seen:
            continue
        host = urlsplit(url).hostname.removeprefix("www.")
        if host in {"youtube.com", "m.youtube.com", "youtu.be", "bing.com"}:
            continue
        path = urlsplit(url).path.lower()
        kind = (
            "documentation"
            if host.startswith("docs.")
            or any(
                word in f"{path} {title.lower()}"
                for word in ("docs", "documentation", "tutorial", "guide", "/learn")
            )
            else "article"
        )
        seen.add(url)
        results.append(SearchResult(title[:300], url, kind, host, item.findtext("description", "")[:1000]))
    return sorted(results, key=lambda result: result.type != "documentation")[:limit]


def youtube_text(value: dict) -> str:
    return value.get("simpleText", "") or "".join(run.get("text", "") for run in value.get("runs", []))


def parse_videos(body: str, limit=3) -> list[SearchResult]:
    match = re.search(r'(?:var\s+ytInitialData|window\["ytInitialData"\]|ytInitialData)\s*=\s*', body)
    if not match:
        raise ValueError("YouTube search data missing")
    data, _ = json.JSONDecoder().raw_decode(body[match.end() :])
    # Only organic search results, excluding ads, sidebars and recommendations.
    sections = data.get("contents", {}).get("twoColumnSearchResultsRenderer", {}).get("primaryContents", {})
    if not sections:
        raise ValueError("YouTube search results missing")
    results = []
    seen = set()

    def visit(value):
        if len(results) >= limit:
            return
        if isinstance(value, dict):
            video = value.get("videoRenderer")
            if video:
                identifier = video.get("videoId", "")
                title = youtube_text(video.get("title", {})).strip()
                if re.fullmatch(r"[A-Za-z0-9_-]{11}", identifier) and title and identifier not in seen:
                    seen.add(identifier)
                    channel = youtube_text(video.get("ownerText", {}))
                    results.append(
                        SearchResult(
                            title[:300],
                            f"https://www.youtube.com/watch?v={identifier}",
                            "youtube",
                            f"YouTube · {channel}" if channel else "YouTube",
                        )
                    )
                return
            for key, child in value.items():
                if key not in {"adSlotRenderer", "promotedSparklesWebRenderer", "promotedVideoRenderer"}:
                    visit(child)
        elif isinstance(value, list):
            for child in value:
                visit(child)

    visit(sections)
    return results


class WebResourceService:
    def __init__(self, timeout=10.0, transport=None):
        self.timeout = timeout
        self.transport = transport
        self.cache = OrderedDict()
        self.pending = {}

    async def _search(self, key):
        context, locale = key
        title = context.query
        async with httpx.AsyncClient(
            timeout=self.timeout,
            transport=self.transport,
            headers={"User-Agent": "Mergen-EDU/1.0 (learning resource search)"},
        ) as client:

            async def readings():
                queries = [title]
                if context.fallback_query and context.fallback_query.casefold() != title.casefold():
                    queries.append(context.fallback_query)
                for query in queries:
                    response = await client.get(
                        "https://www.bing.com/search",
                        params={"q": f"{query} tutorial documentation", "format": "rss",
                                "setlang": locale, "cc": "TR" if locale == "tr" else "US"},
                    )
                    response.raise_for_status()
                    matches = relevant_results(parse_readings(response.content, limit=15), context)
                    if matches:
                        return matches
                # Structured encyclopedic search is a keyless fallback when a
                # general search engine returns only portals/shops. No hand-picked
                # links and no fetching pages returned by either provider.
                response = await client.get("https://en.wikipedia.org/w/api.php", params={
                    "action": "query", "list": "search", "format": "json", "srlimit": 10,
                    "srsearch": context.fallback_query or title,
                })
                response.raise_for_status()
                articles = [SearchResult(item["title"],
                    "https://en.wikipedia.org/wiki/" + quote(item["title"].replace(" ", "_")),
                    "article", "Wikipedia", item.get("snippet", ""))
                    for item in response.json().get("query", {}).get("search", [])
                    if item.get("ns") == 0 and item.get("title")]
                return relevant_results(articles, context)

            async def videos():
                response = await client.get(
                    "https://www.youtube.com/results",
                    params={
                        "search_query": f"{title} {'konu anlatımı' if locale == 'tr' else 'tutorial'}",
                        "hl": locale,
                        "gl": "TR" if locale == "tr" else "US",
                    },
                )
                response.raise_for_status()
                return relevant_results(parse_videos(response.text, limit=15), context)

            async def bounded(search):
                async with asyncio.timeout(self.timeout):
                    return await search()

            outcomes = await asyncio.gather(bounded(readings), bounded(videos), return_exceptions=True)
        resources = [item for result in outcomes if isinstance(result, list) for item in result]
        complete = all(isinstance(result, list) and result for result in outcomes)
        status = "complete" if complete else "partial" if resources else "unavailable"
        # Cache full results for an hour; allow retry immediately on partial/failed searches.
        if complete:
            self.cache[key] = (time.monotonic() + 3600, resources, status)
            self.cache.move_to_end(key)
            while len(self.cache) > 128:
                self.cache.popitem(last=False)
        return resources, status

    async def for_topic(self, node_id, title, locale="tr", fallback=(), *, skills=(), summary="", resource_query=""):
        context = topic_context(title, skills, summary, resource_query)
        key = (context, "en" if locale.startswith("en") else "tr")
        if not context.anchors:
            return ReferenceView(resources=list(fallback), status="unavailable")
        cached = self.cache.get(key)
        if cached and cached[0] > time.monotonic():
            self.cache.move_to_end(key)
            results, status = cached[1:]
        else:
            if key not in self.pending:
                task = asyncio.create_task(self._search(key))
                self.pending[key] = task
                task.add_done_callback(lambda _: self.pending.pop(key, None))
            results, status = await asyncio.shield(self.pending[key])
        resources = [
            ResourceView(
                id=f"{node_id}:web:{hashlib.sha256(result.url.encode()).hexdigest()[:16]}",
                node_id=node_id,
                title=result.title,
                url=result.url,
                type=result.type,
                provider=result.provider,
                language="und",
                verified=False,
            )
            for result in results
        ]
        # The curated skill-matched catalogue takes priority over web ranking.
        # Preserve its verification metadata when the same URL is rediscovered.
        unique = {}
        for resource in [*fallback, *resources]:
            if public_url(resource.url):
                unique.setdefault(resource.url, resource)
        resources = list(unique.values())
        return ReferenceView(resources=resources, status=status)
