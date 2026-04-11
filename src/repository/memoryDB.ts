import { IVideo } from "../features/videos/video-model";
import { IAuthor } from "../features/authors/author-model";
import { IAuthorVideoBinging } from "../features/authors-videos-bindings/authors-videos-bindings-model";

export interface IDB {
  videos: Array<IVideo>;
  authors: Array<IAuthor>;
  authorVideoBindings: Array<IAuthorVideoBinging>;
}

export const dataBase: IDB = {
  videos: [],
  authors: [],
  authorVideoBindings: [],
};
