export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;
  public readonly errors?: unknown[];

  constructor(
    statusCode: number,
    message: string,
    code?: string,
    errors?: unknown[],
  );
  constructor(
    message: string,
    statusCode: number,
    code: string,
    isOperational?: boolean,
    errors?: unknown[],
  );
  constructor(
    arg1: string | number,
    arg2: string | number,
    arg3 = "APP_ERROR",
    arg4: boolean | unknown[] = true,
    arg5?: unknown[],
  ) {
    const isStatusFirst = typeof arg1 === "number";
    const message = isStatusFirst ? String(arg2) : String(arg1);
    const statusCode = isStatusFirst ? arg1 : Number(arg2);
    const code = arg3;
    const isOperational = Array.isArray(arg4) ? true : arg4;
    const errors = Array.isArray(arg4) ? arg4 : arg5;

    super(message);

    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;
    this.errors = errors;

    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}
