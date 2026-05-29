import { GraphQLError } from 'graphql';

export class AppException extends GraphQLError {
  constructor(message: string, code: string) {
    super(message, { extensions: { code, http: { status: 200 } } });
  }
}
