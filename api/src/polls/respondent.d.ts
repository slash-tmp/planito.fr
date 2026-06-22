import { type Request as BaseRequest } from 'express';

declare module 'express' {
  export interface Request extends BaseRequest {
    respondentId?: number;
  }
}
