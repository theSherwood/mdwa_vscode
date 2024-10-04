export enum LimitType {
  minutes,
  words,
}

export interface Status {
  limit: number;
  type: LimitType;
  time: number;
  words: number;
  reset: number;
  danger: boolean;
}

export const startSessionCommand = 'mdwa.startSession';
export const startSessionWithArgsCommand = 'mdwa.startSessionWithArgs';
