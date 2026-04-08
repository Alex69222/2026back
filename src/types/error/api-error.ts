export interface IFieldError {
  message: string | null;
  field: string | null;
}

export interface IAPIErrorResult {
  errorsMessages: Array<IFieldError> | null;
}
