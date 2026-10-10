"""Deterministic topic context and conservative search-result relevance."""
import re
import unicodedata
from dataclasses import dataclass
from urllib.parse import unquote


def normalized(value):
    value = value.casefold().replace("ı", "i")
    return "".join(c for c in unicodedata.normalize("NFKD", value) if not unicodedata.combining(c))


STOP = set("ve ile icin bir bu nasil nedir the and for with using intro introduction tutorial documentation guide konu anlatimi ogrenme temelleri temel basics fundamentals proje project gelistirme gelistirilmesi uygulama kurulum kurulumu sistemi system development learning beginner advanced temel ilk yapisi olusturma ve or to of in on a an".split())
SHORT = {"ai", "ml", "go", "js", "ui", "ux", "c", "r"}
ALIASES = (
    (("iliskisel", "relational"), ("relational", "database", "sql")),
    (("veritab", "database", "postgres", "mysql", "sqlite", "sql"), ("database", "sql", "postgresql", "mysql", "sqlite", "veritabani")),
    (("goruntu isleme", "image processing", "opencv"), ("opencv", "image processing", "goruntu isleme")),
    (("makine ogren", "machine learning"), ("machine learning", "makine ogrenmesi")),
    (("derin ogren", "deep learning"), ("deep learning", "derin ogrenme")),
    (("nesne tesp", "object detection", "yolo"), ("object detection", "yolo", "nesne tespiti")),
    (("sinir ag", "neural network"), ("neural network", "sinir aglari")),
    (("kimlik dogrul", "authentication", "oauth", "jwt"), ("authentication", "oauth", "jwt", "kimlik dogrulama")),
    (("konteyner", "container", "docker"), ("docker", "container", "konteyner")),
    (("surum kontrol", "version control", "git"), ("git", "version control", "surum kontrol")),
)


def tokens(value):
    return tuple(dict.fromkeys(word for word in re.findall(r"[a-z0-9+#]+", normalized(value))
                               if word not in STOP and (len(word) >= 3 or word in SHORT)))


@dataclass(frozen=True)
class TopicContext:
    query: str
    anchors: tuple[str, ...]
    fallback_query: str = ""


def topic_context(title, skills=(), summary=""):
    title_words = tokens(title)
    skill_words = tokens(" ".join(skills))
    # Summaries are only a fallback for opaque or generic titles. Do not search
    # a whole project description, which can pull in unrelated sibling topics.
    text = normalized(f"{title} {' '.join(skills)}" if title_words or skill_words else summary)
    aliases = []
    for triggers, terms in ALIASES:
        if any(re.search(r"\b" + re.escape(trigger), text) for trigger in triggers):
            aliases.extend(terms)
    anchors = tuple(dict.fromkeys([*title_words, *skill_words, *aliases]))
    generic = {"veri", "data", "model", "models", "web", "api", "service", "servis", "design", "tasarimi", "integration", "entegrasyon", "management", "yonetimi", "test", "testing", "mimarisi", "mantigi"}
    specific = tuple(term for term in anchors if term not in generic)
    if specific:
        anchors = specific
    if not anchors:
        anchors = tokens(summary)[:6]
    # Keep the human title, but replace meaningless short codes with real skills.
    base = " ".join(title.split())[:140] if title_words else " ".join(skill_words or anchors)[:140]
    expansion = [term for term in [*skill_words, *aliases] if normalized(term) not in normalized(base)][:6]
    return TopicContext(" ".join([base, *expansion]).strip(), anchors, " ".join(skill_words or aliases[:3] or title_words))


def relevant_results(results, context, limit=3):
    scored = []
    for index, result in enumerate(results):
        title = normalized(result.title)
        metadata = normalized(f"{unquote(result.url)} {result.description}")
        def contains(text, term):
            # Prefix matching handles Turkish inflections without matching 'git'
            # inside an unrelated word such as 'digital'.
            return bool(re.search(r"\b" + re.escape(term) + (r"\b" if len(term) <= 4 else r"[a-z]*\b"), text))
        hits = [term for term in context.anchors if contains(title, term)]
        supporting = [term for term in context.anchors if contains(metadata, term)]
        # A bare mention in a search snippet is insufficient. Require the topic
        # in the title or URL, and never accept tutorial/guide alone as relevance.
        url_hits = [term for term in context.anchors if contains(normalized(unquote(result.url)), term)]
        if not hits and not url_hits:
            continue
        score = len(hits) * 4 + len(supporting) + (2 if result.type == "documentation" else 0)
        scored.append((-score, index, result))
    return [result for _, _, result in sorted(scored)[:limit]]
