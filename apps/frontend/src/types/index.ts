export interface User {
  id: string;
  username: string;
  email: string;
}

export interface Organization {
  id: string;
  username: string;
  description: string;
  role: "ADMIN" | "MEMBER";
}

export interface Board {
  id: string;
  title: string;
  orgId: string;
}

export interface Section {
  id: string;
  title: string;
  boardId: string;
}

export interface IssueMapping {
  id: string;
  userId: string;
  issueId: string;
  user: {
    id: string;
    username: string;
  };
}

export interface Issue {
  id: string;
  title: string;
  description: string;
  sectionId: string;
  boardId: string;
  issueMappings?: IssueMapping[];
}

export interface ApiError {
  error: string;
}
