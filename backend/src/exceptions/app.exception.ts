export class AppException extends Error {
  constructor(
    message: string,
    public readonly statusCode: number = 400,
  ) {
    super(message);
    this.statusCode = statusCode;
    this.name = this.constructor.name;
  }
}
