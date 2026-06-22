import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';
import { UidGenerator } from '../../uid-generator';
import { CreatePollDto } from '../dto/create-poll.dto';
import { RespondToPollDto } from '../dto/respond-to-poll.dto';
import { UpdatePollDto } from '../dto/update-poll.dto';
import { UpdateResponseDto } from '../dto/update-response.dto';
import { PublicPollNotFoundError } from '../errors/public-poll-not-found.error';
import { Poll, PollRepository, Respondent } from './poll.repository';

const POLL_INCLUDE = {
  choices: true,
  respondents: {
    include: {
      responses: true,
    },
  },
} as const;

@Injectable()
export class PrismaPollRepository implements PollRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly uidGenerator: UidGenerator,
  ) {}

  public async create(data: CreatePollDto): Promise<Poll> {
    const poll = await this.prisma.poll.create({
      data: {
        adminUid: this.uidGenerator(),
        publicUid: this.uidGenerator(),

        title: data.title,
        description: data.description,

        endDate: data.endDate,
        hideVotes: data.hideVotes,
        notifyOnResponse: data.notifyOnResponse,

        adminName: data.adminName,
        adminEmail: data.adminEmail,

        choices: {
          createMany: {
            data: data.choices.map((c) => ({ date: c.date })),
          },
        },
      },
      include: POLL_INCLUDE,
    });

    return poll;
  }

  public async findByAdminUid(uid: string): Promise<Poll | null> {
    const poll = await this.prisma.poll.findUnique({
      where: { adminUid: uid },
      include: POLL_INCLUDE,
    });

    return poll;
  }

  public async findByPublicUid(uid: string): Promise<Poll | null> {
    const poll = await this.prisma.poll.findUnique({
      where: { publicUid: uid },
      include: POLL_INCLUDE,
    });

    return poll;
  }

  public async findManyByAdminEmail(adminEmail: string): Promise<Poll[]> {
    const polls = await this.prisma.poll.findMany({
      where: {
        adminEmail: {
          equals: adminEmail,
          mode: 'insensitive',
        },
      },
      include: POLL_INCLUDE,
    });

    return polls;
  }

  public async deleteByAdminUid(adminUid: string): Promise<Poll | null> {
    try {
      const deletedPoll = await this.prisma.poll.delete({
        where: { adminUid },
        include: POLL_INCLUDE,
      });

      return deletedPoll;
    } catch (e) {
      // record not found
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2025'
      ) {
        return null;
      }
      throw e;
    }
  }

  public async updateByAdminUid(
    adminUid: string,
    data: UpdatePollDto,
  ): Promise<Poll> {
    const keptChoiceIds = data.choices.filter((c) => c.id).map((c) => c.id!);
    const newChoices = data.choices.filter((c) => !c.id);
    const updatedChoices = data.choices.filter((c) => c.id);

    const updatedPoll = await this.prisma.poll.update({
      where: { adminUid },
      data: {
        title: data.title,
        description: data.description ?? null,

        endDate: data.endDate ?? null,
        hideVotes: data.hideVotes,
        notifyOnResponse: data.notifyOnResponse,

        adminName: data.adminName ?? null,

        choices: {
          deleteMany: {
            id: {
              notIn: keptChoiceIds,
            },
          },
          createMany: {
            data: newChoices.map((c) => ({ date: c.date })),
          },
          updateMany: updatedChoices.map((c) => ({
            where: { id: c.id },
            data: { date: c.date },
          })),
        },
      },
      include: POLL_INCLUDE,
    });

    return updatedPoll ?? null;
  }

  public async addRespondent(
    publicUid: string,
    response: RespondToPollDto,
  ): Promise<Respondent> {
    try {
      const respondent = await this.prisma.respondent.create({
        data: {
          poll: { connect: { publicUid } },
          name: response.respondentName,
          responses: {
            createMany: {
              data: response.responses.map((r) => ({
                value: r.value,
                choiceId: r.choiceId,
              })),
            },
          },
        },
        include: { responses: true },
      });

      return respondent;
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2025'
      ) {
        throw new PublicPollNotFoundError(publicUid);
      }
      throw e;
    }
  }

  public async updateRespondent(
    publicUid: string,
    respondentId: number,
    response: UpdateResponseDto,
  ): Promise<Respondent> {
    try {
      await this.prisma.$transaction(
        response.responses.map((r) =>
          this.prisma.response.upsert({
            where: {
              choiceId_respondentId: {
                choiceId: r.choiceId,
                respondentId: respondentId,
              },
            },
            update: { value: r.value },
            create: {
              respondentId: respondentId,
              choiceId: r.choiceId,
              value: r.value,
            },
          }),
        ),
      );
      return this.prisma.respondent.findFirstOrThrow({
        where: { id: respondentId },
        include: { responses: true },
      });
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2025'
      ) {
        throw new PublicPollNotFoundError(publicUid);
      }
      throw e;
    }
  }
}
