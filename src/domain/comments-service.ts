import { commentsRepository } from '../repositories/comments-repository';
import { ICommentModel } from '../types/comment-model';
import { UserDBModel } from '../types/users-model';

export class CommentsService {
  async createComment(postId: string, user: UserDBModel, content: string): Promise<string> {
    const comment: ICommentModel = {
      id: '',
      content,
      commentatorInfo: {
        userId: user.id,
        userLogin: user.login,
      },
      createdAt: new Date().toISOString(),
      postId,
    };
    const createdCommentId = await commentsRepository.addComment(comment);
    return createdCommentId;
  }
  async updateComment(commentId: string, content: string): Promise<boolean> {
    const commentUpdated = await commentsRepository.updateComment(commentId, content);
    return commentUpdated;
  }

  async deleteBCommentById(id: string): Promise<boolean> {
    const result = await commentsRepository.deleteCommentById(id);

    return result;
  }
}

export const commentsService = new CommentsService();
