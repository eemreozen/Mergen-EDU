import json
from pathlib import Path

from app.schemas.roadmap import ResourceView

CATALOG = json.loads((Path(__file__).parents[1] / "resources" / "curated.json").read_text())


class ResourceService:
    def for_node(self, node):
        return [
            ResourceView(
                id=f"{node.id}:{r['id']}",
                node_id=node.id,
                **{k: v for k, v in r.items() if k not in {"id", "skills"}},
            )
            for r in CATALOG
            if any(s == topic or s.startswith(topic + ".") for s in node.skills for topic in r["skills"])
        ]


node_resources = ResourceService().for_node
