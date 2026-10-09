export interface MemoryReview {
  id: string; sourceNodeId: string; sourceTitle: string; skill: string; level: number;
  status: 'scheduled' | 'refresher'; due: boolean; dueAt: string; remainingSteps: number;
}
export interface WrongQuestion {
  questionId: string; nodeId: string; nodeTitle: string; prompt: string; selectedOption: string;
  correctOption: string; explanation: string; skill: string; wrongCount: number; lastWrongAt: string;
  reviewId: string | null;
}
export interface TimeMachine {
  completedSteps: number; dueCount: number; reviews: MemoryReview[]; wrongQuestions: WrongQuestion[];
}
export interface MemoryChallenge {
  id: string; reviewId: string; sourceTitle: string; skill: string; prompt: string; options: string[];
}
export interface MemoryResult {
  checkId: string; correct: boolean; correctIndex: number; explanation: string; refresher: string;
  miniExercise: string; nextDueAt: string; remainingSteps: number;
}
