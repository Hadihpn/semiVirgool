import { Request } from "express";
import { mkdirSync } from "fs";
import { extname, join } from "path";
import { EntityEnum } from "../enum/entity.enum";
import { BadRequestException } from "@nestjs/common";
import { ValidtionMessage } from "../enum/message.enum";
import { diskStorage } from "multer";
export type CallBackDestination = (
  error: Error | null,
  destination: string
) => void;
export type CallBackFilename = (error: Error | null, filename: string) => void;
export type MulterFile = Express.Multer.File;
export function multerDestination(fieldName: string) {
  return (req: Request, file: MulterFile, cb: CallBackDestination): void => {
    let path = join("public", "uploads", fieldName);
    mkdirSync(path, { recursive: true });
    cb(null, path);
  };
}
export function multerFilename(
  req: Request,
  file: MulterFile,
  cb: CallBackFilename
): void {
  const ext = extname(file.originalname);
  if(!validateImageFormat(ext)){
    cb(new BadRequestException(ValidtionMessage.InvalidImageFormat),"null")
  }
  const filename = `${Date.now()}${ext}`;
  cb(null, filename);
}
function validateImageFormat(format){
  return  Object.values(validateImageFormat).includes(format)
}
export function multerStorage(folderName:string) {
  return diskStorage({
          destination: multerDestination(folderName),
          filename: multerFilename,
        })
}