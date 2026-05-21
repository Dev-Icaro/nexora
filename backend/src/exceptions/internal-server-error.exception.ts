import { AppException } from './app.exception';

export class InternalServerErrorException extends AppException {
  constructor(message = 'Internal server error') {
    super(message, 'INTERNAL_SERVER_ERROR');
  }
}
