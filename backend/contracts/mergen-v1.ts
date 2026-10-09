// Otomatik üretilmiştir. Kaynak: mergen-v1.schema.json; elle değiştirmeyin.

export type AssessmentQuestion = {
  id: string;
  prompt: string;
  options: Array<string>;
  correctIndex: number;
  explanation: string;
  targetSkill: string;
  difficulty: string;
};

export type AssessmentView = {
  id: string;
  nodeId: string;
  title: string;
  passingScore: number;
  version: number;
  questions: Array<PublicQuestion>;
};

export type DemoAssessmentView = {
  id: string;
  nodeId: string;
  title: string;
  passingScore: number;
  version: number;
  questions: Array<AssessmentQuestion>;
};

export type DiscoveryAnswer = {
  questionId: string;
  value: string | Array<string>;
};

export type DiscoveryQuestion = {
  id: string;
  questionId: string;
  text: string;
  type: "single_choice" | "multi_choice" | "short_text";
  options?: Array<string>;
  targetField: string;
  required?: boolean;
  parentQuestionId?: string | null;
  completed?: boolean;
};

export type DiscoveryView = {
  questions: Array<DiscoveryQuestion>;
  answers: Array<DiscoveryAnswer>;
  completed: boolean;
  nextQuestion: DiscoveryQuestion | null;
  readyForRoadmap: boolean;
};

export type EdgeView = {
  id: string;
  source: string;
  target: string;
  kind: "requires" | "supports";
};

export type LearnerProfile = {
  experienceLevel?: string;
  knownTechnologies?: Array<string>;
  selfReportedSkills?: Array<string>;
  verifiedSkills?: Array<string>;
  weeklyHours?: number | null;
};

export type MapView = {
  id: string;
  projectId: string;
  title: string;
  description: string;
  parentMapId: string | null;
  parentNodeId: string | null;
  generationStatus: string;
  version: number;
  nodes: Array<NodeView>;
  edges: Array<EdgeView>;
  metadata: Metadata;
};

export type Metadata = {
  source?: string;
  demo?: boolean;
};

export type NodeView = {
  id: string;
  mapId: string;
  title: string;
  summary: string;
  type: "learning" | "development_task" | "submap" | "milestone" | "remedial";
  status: "locked" | "available" | "in_progress" | "completed" | "needs_review";
  skills: Array<string>;
  estimatedHours: number;
  prerequisites?: Array<string>;
  whyNeeded?: string;
  learningObjectives?: Array<string>;
  subtopics?: Array<string>;
  practicalTask?: PracticalTask | null;
  resources?: Array<ResourceView>;
  assessmentId?: string | null;
  childMapId?: string | null;
  remediationForNodeId?: string | null;
  taskCompleted?: boolean;
};

export type PracticalTask = {
  description: string;
  expectedOutput: string;
};

export type ProjectView = {
  id: string;
  projectId: string;
  title: string;
  originalIdea: string;
  primaryDomain: "core" | "web" | "mobile" | "ai_ml" | "game_dev";
  secondaryDomains: Array<"core" | "web" | "mobile" | "ai_ml" | "game_dev">;
  goal: string;
  locale: string;
  status: "discovery" | "ready_for_roadmap" | "generating" | "active" | "failed";
  metadata: Metadata;
};

export type PublicQuestion = {
  id: string;
  prompt: string;
  options: Array<string>;
  explanation?: string;
  targetSkill: string;
  difficulty: string;
};

export type ResourceView = {
  id: string;
  nodeId: string;
  title: string;
  url: string;
  type: "documentation" | "youtube" | "article" | "interactive" | "course";
  provider: string;
  language: string;
  verified: boolean;
};

export type ExportBundle = {
  schemaVersion?: "mergen/v1";
  project: ProjectView;
  learnerProfile: LearnerProfile;
  discovery: DiscoveryView;
  maps?: Array<MapView>;
  assessments?: Array<AssessmentView | DemoAssessmentView>;
  resources?: Array<ResourceView>;
  metadata: Metadata;
};
