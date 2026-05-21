import { AppException } from './app.exception';

export class BadRequestException extends AppException {
  constructor(message = 'Bad request') {
    super(message, 'BAD_USER_INPUT');
  }
}
