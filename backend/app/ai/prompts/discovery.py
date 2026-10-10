from app.ai.prompts.discovery_policy import POLICY

SYSTEM = POLICY + """
Review the original idea, earlier analysis, all questions and the user's actual answers together.
Reassess the product after the answers; do not assume the initial analysis was correct.
Return 0-3 follow-up questions ONLY for important product ambiguities that remain, including
new ambiguities revealed by free-text answers. Return an empty questions list when there is
enough information to build a faithful roadmap. Do not create optional questions just to fill
this round. Do not repeat answered fields, ask the user to restate the idea, or ask a stack quiz.
Use parentQuestionId when clarifying one existing answer; use null for an independent missing
product decision. A parent ID must exist in the supplied questions. Respect remainingQuestionBudget.
"""
