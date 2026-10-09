import asyncio
import json
from unittest.mock import AsyncMock
from uuid import uuid4

import httpx
import pytest
from test_assessment import prepare_ml

from app.services.web_resource_service import WebResourceService, parse_readings, parse_videos, public_url

READINGS = b"""<?xml version="1.0"?><rss><channel>
<item><title>Python Guide</title><link>https://docs.python.org/3/tutorial/</link></item>
<item><title>Duplicate</title><link>https://docs.python.org/3/tutorial/</link></item>
<item><title>Unsafe</title><link>javascript:alert(1)</link></item>
<item><title>Local</title><link>http://127.0.0.1/admin</link></item>
<item><title>Video</title><link>https://www.youtube.com/watch?v=abcdefghijk</link></item>
<item><title>Python explained</title><link>https://example.com/python-explained</link></item>
</channel></rss>"""


def video(identifier="abcdefghijk", title="Python tutorial"):
    return {
        "videoRenderer": {
            "videoId": identifier,
            "title": {"runs": [{"text": title}]},
            "ownerText": {"runs": [{"text": "Learning channel"}]},
        }
    }


def video_html(items=None):
    data = {
        "contents": {
            "twoColumnSearchResultsRenderer": {
                "primaryContents": {
                    "sectionListRenderer": {
                        "contents": [video(), video(), video("lmnopqrstuv")] if items is None else items
                    },
                }
            }
        }
    }
    return f"<script>var ytInitialData = {json.dumps(data)}; unrelatedScript();</script>"


def success(request):
    if request.url.host == "www.bing.com":
        return httpx.Response(200, content=READINGS)
    return httpx.Response(200, text=video_html())


def test_reading_links_are_direct_safe_and_deduplicated():
    results = parse_readings(READINGS)
    assert [r.url for r in results] == [
        "https://docs.python.org/3/tutorial/",
        "https://example.com/python-explained",
    ]
    assert results[0].type == "documentation"


@pytest.mark.parametrize(
    "url",
    [
        "javascript:alert(1)",
        "file:///etc/passwd",
        "http://localhost/",
        "http://127.0.0.1/",
        "http://192.168.1.5/",
        "http://[::1]/",
        "https://user:pass@example.com/",
        "https://example.com:8080/",
    ],
)
def test_non_public_links_are_excluded(url):
    assert public_url(url) is None


def test_videos_exclude_ads_invalid_ids_and_duplicates():
    results = parse_videos(
        video_html(
            [
                {"adSlotRenderer": video("aaaaaaaaaaa", "Advertisement")},
                video(),
                video(),
                video("invalid"),
                video("lmnopqrstuv"),
                video("zyxwvutsrqp"),
                video("xxxxxxxxxxx"),
            ]
        )
    )
    assert [r.url for r in results] == [
        "https://www.youtube.com/watch?v=abcdefghijk",
        "https://www.youtube.com/watch?v=lmnopqrstuv",
        "https://www.youtube.com/watch?v=zyxwvutsrqp",
    ]
    assert all(r.type == "youtube" and "Learning channel" in r.provider for r in results)


async def test_search_uses_title_locale_and_shares_cache_without_node_ids():
    requests = []

    async def handler(request):
        requests.append(request)
        await asyncio.sleep(0.01)
        return success(request)

    service = WebResourceService(transport=httpx.MockTransport(handler))
    first, second = await asyncio.gather(
        service.for_topic("one", "React hooks", "tr"),
        service.for_topic("two", "React hooks", "tr"),
    )
    cached = await service.for_topic("three", "React hooks", "tr")
    assert len(requests) == 2
    assert requests[0].url.params["q"] == "React hooks tutorial documentation"
    assert requests[1].url.params["search_query"] == "React hooks konu anlatımı"
    assert first.status == second.status == cached.status == "complete"
    assert all(r.node_id == "three" and r.id.startswith("three:") for r in cached.resources)
    assert all(not r.verified for r in cached.resources)
    await service.for_topic("four", "React hooks", "en")
    assert len(requests) == 4
    assert requests[-1].url.params["search_query"] == "React hooks tutorial"


async def test_one_provider_failure_keeps_other_results_and_can_retry():
    fail = True

    def handler(request):
        if fail and request.url.host == "www.youtube.com":
            raise httpx.ReadTimeout("Timeout")
        return success(request)

    service = WebResourceService(transport=httpx.MockTransport(handler))
    result = await service.for_topic("one", "Python")
    assert result.status == "partial"
    assert result.resources and all(r.type != "youtube" for r in result.resources)
    fail = False
    assert (await service.for_topic("one", "Python")).status == "complete"


async def test_cache_expires_and_reading_timeout_keeps_video_results(monkeypatch):
    requests = []
    now = [100.0]
    monkeypatch.setattr("app.services.web_resource_service.time.monotonic", lambda: now[0])

    def handler(request):
        requests.append(request)
        return success(request)

    service = WebResourceService(transport=httpx.MockTransport(handler))
    await service.for_topic("one", "Python")
    now[0] += 3601
    assert (await service.for_topic("one", "Python")).status == "complete"
    assert len(requests) == 4

    def timeout(request):
        if request.url.host == "www.bing.com":
            raise httpx.ReadTimeout("Timeout")
        return success(request)

    result = await WebResourceService(transport=httpx.MockTransport(timeout)).for_topic("two", "React")
    assert result.status == "partial"
    assert result.resources and all(r.type == "youtube" for r in result.resources)


async def test_blocked_or_changed_search_pages_report_unavailable():
    def handler(request):
        return httpx.Response(200, text="<html>Consent or captcha</html>")

    result = await WebResourceService(transport=httpx.MockTransport(handler)).for_topic("one", "Python")
    assert result.status == "unavailable" and not result.resources


async def test_references_are_owned_available_without_lesson_and_include_videos(
    client, app, project_id, monkeypatch
):
    _, child, python = await prepare_ml(client, project_id)
    app.state.resource_search = WebResourceService(transport=httpx.MockTransport(success))
    generate = AsyncMock(side_effect=AssertionError("References must not generate a lesson"))
    monkeypatch.setattr(app.state.gateway, "generate_structured", generate)
    response = await client.get(f"/api/v1/nodes/{python['id']}/references")
    assert response.status_code == 200, response.text
    data = response.json()
    assert data["status"] == "complete"
    assert {r["type"] for r in data["resources"]} >= {"documentation", "youtube"}
    assert all(r["nodeId"] == python["id"] for r in data["resources"])
    generate.assert_not_called()
    other = await client.get(
        f"/api/v1/nodes/{python['id']}/references",
        headers={"X-Demo-Session": str(uuid4())},
    )
    assert other.status_code == 404
    locked = next(n for n in child["nodes"] if n["status"] == "locked")
    assert (await client.get(f"/api/v1/nodes/{locked['id']}/references")).status_code == 200


async def test_existing_documents_remain_available_when_search_fails(client, app, project_id):
    _, _, python = await prepare_ml(client, project_id)
    app.state.resource_search = WebResourceService(
        transport=httpx.MockTransport(lambda _: httpx.Response(503)),
    )
    response = await client.get(f"/api/v1/nodes/{python['id']}/references")
    assert response.status_code == 200
    assert response.json()["status"] == "unavailable"
    assert response.json()["resources"][0]["url"] == "https://docs.python.org/3/tutorial/"
