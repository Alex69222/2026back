/// <reference types="jest" />

import { HTTP_STATUSES } from "./../../src/utils/httpStatuses";
import request from "supertest";
import { app, RouterPaths } from "../../src/index";
import { authorsVideosBindingTestManager } from "../managers/authorsVideosBindingsTestManager";

import { videosTestManager } from "../managers/videosTestManager";
import { authorsTestManager } from "../managers/authorsTestManager";
import { ICreateAuthorVideoBindingModel } from "../../src/types/authors-videos-bindings-model";
import {
  ICreateVideoInputModel,
  VideoResulutionsEnum,
} from "../../src/types/video-model";
import { ICreateAuthorInputModel } from "../../src/types/author-model";
import { validBasicAuthLoginPass } from "../../src/middlewares/auth-middlewares/basic-auth-middleware";

describe("/authors-videos-bingings-router", () => {
  beforeAll(async () => {
    await request(app).delete(RouterPaths.test_delete);
  });

  it("shouldn't create binding with incorrectinput data (400)", async () => {
    const data = {};
    const { response } = await authorsVideosBindingTestManager.createBinding(
      data as ICreateAuthorVideoBindingModel,
      HTTP_STATUSES.BAD_REQUEST_400,
    );
  });
  it("shouldn't create binding with unexisting video and author", async () => {
    const data: ICreateAuthorVideoBindingModel = {
      authorId: 1,
      videoId: 1,
    };
    await authorsVideosBindingTestManager.createBinding(
      data,
      HTTP_STATUSES.NOT_FOUND_404,
    );
  });

  it("should create binding", async () => {
    const videoInputData: ICreateVideoInputModel = {
      title: "test Video",
      author: "author unknown",
      availableResolutions: [VideoResulutionsEnum.P1080],
    };

    const authorInputData: ICreateAuthorInputModel = {
      name: "Alex",
    };

    const { createdEntity: createdVideo } =
      await videosTestManager.createVideo(videoInputData);
    const { createdEntity: createdAuthor } =
      await authorsTestManager.createAuthor(
        authorInputData,
        undefined,
        validBasicAuthLoginPass,
      );

    await authorsVideosBindingTestManager.createBinding({
      authorId: createdAuthor!.id,
      videoId: createdVideo!.id,
    });

    const { response } = await authorsVideosBindingTestManager.createBinding(
      {
        authorId: createdAuthor!.id,
        videoId: createdVideo!.id,
      },
      HTTP_STATUSES.BAD_REQUEST_400,
    );
  });
});
