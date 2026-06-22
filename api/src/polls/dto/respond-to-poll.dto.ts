import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsString,
  ValidateNested,
} from 'class-validator';

export enum RespondToPollDtoResponseValue {
  YES = 'YES',
  NO = 'NO',
  MAYBE = 'MAYBE',
}

export class RespondToPollDtoResponse {
  @IsInt()
  choiceId: number;

  @IsString()
  @IsIn(Object.values(RespondToPollDtoResponseValue))
  value: RespondToPollDtoResponseValue;
}

export class RespondToPollDto {
  /**
   * @example "Bob"
   */
  @IsString()
  @IsNotEmpty()
  respondentName: string;

  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested()
  @Type(() => RespondToPollDtoResponse)
  responses: RespondToPollDtoResponse[];
}
