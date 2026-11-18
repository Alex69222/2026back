import { Collection, MongoClient } from 'mongodb';
import { PostModel } from '../types/post-model';
import { IBlogModel } from '../types/blog-model';
import { UserDBModel } from '../types/users-model';
import { ICommentModel } from '../types/comment-model';
import { IUserActiveSessionModel } from '../types/user-active-session-model';
import { IURLAccessModel } from '../types/url-access-model';

let client: MongoClient;

export const DB_KEYS = {
  DB_NAME: 'bloggers_platform',
  collections: {
    BLOGS: 'blogs',
    POSTS: 'posts',
    USERS: 'users',
    COMMENTS: 'comments',
    USER_ACTIVE_SESSIONS: 'user_active_sessions',
    URL_ACCESS: 'url_access',
  },
};

export let postsCollection: Collection<PostModel>;

export let blogsCollection: Collection<IBlogModel>;

export let usersCollection: Collection<UserDBModel>;

export let commentsCollection: Collection<ICommentModel>;

export let userActiveSessionsCollection: Collection<IUserActiveSessionModel>;

export let urlAccessCollection: Collection<IURLAccessModel>;

export async function runDB(dbURI: string) {
  client = new MongoClient(dbURI);
  postsCollection = client.db(DB_KEYS.DB_NAME).collection<PostModel>(DB_KEYS.collections.POSTS);

  blogsCollection = client.db(DB_KEYS.DB_NAME).collection<IBlogModel>(DB_KEYS.collections.BLOGS);

  usersCollection = client.db(DB_KEYS.DB_NAME).collection<UserDBModel>(DB_KEYS.collections.USERS);

  commentsCollection = client
    .db(DB_KEYS.DB_NAME)
    .collection<ICommentModel>(DB_KEYS.collections.COMMENTS);

  userActiveSessionsCollection = client
    .db(DB_KEYS.DB_NAME)
    .collection<IUserActiveSessionModel>(DB_KEYS.collections.USER_ACTIVE_SESSIONS);

  urlAccessCollection = client
    .db(DB_KEYS.DB_NAME)
    .collection<IURLAccessModel>(DB_KEYS.collections.URL_ACCESS);

  try {
    await client.connect();
    await urlAccessCollection.createIndex({ date: 1 }, { expireAfterSeconds: 60 });
    await client.db('blogs').command({ ping: 1 });
    console.log('Connected successfully to mongo server');
  } catch (e) {
    console.log(e);
    await client.close();
  }
}

export async function stopDB() {
  await client.close();
}
