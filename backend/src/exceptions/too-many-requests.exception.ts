import { AppException } from './app.exception';

export class TooManyRequestsException extends AppException {
  constructor(message = 'Too many requests, please try again later.') {
    super(message, 'RATE_LIMITED');
  }
}
