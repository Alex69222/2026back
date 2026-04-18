import { Collection, Db, MongoClient } from "mongodb";
import { IPostModel } from "../types/post-model";
import { IBlogModel } from "../types/blog-model";
// import { MongoMemoryServer } from "mongodb-memory-server";
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017";

let client: MongoClient = new MongoClient(MONGO_URI);

export const DB_KEYS = {
  DB_NAME: "bloggers_platform",
  collections: {
    BLOGS: "blogs",
    POSTS: "posts",
  },
};

export const postsCollection = client
  .db(DB_KEYS.DB_NAME)
  .collection<IPostModel>(DB_KEYS.collections.POSTS);

export const blogsCollection = client
  .db(DB_KEYS.DB_NAME)
  .collection<IBlogModel>(DB_KEYS.collections.BLOGS);

export async function runDB() {
  try {
    await client.connect();
    await client.db("blogs").command({ ping: 1 });
    console.log("Connected successfully to mongo server");
  } catch (e) {
    console.log(e);
    await client.close();
  }
}
// const getClient = async () => {
//   let client: MongoClient;
//   if (process.env.NODE_ENV === "test") {
//     const mongoServer = await MongoMemoryServer.create();
//     client = new MongoClient(mongoServer.getUri());
//   } else {
//     client = new MongoClient(MONGO_URI);
//   }

//   return client;
// };

// export const getDb = async (): Promise<Db> => {
//   const client = await getClient();
//   return client.db(DB_KEYS.DB_NAME);
// };

// export async function getPostsCollection(): Promise<Collection<IPostModel>> {
//   const db = await getDb();
//   return db.collection<IPostModel>(DB_KEYS.collections.POSTS);
// }

// export async function getBlogsCollection(): Promise<Collection<IBlogModel>> {
//   const db = await getDb();
//   return db.collection<IBlogModel>(DB_KEYS.collections.BLOGS);
// }
