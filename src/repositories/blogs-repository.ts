import { IBlogModel, ICreateBlogModel } from "../types/blog-model";
import { INormalizedQparams } from "../utils/qpNormalizer";
import { blogsCollection } from "./db";

export const blogsRepository = {
  async getBlogsCount(
    filter?: Record<string, string | number>,
  ): Promise<number> {
    const queryFilter = filter?.name
      ? { name: { $regex: filter.name.toString(), $options: "i" } }
      : {};
    const blogsCount = await blogsCollection.countDocuments(queryFilter);

    return blogsCount;
  },

  async getBlogs(qp: INormalizedQparams): Promise<Array<IBlogModel>> {
    const filter = qp.searchNameTerm
      ? { name: { $regex: qp.searchNameTerm, $options: "i" } }
      : {};
    const blogs = await blogsCollection
      .find(filter, { projection: { _id: 0 } })
      .limit(qp.pageSize)
      .skip((qp.pageNumber - 1) * qp.pageSize)
      .sort({ [qp.sortBy]: qp.sortDirection })
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
