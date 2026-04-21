import { ICreatePostModel, IPostModel } from "../types/post-model";
import { postsCollection } from "./db";
import { INormalizedQparams } from "../utils/qpNormalizer";

export const postsRepository = {
  async getPostsCount(
    filter?: Record<string, string | number>,
  ): Promise<number> {
    const queryFilter = filter || {};

    const postsCount = await postsCollection.countDocuments(queryFilter);

    return postsCount;
  },
  async getPosts(
    qp: INormalizedQparams,
    filter?: Record<string, string | number>,
  ): Promise<Array<IPostModel>> {
    const queryFilter = filter || {};
    const posts = await postsCollection
      .find(queryFilter, { projection: { _id: 0 } })
      .limit(qp.pageSize)
      .skip((qp.pageNumber - 1) * qp.pageSize)
      .sort({ [qp.sortBy]: qp.sortDirection })
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
