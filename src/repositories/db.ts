import { Collection, MongoClient } from "mongodb";
import { IPostModel } from "../types/post-model";
import { IBlogModel } from "../types/blog-model";
import { IUserDBModel } from "../types/users-model";
import { ICommentModel } from "../types/comment-model";
import { IUserActiveSessionModel } from "../types/user-active-session-model";

let client: MongoClient;

export const DB_KEYS = {
  DB_NAME: "bloggers_platform",
  collections: {
    BLOGS: "blogs",
    POSTS: "posts",
    USERS: "users",
    COMMENTS: "comments",
    JWT_BLACKLIST: "jwt_blacklist",
    USER_ACTIVE_SESSIONS: "user_active_sessions",
  },
};

interface IJWTinBlackList {value: string}

export let postsCollection: Collection<IPostModel>;

export let blogsCollection: Collection<IBlogModel>;

export let usersCollection: Collection<IUserDBModel>;

export let commentsCollection: Collection<ICommentModel>;

export let jwtBlacklistCollection: Collection<IJWTinBlackList>;

export let userActiveSessionsCollection: Collection<IUserActiveSessionModel>;

export async function runDB(dbURI: string) {
  client = new MongoClient(dbURI);
  postsCollection = client
    .db(DB_KEYS.DB_NAME)
    .collection<IPostModel>(DB_KEYS.collections.POSTS);

  blogsCollection = client
    .db(DB_KEYS.DB_NAME)
    .collection<IBlogModel>(DB_KEYS.collections.BLOGS);

  usersCollection = client
    .db(DB_KEYS.DB_NAME)
    .collection<IUserDBModel>(DB_KEYS.collections.USERS);

  commentsCollection = client
    .db(DB_KEYS.DB_NAME)
    .collection<ICommentModel>(DB_KEYS.collections.COMMENTS);

  jwtBlacklistCollection = client.db(DB_KEYS.DB_NAME).collection<IJWTinBlackList>(DB_KEYS.collections.JWT_BLACKLIST);

  userActiveSessionsCollection = client
    .db(DB_KEYS.DB_NAME)
    .collection<IUserActiveSessionModel>(DB_KEYS.collections.USER_ACTIVE_SESSIONS);


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
