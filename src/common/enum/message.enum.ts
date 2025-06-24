export enum BadRequestMessage {
  InValidLoginData = "entered Input is not valid",
  InValidRegisterData = "eenter valid data",
}
export enum AuthMessage {
  NotFoundAccount = "not found account",
  AlreadyExistAccount = "the user has been already exist",
  OtpIsValid = "last otp is valid yet",
  InvalidUser = "cannot find any user with this info",
  SentOtp = "5 digit otp code send  to you",
  ExpiredCode = "this Code has been expired.get new one",
  TryAgain = "something wrong. try login again",
}
export enum PublicMessage {
  LoggedIn = "you logged in sucessfully",
  LoggedOut = "you logged out sucessfully",
  
}
export enum NotFoundMessage {}
export enum ValidtionMessage {}
