import { ICreatePostModel, IPostModel } from "../types/post-model";
import { postsCollection } from "./db";

export const postsRepository = {
  async addPost(postData: IPostModel): Promise<string | false> {
    const post = { ...postData, id: new Date().toISOString() };
    await postsCollection.insertOne(post);
    const tempPost = post as any;
    delete tempPost._id;

    return post.id;
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
