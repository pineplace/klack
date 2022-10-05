import { RecordMode, RecordState } from "./enums";

interface Request {
  recordMode?: RecordMode;
  recordState?: RecordState;
  url?: string;
}

interface Response {
  success: boolean;
}

export { Request, Response };
