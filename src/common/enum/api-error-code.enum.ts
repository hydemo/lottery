export enum ApiErrorCode {
  TIMEOUT = -1, // 系统繁忙
  SUCCESS = 0, // 成功
  USER_ID_INVALID = 10001, // 用户id无效
  ACCOUNT_INVALID = 10002,
  PASSWORD_INVALID = 10003,
  USER_EXIST = 10004,
  EXIST = 10005,
  NO_PERMISSION = 10011,
  INPUT_ERROR = 10012,
  NO_EXIST = 10013,
  LOGIN_ERROR = 10006,
  INTERNAL_ERROR = 10000,
  CODE_EXPIRE = 10007,
  CODE_INVALID = 10008,
}