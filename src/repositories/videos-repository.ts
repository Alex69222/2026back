import { addDays } from "date-fns/addDays";
import {
  ICreateVideoInputModel,
  IUpdateVideoInputModel,
  IVideo,
} from "../types/video-model";

const videos: Array<IVideo> = [];

export const videosRepository = {
  getVideos() {
    return videos;
  },
  getVideoById(id: number): IVideo | undefined {
    const video = videos.find((v) => v.id === id);
    return video;
  },
  addVideo(videoInputModel: ICreateVideoInputModel): IVideo {
    const date = new Date();
    const video: IVideo = {
      ...videoInputModel,
      id: +date,
      canBeDownloaded: false,
      minAgeRestriction: null,
      createdAt: date.toISOString(),
      publicationDate: addDays(date, 1).toISOString(),
    };
    videos.push(video);
    return video;
  },
  updateVideo(id: number, updateVideoModel: IUpdateVideoInputModel): Boolean {
    const video = videos.find((v) => v.id === id);
    if (!video) return false;

    video.title = updateVideoModel.title;
    video.author = updateVideoModel.author;
    video.availableResolutions = updateVideoModel.availableResolutions;
    video.canBeDownloaded = updateVideoModel.canBeDownloaded;
    video.minAgeRestriction = updateVideoModel.minAgeRestriction;
    video.publicationDate = updateVideoModel.publicationDate;
    return true;
  },
  deleteVideoBy(id: number): Boolean {
    const videoIndex = videos.findIndex((v) => v.id === id);
    if (videoIndex === -1) return false;
    videos.splice(videoIndex, 1);
    return true;
  },
  clearVideos() {
    videos.length = 0;
  },
};
