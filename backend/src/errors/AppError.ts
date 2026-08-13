export type ErrorCode =
  | "VALIDATION_ERROR"
  | "NOT_FOUND"
  | "SKILL_MISMATCH"
  | "INVALID_STATUS_TRANSITION"
  | "SUBTASKS_INCOMPLETE"
  | "INTERNAL_ERROR";

export class AppError extends Error {
  readonly statusCode: number;
  readonly code: ErrorCode;
  readonly details?: unknown;

  constructor(statusCode: number, code: ErrorCode, message: string, details?: unknown) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }

  static badRequest(message: string, details?: unknown): AppError {
    return new AppError(400, "VALIDATION_ERROR", message, details);
  }

  static notFound(message: string): AppError {
    return new AppError(404, "NOT_FOUND", message);
  }

  static skillMismatch(message: string): AppError {
    return new AppError(409, "SKILL_MISMATCH", message);
  }

  static invalidTransition(message: string): AppError {
    return new AppError(409, "INVALID_STATUS_TRANSITION", message);
  }

  static subtasksIncomplete(message: string): AppError {
    return new AppError(409, "SUBTASKS_INCOMPLETE", message);
  }
}
