export class AppError extends Error {
  public readonly statusCode: number
  public readonly isOperational: boolean
  public readonly code?: string
  public readonly errors?: Array<{ field: string; message: string }>

  constructor(
    message: string,
    statusCode: number,
    isOperational = true,
    code?: string,
    errors?: Array<{ field: string; message: string }>,
  ) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = isOperational
    this.code = code
    this.errors = errors
    Object.setPrototypeOf(this, AppError.prototype)
    Error.captureStackTrace(this, this.constructor)
  }

  static badRequest(message: string, code?: string): AppError {
    return new AppError(message, 400, true, code)
  }

  static unauthorized(message = 'Unauthorized', code?: string): AppError {
    return new AppError(message, 401, true, code)
  }

  static forbidden(message = 'Forbidden', code?: string): AppError {
    return new AppError(message, 403, true, code)
  }

  static notFound(message = 'Resource not found', code?: string): AppError {
    return new AppError(message, 404, true, code)
  }

  static conflict(message: string, code?: string): AppError {
    return new AppError(message, 409, true, code)
  }

  static unprocessable(
    message = 'Validation failed',
    code = 'VALIDATION_ERROR',
    errors?: Array<{ field: string; message: string }>,
  ): AppError {
    return new AppError(message, 422, true, code, errors)
  }

  static tooMany(message = 'Too many requests', code?: string): AppError {
    return new AppError(message, 429, true, code)
  }

  static internal(message = 'Internal server error', code?: string): AppError {
    return new AppError(message, 500, false, code)
  }
}
