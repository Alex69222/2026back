import { ObjectId } from "mongodb";
import { ICreatePostModel, IPostModel } from "../types/post-model";
import { blogsRepository } from "./blogs-repository";
import { postsCollection } from "./db";

export const postsRepository = {
  async getPosts(): Promise<Array<IPostModel>> {
    const posts = await postsCollection
      .find({}, { projection: { _id: 0 } })
      .toArray();
    return posts;
  },

  async getPostById(id: string): Promise<IPostModel | null> {
    const post = await postsCollection.findOne(
      { id },
      { projection: { _id: 0 } },
    );
    return post;
  },

  async addPost(post: IPostModel): Promise<IPostModel | false> {
    await postsCollection.insertOne(post);
    const tempPost = post as any;
    delete tempPost._id;

    return post;
  },

  async updatePost(
    id: string,
    postInputModel: ICreatePostModel,
    blogName: string,
  ): Promise<boolean> {
    const result = await postsCollection.updateOne(
      { id },
      {
        $set: {
          ...postInputModel,
          blogName,
        },
      },
    );

    return result.matchedCount === 1;
  },

  async deletePostById(id: string): Promise<boolean> {
    const result = await postsCollection.deleteOne({ id });
    return result.deletedCount === 1;
  },

  async deletePosts(): Promise<boolean> {
    const result = await postsCollection.deleteMany({});
    return result.acknowledged;
  },
};
