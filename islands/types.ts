import { RecordMode, RecordState } from "./enums";

interface Request {
  recordMode?: RecordMode;
  recordState?: RecordState;
}

interface Response {
  success: boolean;
}

export { Request, Response };
