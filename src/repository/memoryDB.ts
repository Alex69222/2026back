import { IVideo } from "../types/models/video-model";

interface IDB {
  videos: Array<IVideo>;
}
export const dataBase: IDB = {
  videos: [],
};
