export type UserLink = {
  id: number;
  name: string;
  link: string;
};

export type CreateUserLinkPayload = {
  name?: string;
  link: string;
};

export type UpdateUserLinkPayload = Partial<CreateUserLinkPayload>;

export type UserLinksResponse = {
  user_links: UserLink[];
};

export type UserLinkResponse = {
  user_link: UserLink;
};
