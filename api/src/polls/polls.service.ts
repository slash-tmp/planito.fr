import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { sortBy, uniqBy } from 'lodash';

import { MailerService } from '../mailer/mailer.service';
import { AdminPoll } from './dto/admin-poll.dto';
import { CreatePollDto } from './dto/create-poll.dto';
import { PublicPoll } from './dto/public-poll.dto';
import {
  RespondToPollDto,
  RespondToPollDtoResponse,
} from './dto/respond-to-poll.dto';
import { UpdatePollDto, UpdatePollDtoChoice } from './dto/update-poll.dto';
import { UpdateResponseDto } from './dto/update-response.dto';
import { ChoiceDoesNotExistError } from './errors';
import { CannotChangeChoiceDateError } from './errors/cannot-change-choice-date.error';
import { DuplicateChoiceResponseError } from './errors/duplicate-choice-response.error';
import {
  Poll,
  Poll as RawPoll,
  PollRepository,
  Respondent,
} from './repositories/poll.repository';
import { RespondentJwtPayload } from './respondent-jwt-payload';

@Injectable()
export class PollsService {
  constructor(
    private readonly pollRepository: PollRepository,
    private readonly mailerService: MailerService,
    private readonly config: ConfigService,
    private readonly jwt: JwtService,
  ) {}

  async createPoll(data: CreatePollDto): Promise<AdminPoll> {
    const poll = await this.pollRepository.create(data);
    return this.rawPollToAdminPoll(poll);
  }

  async sendSuccessfulPollCreationEmail(poll: AdminPoll): Promise<void> {
    const websiteBaseUrl = this.config.get('WEBSITE_BASE_URL');
    const adminUrl = `${websiteBaseUrl}/poll/admin/${poll.adminUid}`;

    const subject = 'Accéder à votre sondage';
    const text = `Vous venez de créer le sondage « ${poll.title} ». Pour y accéder, veuillez utiliser le lien ci-après. Attention, il s’agit du lien d’administration de votre sondage 🔐 : ${adminUrl}`;

    const html = this.mailerService.renderMailTemplate('new-poll', {
      adminUrl,
      pollName: poll.title,
    });

    await this.mailerService.sendEmail(poll.adminEmail, subject, text, html);
  }

  async getAdminPoll(adminUid: string): Promise<AdminPoll | null> {
    const poll = await this.pollRepository.findByAdminUid(adminUid);
    if (!poll) return null;
    return this.rawPollToAdminPoll(poll);
  }

  private rawPollToAdminPoll(poll: RawPoll): AdminPoll {
    return {
      id: poll.id,
      createdAt: poll.createdAt,
      adminUid: poll.adminUid,
      publicUid: poll.publicUid,
      title: poll.title,
      description: poll.description,
      endDate: poll.endDate,
      hideVotes: poll.hideVotes,
      notifyOnResponse: poll.notifyOnResponse,
      adminEmail: poll.adminEmail,
      adminName: poll.adminName,
      choices: poll.choices.map((c) => ({ id: c.id, date: c.date })),
      respondents: poll.respondents.map((respondent) => ({
        id: respondent.id,
        name: respondent.name,
        responses: respondent.responses.map((response) => ({
          id: response.id,
          choiceId: response.choiceId,
          value: response.value,
        })),
      })),
    };
  }

  async getPublicPoll(publicUid: string): Promise<PublicPoll | null> {
    const poll = await this.pollRepository.findByPublicUid(publicUid);
    if (!poll) return null;
    return this.rawPollToPublicPoll(poll);
  }

  private rawPollToPublicPoll(poll: RawPoll): PublicPoll {
    return {
      id: poll.id,
      publicUid: poll.publicUid,
      title: poll.title,
      description: poll.description,
      endDate: poll.endDate,
      hideVotes: poll.hideVotes,
      adminName: poll.adminName,
      choices: poll.choices.map((c) => ({ id: c.id, date: c.date })),
      respondents: poll.hideVotes
        ? undefined
        : poll.respondents.map((respondent) => ({
            id: respondent.id,
            name: respondent.name,
            responses: respondent.responses.map((response) => ({
              id: response.id,
              choiceId: response.choiceId,
              value: response.value,
            })),
          })),
    };
  }

  public async deletePoll(adminUid: string): Promise<AdminPoll | null> {
    const deletedPoll = await this.pollRepository.deleteByAdminUid(adminUid);
    if (!deletedPoll) return null;
    return this.rawPollToAdminPoll(deletedPoll);
  }

