import { IBlogModel, ICreateBlogModel } from "../types/blog-model";
import { blogsCollection } from "./db";

export const blogsRepository = {
  async getBlogs(): Promise<Array<IBlogModel>> {
    const blogs = await blogsCollection
      .find({}, { projection: { _id: 0 } })
      .toArray();
    return blogs;
  },

  async getBlogById(id: string): Promise<IBlogModel | null> {
    const blog = await blogsCollection.findOne(
      { id },
      { projection: { _id: 0 } },
    );
    return blog;
  },

  async addBlog(blogInputModel: ICreateBlogModel): Promise<IBlogModel> {
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
