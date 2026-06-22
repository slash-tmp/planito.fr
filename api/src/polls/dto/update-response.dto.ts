import { Type } from 'class-transformer';
import { ArrayNotEmpty, IsArray, ValidateNested } from 'class-validator';

import { RespondToPollDtoResponse } from './respond-to-poll.dto';

export class UpdateResponseDto {
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested()
  @Type(() => RespondToPollDtoResponse)
  responses: RespondToPollDtoResponse[];
}
