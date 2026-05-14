import { AppException } from './app.exception';

export class InternalServerErrorException extends AppException {
  constructor(message = 'Internal server error') {
    super(message, 500);
  }
}
