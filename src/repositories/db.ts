import { Collection, MongoClient } from "mongodb";
import { IPostModel } from "../types/post-model";
import { IBlogModel } from "../types/blog-model";

let client: MongoClient;

export const DB_KEYS = {
  DB_NAME: "bloggers_platform",
  collections: {
    BLOGS: "blogs",
    POSTS: "posts",
  },
};

export let postsCollection: Collection<IPostModel>;

export let blogsCollection: Collection<IBlogModel>;

export async function runDB(dbURI: string) {
  client = new MongoClient(dbURI);
  postsCollection = client
    .db(DB_KEYS.DB_NAME)
    .collection<IPostModel>(DB_KEYS.collections.POSTS);

  blogsCollection = client
    .db(DB_KEYS.DB_NAME)
    .collection<IBlogModel>(DB_KEYS.collections.BLOGS);

  try {
    await client.connect();
    await client.db("blogs").command({ ping: 1 });
    console.log("Connected successfully to mongo server");
  } catch (e) {
    console.log(e);
    await client.close();
  }
}

export async function stopDB() {
  await client.close();
}
