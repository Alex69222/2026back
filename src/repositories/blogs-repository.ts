import { IBlogModel, ICreateBlogModel } from "../types/blog-model";
import { INormalizedQparams } from "../utils/qpNormalizer";
import { blogsCollection } from "./db";

export const blogsRepository = {
  async addBlog(blogInputModel: IBlogModel): Promise<IBlogModel> {
    const blog: IBlogModel = {
      ...blogInputModel,
      id: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      isMembership: false,
    };
    await blogsCollection.insertOne(blog);
    const tempBlog = blog as any;
    delete tempBlog._id;
    return blog;
  },

  async updateBlog(
    id: string,
    blogInputModel: ICreateBlogModel,
  ): Promise<boolean> {
    const result = await blogsCollection.updateOne(
      { id },
      {
        $set: {
          name: blogInputModel.name,
          description: blogInputModel.description,
          websiteUrl: blogInputModel.websiteUrl,
        },
      },
    );

    return result.matchedCount === 1;
  },
  async deleteBlogById(id: string): Promise<boolean> {
    const result = await blogsCollection.deleteOne({ id });

    return result.deletedCount === 1;
  },

  async deleteBlogs(): Promise<boolean> {
    const result = await blogsCollection.deleteMany({});
    return result.acknowledged;
  },
};
