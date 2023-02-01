export enum UserStatusEnum {
  Active = 'active',
}

export enum UserSourceEnum {
  SDK = 'sdk',
  Api = 'api',
  Google = 'google',
  Facebook = 'facebook',
  Apple = 'apple',
}

export enum SendType {
  EMAIL = 1,
  SMS = 2,
  ALL = SendType.SMS | SendType.EMAIL,
}
