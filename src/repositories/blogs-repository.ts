import { IBlogModel, ICreateBlogModel } from "../types/blog-model";

const blogs: Array<IBlogModel> = [];

export const blogsRepository = {
  getBlogs() {
    return blogs;
  },

  getBlogById(id: string): IBlogModel | undefined {
    const blog = blogs.find((v) => v.id === id);
    return blog;
  },

  addBlog(blogInputModel: ICreateBlogModel) {
    const blog: IBlogModel = {
      ...blogInputModel,
      id: new Date().toISOString(),
    };
    blogs.push(blog);

    return blog;
  },

  updateBlog(id: string, blogInputModel: ICreateBlogModel) {
    const blog = blogs.find((v) => v.id === id);

    if (!blog) return false;
    blog.name = blogInputModel.name;
    blog.description = blogInputModel.description;
    blog.websiteUrl = blogInputModel.websiteUrl;

    return true;
  },
  deleteBlogById(id: string) {
    const blogIndex = blogs.findIndex((p) => p.id === id);
    if (blogIndex === -1) return false;
    blogs.splice(blogIndex, 1);
    return true;
  },

  deleteBlogs() {
    blogs.length = 0;
  },
};
