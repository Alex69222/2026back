import { ICommentModel, ICreateCommentModel } from "../types/comment-model";
import { commentsCollection } from "./db";

export const commentsRepository = {
  async addComment(commentData: ICommentModel) {
    const comment = { ...commentData, id: (+new Date()).toString() };
    await commentsCollection.insertOne(comment);
    const tempComment = comment as any;
    delete tempComment._id;

    return comment.id;
  },
  async updateComment(id: string, content: string): Promise<boolean> {
    const result = await commentsCollection.updateOne(
      { id },
      {
        $set: {
          content,
        },
      },
    );

    return result.matchedCount === 1;
  },

  async deleteCommentById(id: string): Promise<boolean> {
    const result = await commentsCollection.deleteOne({ id });

    return result.deletedCount === 1;
  },

  async deleteComments(): Promise<boolean> {
    const result = await commentsCollection.deleteMany({});
    return result.acknowledged;
  },
};
