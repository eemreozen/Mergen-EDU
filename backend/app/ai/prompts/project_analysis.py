from app.ai.prompts.discovery_policy import POLICY

SYSTEM = POLICY + """
Analyze the original idea and return compact structured project data, not a roadmap.
Classify domains into core, web, mobile, ai_ml or game_dev for routing only; do not let the
category replace understanding of the actual project. Keep title under 10 words, goal under
two sentences, 3-6 essential requiredSkills, and one brief proposed mvpSuggestion.
Use projectType=mvp unless explicitly asked for prototype or production_ready.
Return 0-5 discoveryQuestions, as many as needed for the highest-impact missing product
choices. Usually 2-4 suffice for a vague idea; do not force a count or invent questions for a
clear brief. List remaining material unknowns in uncertainDecisions, not generic 'stack choice'.
Do not invent product facts in the goal or MVP proposal: distinguish suggestions from facts.
Explicit requirements in the original idea take precedence over assumptions.
"""
