export enum VideoResulutionsEnum {
  P144 = "P144",
  P240 = "P240",
  P360 = "P360",
  P480 = "P480",
  P720 = "P720",
  P1080 = "P1080",
  P1440 = "P1440",
  P2160 = "P2160",
}
export interface IVideo {
  id: number;
  title: string;
  author: string;
  canBeDownloaded: boolean;
  minAgeRestricion: number | null;
  createdAt: string; // $date-time
  publicationDate: string; // $date-time
  availableResolutions: Array<VideoResulutionsEnum>;
}

export interface ICreateVideoInputModel {
  title: string; // maxLength 40
  author: string; // maxLength 20
  availableResolutions: Array<VideoResulutionsEnum>; // at least 1
}

export interface IUpdateVideoInputModel {
  title: string; // maxLength 40
  author: string; // maxLength 20
  availableResolutions: Array<VideoResulutionsEnum>; // at least 1
  canBeDownloaded: boolean;
  minAgeRestricion: number | null; // min 1, max 18
  publicationDate: string; // $date-time
}
