import AppError from "../errors/AppError";

export class JsonParseError extends AppError {
  text: string;

  constructor(message: string, text: string) {
      super(message);
      this.text = text;
  }
}

export class HttpError extends Error {
  body?: any; 
  statusCode: number;
  headers: Record<string, string>;

  constructor(message: string, statusCode: number, headers: Record<string, string>, body: any) {
      super(message);
      this.statusCode = statusCode;
      this.headers = headers;
      this.body = body;
  }
}
