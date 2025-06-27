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
  LoginAgain = "login again",
  LoginRequired = "something wrong. try login again",
}
export enum PublicMessage {
  LoggedIn = "you logged in sucessfully",
  LoggedOut = "you logged out sucessfully",
  Created="Object created successfully",
  Deleted="Object deleted successfully",
  Updated="Object updated successfully",
  Inserted="Object inserted successfully",
}

export enum NotFoundMessage {
  NotFound="can not find this object",
  NotFoundCategory="can not find this category",
  NotFoundPost="can not find this Post",
  NotFoundUser="can not find this User"
}
export enum ValidtionMessage {}
export enum ConflictMessage {
  Category = "cateegory title has been existed",
}