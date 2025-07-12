import { Injectable, NestMiddleware } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";

!Injectable()
export class AddUserToReqWOV implements NestMiddleware{
    use(req:Request,res:Response,next:NextFunction){
        //...
        console.log("excute middleware in some routes...");
        next();
    }
}