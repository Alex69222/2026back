export interface ICommentatorInfo {
  userId: string;
  userLogin: string;
}

export interface ICreateCommentModel {
  content: string;
}

export interface ICommentModel {
  id: string;
  content: string;
  commentatorInfo: ICommentatorInfo;
  createdAt: string;
  postId: string;
}

export interface ICommentViewModel {
  id: string;
  content: string;
  commentatorInfo: ICommentatorInfo;
  createdAt: string;
}
