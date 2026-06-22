import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Post,
  Put,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Request, type Response } from 'express';

import { RESPONDENT_COOKIE } from './constants';
import { AdminPoll } from './dto/admin-poll.dto';
import { CreatePollDto } from './dto/create-poll.dto';
import { PublicPoll } from './dto/public-poll.dto';
import { RespondToPollDto } from './dto/respond-to-poll.dto';
import { SearchPollsDto } from './dto/search-polls.dto';
import { UpdatePollDto } from './dto/update-poll.dto';
import { UpdateResponseDto } from './dto/update-response.dto';
import { ChoiceDoesNotExistError } from './errors';
import { CannotChangeChoiceDateError } from './errors/cannot-change-choice-date.error';
import { PollsService } from './polls.service';
import { RespondentGuard } from './respondent.guard';

@Controller('polls')
export class PollsController {
  constructor(private readonly pollsService: PollsService) {}

  @Post()
  async createPoll(@Body() body: CreatePollDto): Promise<AdminPoll> {
    const poll = await this.pollsService.createPoll(body);

    this.pollsService.sendSuccessfulPollCreationEmail(poll);

    return poll;
  }

  @Get(':public_uid')
  async getPublicPoll(
    @Param('public_uid') publicUid: string,
  ): Promise<PublicPoll> {
    const poll = await this.pollsService.getPublicPoll(publicUid);
    if (!poll) {
      throw new NotFoundException();
    }
    return poll;
  }

  @Post(':public_uid/responses')
  async respondToPoll(
    @Param('public_uid') publicUid: string,
    @Body() body: RespondToPollDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const poll = await this.pollsService.getPublicPoll(publicUid);
    if (!poll) {
      throw new NotFoundException();
    }

    try {
      const { poll, respondent } = await this.pollsService.addResponseToPoll(
        publicUid,
        body,
      );

      // set edition cookie
      const respondentToken = await this.pollsService.generateRespondentToken(
        respondent.id,
      );
      response.cookie(RESPONDENT_COOKIE, respondentToken, {
        // the cookie is active only for current poll
        path: `/api/polls/${poll.publicUid}`,
      });

      if (poll.notifyOnResponse) {
        this.pollsService.sendNewResponseEmail(poll, respondent);
      }
    } catch (e) {
      if (e instanceof ChoiceDoesNotExistError) {
        throw new BadRequestException(e.message, { cause: e });
      }
      throw e;
    }
  }

  @Put(':public_uid/responses')
  @UseGuards(RespondentGuard)
  async updateResponse(
    @Param('public_uid') publicUid: string,
    @Body() body: UpdateResponseDto,
    @Req() req: Request,
  ) {
    const poll = await this.pollsService.getPublicPoll(publicUid);
    if (!poll) {
      throw new NotFoundException();
    }

    try {
      const { poll } = await this.pollsService.updateResponseToPoll(
        publicUid,
        req.respondentId!,
        body,
      );

      if (poll.notifyOnResponse) {
        // TODO: vote update mail
        //this.pollsService.sendNewResponseEmail(poll, respondent);
      }
    } catch (e) {
      if (e instanceof ChoiceDoesNotExistError) {
        throw new BadRequestException(e.message, { cause: e });
      }
      throw e;
    }
  }

  @Get('admin/:admin_uid')
  async getAdminPoll(@Param('admin_uid') adminUid: string): Promise<AdminPoll> {
    const poll = await this.pollsService.getAdminPoll(adminUid);
    if (!poll) {
      throw new NotFoundException();
    }
    return poll;
  }

  @Delete('admin/:admin_uid')
  async deletePoll(@Param('admin_uid') adminUid: string): Promise<void> {
    const poll = await this.pollsService.deletePoll(adminUid);
    if (!poll) {
      throw new NotFoundException();
    }
  }

  @Put('admin/:admin_uid')
  async updatePoll(
    @Param('admin_uid') adminUid: string,
    @Body() body: UpdatePollDto,
  ): Promise<AdminPoll> {
    try {
      const poll = await this.pollsService.updatePoll(adminUid, body);
      if (!poll) {
        throw new NotFoundException();
      }
      return poll;
    } catch (e) {
      if (
        e instanceof ChoiceDoesNotExistError ||
        e instanceof CannotChangeChoiceDateError
      ) {
        throw new BadRequestException(e.message, { cause: e });
      }
      throw e;
    }
  }

  @Post('find')
  @HttpCode(204)
  async requestPollListEmail(@Body() body: SearchPollsDto) {
    const polls = await this.pollsService.getPollsByEmail(body.adminEmail);
    if (polls.length > 0) {
      this.pollsService.sendPollListByEmail(body.adminEmail, polls);
    }
  }
}
