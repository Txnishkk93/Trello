/**
 * Operational error carrying an HTTP status code.
 * Throw this anywhere in a service/controller and the central error
 * middleware will turn it into a clean JSON response with the right
 * status code — no more repeating try/catch + res.status().json() everywhere.
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational = true;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace?.(this, this.constructor);
  }

  static badRequest(message: string) {
    return new AppError(message, 400);
  }
  static unauthorized(message = "Unauthorized") {
    return new AppError(message, 401);
  }
  static forbidden(message = "Forbidden") {
    return new AppError(message, 403);
  }
  static notFound(message = "Not found") {
    return new AppError(message, 404);
  }
  static conflict(message: string) {
    return new AppError(message, 409);
  }
}
