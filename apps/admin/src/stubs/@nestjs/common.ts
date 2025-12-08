// Empty stub for @nestjs/common - backend-only module
export const Logger = class {
  constructor(context?: string) {}
  log(...args: any[]) {}
  error(...args: any[]) {}
  warn(...args: any[]) {}
  debug(...args: any[]) {}
  verbose(...args: any[]) {}
};

// HttpStatus enum stub
export enum HttpStatus {
  OK = 200,
  CREATED = 201,
  ACCEPTED = 202,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  INTERNAL_SERVER_ERROR = 500,
}

export default {};

