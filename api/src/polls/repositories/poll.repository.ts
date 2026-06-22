import { CreatePollDto } from '../dto/create-poll.dto';
import { RespondToPollDto } from '../dto/respond-to-poll.dto';
import { UpdatePollDto } from '../dto/update-poll.dto';
import { UpdateResponseDto } from '../dto/update-response.dto';

export interface Poll {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  adminUid: string;
  publicUid: string;
  title: string;
  description: string | null;
  choices: Choice[];
  hideVotes: boolean;
  endDate: Date | null;
  notifyOnResponse: boolean;
  adminName: string | null;
  adminEmail: string;
  respondents: Respondent[];
}

export interface Choice {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  date: Date;
}

export interface Response {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  choiceId: number;
  value: 'YES' | 'MAYBE' | 'NO';
}

export interface Respondent {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  name: string;
  responses: Response[];
}

export abstract class PollRepository {
  public abstract create(data: CreatePollDto): Promise<Poll>;
  public abstract findByAdminUid(uid: string): Promise<Poll | null>;
  public abstract findByPublicUid(uid: string): Promise<Poll | null>;
  public abstract findManyByAdminEmail(adminEmail: string): Promise<Poll[]>;
  public abstract deleteByAdminUid(uid: string): Promise<Poll | null>;
  public abstract updateByAdminUid(
    uid: string,
    data: UpdatePollDto,
  ): Promise<Poll | null>;
  public abstract addRespondent(
    publicUid: string,
    response: RespondToPollDto,
  ): Promise<Respondent>;
  public abstract updateRespondent(
    publicUid: string,
    respondentId: number,
    response: UpdateResponseDto,
  ): Promise<Respondent>;
}
