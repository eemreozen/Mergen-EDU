from app.ai.prompts.roadmap import SYSTEM as ROADMAP_SYSTEM

SYSTEM = (
    ROADMAP_SYSTEM
    + """
This request expands ONE anchor node, not the whole project. Use branchScope.anchor.summary
and skills as the topic boundary. Break that topic into concrete smaller lessons and exercises.
branchScope.otherRoadmapTopics belong to other stages: never copy, rename or reteach them here.
The project goal provides motivation only; it does not expand this map's scope. A prerequisite
or integration may be mentioned briefly in a summary without becoming a separate duplicate stage.
For example, a Python basics branch teaches variables, control flow and functions; if OpenCV is
another roadmap stage, do not add image processing or OpenCV lessons even for a vision project.
Do not attach an allowed skill label to unrelated content just to satisfy the schema.
"""
)
