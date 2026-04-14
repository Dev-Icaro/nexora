import { AppException } from './app.exception';

export class ConflictException extends AppException {
  constructor(message = 'Conflict') {
    super(message, 409);
  }
}
