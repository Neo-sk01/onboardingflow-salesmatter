export type Contact = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role?: string;
};

export type Checklist = {
  companyDetails: boolean;
  leadsImported: boolean;
  promptsAdded: boolean;
  leadsReviewed: boolean;
  emailsApproved: boolean;
};

export type Client = {
  id: string;
  name: string;
  industry?: string;
  status?: "new" | "active" | "on-hold";
  contacts: Contact[];
  checklist: Checklist;
};

export type PromptTemplate = {
  id: string;
  label: string;
  content: string;
  tags: string[];
  createdAt: string;
};

export type Lead = {
  id: string;
  clientId: string;
  name: string;
  title?: string;
  company?: string;
  email?: string;
  linkedin?: string;
  website?: string;
  templates: PromptTemplate[];
  approved?: boolean;
};

export type ChecklistItem = {
  id: string;
  label: string;
  checked: boolean;
};
