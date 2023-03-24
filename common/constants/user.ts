export enum UserStatusEnum {
  Active = 'active',
  Closed = 'closed',
}

export enum UserSourceEnum {
  Api = 'api',
  Google = 'google',
  Facebook = 'facebook',
  Apple = 'apple',
}

export enum SendType {
  SEND_TYPE_UNSPECIFIED = 0,
  SEND_TYPE_EMAIL = 1,
  SEND_TYPE_SMS = 2,
  SEND_TYPE_ALL = 3,
  UNRECOGNIZED = -1,
}
