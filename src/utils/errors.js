// Custom error class
export class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

// Error factory functions
export const badRequest = (message = 'Bad Request') => {
  return new AppError(message, 400);
};

export const unauthorized = (message = 'Unauthorized') => {
  return new AppError(message, 401);
};

export const forbidden = (message = 'Forbidden') => {
  return new AppError(message, 403);
};

export const notFound = (message = 'Resource not found') => {
  return new AppError(message, 404);
};

export const conflict = (message = 'Conflict') => {
  return new AppError(message, 409);
};

export const unprocessableEntity = (message = 'Unprocessable Entity') => {
  return new AppError(message, 422);
};

export const internalServerError = (message = 'Internal Server Error') => {
  return new AppError(message, 500);
};
