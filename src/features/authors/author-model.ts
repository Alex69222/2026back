export interface IAuthor {
  id: number;
  name: string;
}

export interface ICreateAuthorInputModel {
  name: string; // maxLength 20
}
