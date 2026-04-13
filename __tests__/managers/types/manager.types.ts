import { HttpStatusType } from "../../../src/utils/httpStatuses";

export interface ITestManagerCreateData<T> {
  inputData: T;
  expectedStatusCode?: HttpStatusType;
  authorizationCredentials?: string;
}
