import { IsIn } from 'class-validator';

export class UpdatePollResponseDto {
  /**
   * @example 1
   */
  choiceId: number;

  /**
   * @example 2
   */
  responseId: number;

  /**
   * @example 3
   */
  respondentId: number;

  /**
   * @example "YES"
   */
  @IsIn(['YES', 'MAYBE', 'NO'])
  value: 'YES' | 'MAYBE' | 'NO';
}