  public async updatePoll(
    adminUid: string,
    data: UpdatePollDto,
  ): Promise<AdminPoll | null> {
    const pollToUpdate = await this.pollRepository.findByAdminUid(adminUid);

    if (!pollToUpdate) {
      return null;
    }

    // Validate updated choices
    const existingChoiceIds = pollToUpdate.choices.map((c) => c.id);
    const updatedChoices = data.choices.filter(
      (c) => c.id,
    ) as Required<UpdatePollDtoChoice>[];
    for (const updatedChoice of updatedChoices) {
      if (!existingChoiceIds.includes(updatedChoice.id)) {
        throw new ChoiceDoesNotExistError(updatedChoice.id);
      }

      const existingChoice = pollToUpdate.choices.find(
        (c) => c.id === updatedChoice.id,
      );
      if (
        existingChoice &&
        existingChoice.date.getTime() !== updatedChoice.date.getTime()
      ) {
        throw new CannotChangeChoiceDateError(
          existingChoice.id,
          existingChoice.date,
          updatedChoice.date,
        );
      }
    }

    const updatedPoll = await this.pollRepository.updateByAdminUid(
      adminUid,
      data,
    );
    if (!updatedPoll) return null;
    return this.rawPollToAdminPoll(updatedPoll);
  }

  async getPollsByEmail(adminEmail: string): Promise<AdminPoll[]> {
    const polls = await this.pollRepository.findManyByAdminEmail(adminEmail);
    return polls.map(this.rawPollToAdminPoll);
  }

  async sendPollListByEmail(to: string, polls: AdminPoll[]): Promise<void> {
    const websiteBaseUrl = this.config.get('WEBSITE_BASE_URL');

    const getPollLine = (poll: AdminPoll) => {
      const adminLink = `${websiteBaseUrl}/poll/admin/${poll.adminUid}`;
      return `- ${poll.title} : ${adminLink}`;
    };

    const sortedPolls = sortBy(polls, 'createdAt');

    const subject = `Liste de vos sondages`;
    const text = `Vous avez demandé la liste des sondages pour l’adresse email « ${to} ». Voici la liste des sondages créés avec cette adresse email. Attention, il s’agit des liens d’administration des sondages 🔐 :
${sortedPolls.map(getPollLine).join('\n')}`;

    const html = this.mailerService.renderMailTemplate('poll-list', {
      emailAddress: to,
      polls: sortedPolls.map((p) => ({
        title: p.title,
        adminUrl: `${websiteBaseUrl}/poll/admin/${p.adminUid}`,
      })),
    });

    await this.mailerService.sendEmail(to, subject, text, html);
  }

  async addResponseToPoll(
    publicUid: string,
    body: RespondToPollDto,
  ): Promise<{ poll: RawPoll; respondent: Respondent }> {
    const poll = await this.pollRepository.findByPublicUid(publicUid);
    if (!poll) {
      throw new Error('Poll not found');
    }

    this.validateResponses(poll, body.responses);

    const respondent = await this.pollRepository.addRespondent(publicUid, body);

    return { poll, respondent };
  }

  async updateResponseToPoll(
    publicUid: string,
    respondentId: number,
    body: UpdateResponseDto,
  ) {
    const poll = await this.pollRepository.findByPublicUid(publicUid);
    if (!poll) {
      throw new Error('Poll not found');
    }

    this.validateResponses(poll, body.responses);

    const respondent = await this.pollRepository.updateRespondent(
      publicUid,
      respondentId,
      body,
    );

    return { poll, respondent };
  }

  private validateResponses(poll: Poll, responses: RespondToPollDtoResponse[]) {
    // Check only choices from poll are present
    const availableChoiceIds = poll.choices.map((choice) => choice.id);
    responses.forEach((response) => {
      if (!availableChoiceIds.includes(response.choiceId)) {
        throw new ChoiceDoesNotExistError(response.choiceId);
      }
    });

    // Check there are no duplicate choices
    if (uniqBy(responses, 'choiceId').length !== responses.length) {
      throw new DuplicateChoiceResponseError();
    }
  }

  async sendNewResponseEmail(poll: RawPoll, respondent: Respondent) {
    const websiteBaseUrl = this.config.get('WEBSITE_BASE_URL');

    const adminUrl = `${websiteBaseUrl}/poll/admin/${poll.adminUid}`;

    const subject = `Nouvelle réponse à votre sondage "${poll.title}"`;
    const text = `Une nouvelle réponse a été soumise par ${respondent.name}.

Pour accéder à toutes les réponses de ce sondage, vous pouvez utiliser le lien ci-après. Attention, il s’agit du lien d’administration de votre sondage 🔐 : ${adminUrl}`;

    const html = this.mailerService.renderMailTemplate('new-answer', {
      pollName: poll.title,
      adminUrl,
      respondentName: respondent.name,
    });

    await this.mailerService.sendEmail(poll.adminEmail, subject, text, html);
  }

  generateRespondentToken(respondentId: number): Promise<string> {
    const payload: RespondentJwtPayload = { sub: respondentId };
    return this.jwt.signAsync(payload);
  }
}
