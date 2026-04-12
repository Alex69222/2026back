import { app, RouterPaths } from "../../src";
import request from "supertest";
import { HTTP_STATUSES, HttpStatusType } from "../../src/utils/httpStatuses";
import { ICreateVideoInputModel, IVideo } from "../../src/types/video-model";

export const videosTestManager = {
  async createVideo(
    inputData: ICreateVideoInputModel,
    expectedStatusCode: HttpStatusType = HTTP_STATUSES.CREATED_201,
  ) {
    const response = await request(app)
      .post(RouterPaths.videos)
      .send(inputData);
    expect(response.status).toBe(expectedStatusCode);

    let createdEntity;

    if (expectedStatusCode === HTTP_STATUSES.CREATED_201) {
      createdEntity = response.body as IVideo;
      expect(response.body.title).toBe(inputData.title);
      expect(response.body.id).toEqual(expect.any(Number));
    }

    return { response, createdEntity };
  },
};
