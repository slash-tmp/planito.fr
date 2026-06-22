import {
  CanActivate,
  ExecutionContext,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { type Request } from 'express';

import { RESPONDENT_COOKIE } from './constants';
import { PollRepository } from './repositories/poll.repository';
import { RespondentJwtPayload } from './respondent-jwt-payload';

@Injectable()
export class RespondentGuard implements CanActivate {
  constructor(
    private readonly jwt: JwtService,
    private readonly pollRepository: PollRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = request.cookies[RESPONDENT_COOKIE];
    console.log({ token });

    if (!token) {
      return false;
    }

    const payload = await this.jwt.verifyAsync<RespondentJwtPayload>(token);
    const pollId = request.params['public_uid'];
    const poll = await this.pollRepository.findByPublicUid(pollId);

    if (!poll) {
      throw new NotFoundException();
    }

    if (!poll.respondents.some((r) => r.id === payload.sub)) {
      return false;
    }

    request.respondentId = payload.sub;

    return true;
  }
}
