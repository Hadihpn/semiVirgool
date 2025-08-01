export enum BadRequestMessage {
  InValidLoginData = "entered Input is not valid",
  InValidRegisterData = "enter valid data",
  InValidCategoryData = "enter valid category",
}
export enum AuthMessage {
  NotFoundAccount = "not found account",
  AlreadyExistAccount = "the user has been already exist",
  OtpIsValid = "last otp is valid yet",
  InvalidUser = "cannot find any user with this info",
  SentOtp = "5 digit otp code send  to you",
  ExpiredCode = "this Code has been expired.get new one",
  TryAgain = "something wrong. try again",
  LoginAgain = "login again",
  LoginRequired = "something wrong. try login again",
  Blocked = "contact administrator . you have been restrict",
}
export enum PublicMessage {
  LoggedIn = "you logged in sucessfully",
  LoggedOut = "you logged out sucessfully",
  Created = "Object created successfully",
  Deleted = "Object deleted successfully",
  Updated = "Object updated successfully",
  Inserted = "Object inserted successfully",
  SomethingWrong = "something wrong.",
  LikeBlog = "you liked this blog.",
  DisLikeBlog = "you disliked this blog.",
  BookmarkBlog = "you bookmarked this blog.",
  DisBookmarkBlog = "you disBookmarked this blog.",
  CreatedComment = "you commented successfully",
  Follow = "you follow successfully",
  UnFollow = "you unfollow successfully",
  Blocked = "you Blocked user successfully",
  UnBlocked = "you unBlocked user successfully",
  Repoort = "you report user successfully",
}
export enum CommentMessage {
  AccepetComment = "the comment accepted successfully",
  RejectComment = "the comment rejected successfully",
}
export enum NotFoundMessage {
  NotFound = "can not find this object",
  NotFoundCategory = "can not find this category",
  NotFoundPost = "can not find this Post",
  NotFoundUser = "can not find this User",
  NotFoundComment = "can not find this Comment",
}
export enum ValidationMessage {
  InvalidImageFormat = "image format must be png , jpg or jpeg",
  InavalidEmailFormat = "please enter the valid email",
  InavalidPhoneFormat = "please enter the valid phone number",
}
export enum ConflictMessage {
  Category = "category title has been existed",
  Email = "email has been existed",
  Phone = "phone has been existed",
  Username = "username has been existed",
}
