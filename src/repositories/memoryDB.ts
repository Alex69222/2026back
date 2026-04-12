import { IAuthor } from "../types/author-model";
import { IAuthorVideoBinging } from "../types/authors-videos-bindings-model";

export interface IDB {
  authors: Array<IAuthor>;
  authorVideoBindings: Array<IAuthorVideoBinging>;
}

export const dataBase: IDB = {
  authors: [],
  authorVideoBindings: [],
};
