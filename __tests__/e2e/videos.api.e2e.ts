/// <reference types="jest" />
import request from "supertest";
import { app, RouterPaths } from "../../src/index";

import { videosTestManager } from "../managers/videosTestManager";
import { HTTP_STATUSES } from "../../src/utils/httpStatuses";
import {
  ICreateVideoInputModel,
  IUpdateVideoInputModel,
  IVideo,
  VideoResulutionsEnum,
} from "../../src/types/video-model";

let video: IVideo;

describe("/videos-router", () => {
  beforeAll(async () => {
    await request(app).delete(RouterPaths.test_delete);
  });

  it("should return 200 and empty array", async () => {
    await request(app).get(RouterPaths.videos).expect(200, []);
  });

  it("should return 404 for not existing video", async () => {
    await request(app)
      .get(RouterPaths.videos + "/999")
      .expect(404);
  });

  it("should create video with correct input data", async () => {
    const inputData: ICreateVideoInputModel = {
      title: "best video",
      author: "best author",
      availableResolutions: [VideoResulutionsEnum.P2160],
    };

    const { createdEntity } = await videosTestManager.createVideo({
      inputData,
    });

    video = createdEntity!;
  });

  it("shouldn't create video with incorrect title length", async () => {
    const inputData: ICreateVideoInputModel = {
      title: "b".repeat(41),
      author: "best author",
      availableResolutions: [VideoResulutionsEnum.P2160],
    };

    await videosTestManager.createVideo({
      inputData,
      expectedStatusCode: HTTP_STATUSES.BAD_REQUEST_400,
    });
  });
  it("shouldn't create video with incorrect author length", async () => {
    const inputData: ICreateVideoInputModel = {
      title: "b".repeat(15),
      author: "b".repeat(21),
      availableResolutions: [VideoResulutionsEnum.P2160],
    };

    await videosTestManager.createVideo({
      inputData,
      expectedStatusCode: HTTP_STATUSES.BAD_REQUEST_400,
    });
  });
  it("shouldn't create video with invalid availableResolutions", async () => {
    const inputData: ICreateVideoInputModel = {
      title: "video",
      author: "author",
      availableResolutions: [],
    };

    await videosTestManager.createVideo({
      inputData,
      expectedStatusCode: HTTP_STATUSES.BAD_REQUEST_400,
    });
    await videosTestManager.createVideo({
      inputData: {
        ...inputData,
        availableResolutions: ["invalid Resolution" as VideoResulutionsEnum],
      },
      expectedStatusCode: HTTP_STATUSES.BAD_REQUEST_400,
    });
  });

  it("should return 400 when attempting to create video with invalid data", async () => {
    const inputData = {};
    const { createdEntity } = await videosTestManager.createVideo({
      inputData: inputData as ICreateVideoInputModel,
      expectedStatusCode: HTTP_STATUSES.BAD_REQUEST_400,
    });

    expect(createdEntity).toBeUndefined();
  });
  it("should return video by id", async () => {
    await request(app)
      .get(`${RouterPaths.videos}/${video.id}`)
      .expect(200, video);
  });

  it("should update video by id", async () => {
    const updatedData: IUpdateVideoInputModel = {
      title: "updated title",
      author: "updated author",
      canBeDownloaded: true,
      minAgeRestriction: 18,
      publicationDate: new Date().toISOString(),
      availableResolutions: [
        VideoResulutionsEnum.P1080,
        VideoResulutionsEnum.P1440,
      ],
    };

    const result = await request(app)
      .put(`${RouterPaths.videos}/${video.id}`)
      .send(updatedData);

    expect(result.status).toBe(204);

    const updatedVideoResult = await request(app).get(
      `${RouterPaths.videos}/${video.id}`,
    );
    expect(updatedVideoResult.body.title).toBe(updatedData.title);
    expect(updatedVideoResult.body.author).toBe(updatedData.author);
    expect(updatedVideoResult.body.canBeDownloaded).toBe(
      updatedData.canBeDownloaded,
    );
    expect(updatedVideoResult.body.minAgeRestriction).toBe(
      updatedData.minAgeRestriction,
    );
    expect(updatedVideoResult.body.publicationDate).toBe(
      updatedData.publicationDate,
    );

    expect(updatedVideoResult.body.availableResolutions).toStrictEqual(
      updatedData.availableResolutions,
    );
    video = { ...video, ...updatedData };
  });
  it("shouldn't update video by id whith invalid data", async () => {
    const updatedData: IUpdateVideoInputModel = {
      title: "updated title",
      author: "updated author",
      canBeDownloaded: true,
      minAgeRestriction: 18,
      publicationDate: new Date().toISOString(),
      availableResolutions: [
        VideoResulutionsEnum.P1080,
        VideoResulutionsEnum.P1440,
      ],
    };

    await request(app)
      .put(`${RouterPaths.videos}/${video.id}`)
      .send({ ...updatedData, publicationDate: "invalid date string" })
      .expect(HTTP_STATUSES.BAD_REQUEST_400);

    await request(app)
      .put(`${RouterPaths.videos}/${video.id}`)
      .send({ ...updatedData, publicationDate: new Date().toLocaleString() })
      .expect(HTTP_STATUSES.BAD_REQUEST_400);
    await request(app)
      .put(`${RouterPaths.videos}/${video.id}`)
      .send({
        ...updatedData,
        publicationDate: new Date().toLocaleDateString(),
      })
      .expect(HTTP_STATUSES.BAD_REQUEST_400);

    await request(app)
      .put(`${RouterPaths.videos}/${video.id}`)
      .send({ ...updatedData, canBeDownloaded: undefined })
      .expect(HTTP_STATUSES.BAD_REQUEST_400);

    await request(app)
      .put(`${RouterPaths.videos}/${video.id}`)
      .send({ ...updatedData, minAgeRestriction: 22 })
      .expect(HTTP_STATUSES.BAD_REQUEST_400);
    await request(app)
      .put(`${RouterPaths.videos}/${video.id}`)
      .send({ ...updatedData, minAgeRestriction: "best age" })
      .expect(HTTP_STATUSES.BAD_REQUEST_400);
  });

  it("should delete video by id", async () => {
    await request(app).delete(`${RouterPaths.videos}/${video.id}`).expect(204);
    await request(app).delete(`${RouterPaths.videos}/${video.id}`).expect(404);
    await request(app).get(`${RouterPaths.videos}/${video.id}`).expect(404);
    await request(app).get(RouterPaths.videos).expect(200, []);
  });
});
