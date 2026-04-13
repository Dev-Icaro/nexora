import { AppException } from './app.exception';

export class NotFoundException extends AppException {
  constructor(message = 'Not found') {
    super(message, 404);
  }
}
