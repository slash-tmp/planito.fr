import type { components, paths } from "../date-poll-api";

// Form data to create a new poll
export interface CreatePollFormData {
  title: string;
  description: string | null;
  choices: { date: string; time: string }[];
  hideVotes: boolean;
  endDate: string | null;
  notifyOnResponse: boolean;
  adminName: string | null;
  adminEmail: string;
}

// Selected properties of `CreatePollFormData`
export type StepPayload = Partial<CreatePollFormData>;

export interface UpdatePollFormData {
  title: string;
  description: string | null;
  choices: { id?: number; date: string; time: string }[];
  hideVotes: boolean;
  endDate: string | null;
  notifyOnResponse: boolean;
  adminName: string | null;
}

export interface UpdatePollResponseFormData {
  choiceId: number;
  respondentId: number;
  value: Response;
}

export interface VotePollFormData {
  respondentName: string;
  responses: { choiceId: number; value: Response }[];
}

// GET /polls/admin/<admin_uid>
export type AdminPollApiResponse =
  paths["/polls/admin/{admin_uid}"]["get"]["responses"]["200"]["content"]["application/json"];

// GET /polls/<public_uid>
export type PollApiResponse =
  paths["/polls/{public_uid}"]["get"]["responses"]["200"]["content"]["application/json"];

// POST /polls
export type CreatePollApiRequest =
  paths["/polls"]["post"]["requestBody"]["content"]["application/json"];
export type CreatePollApiResponse =
  paths["/polls"]["post"]["responses"]["201"]["content"]["application/json"];

export type UpdatePollApiRequest =
  paths["/polls/admin/{admin_uid}"]["put"]["requestBody"]["content"]["application/json"];
export type UpdatePollApiResponse =
  paths["/polls/admin/{admin_uid}"]["put"]["responses"]["200"]["content"]["application/json"];
export type UpdatePollResponseApiResponse =
  paths["/polls/admin/{admin_uid}/vote"]["put"]["responses"]["200"]["content"]["application/json"];

// Misc
export enum Response {
  YES = "YES",
  MAYBE = "MAYBE",
  NO = "NO",
}

export type Respondent = components["schemas"]["Respondent"];
