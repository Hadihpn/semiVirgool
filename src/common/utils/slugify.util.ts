import { BadRequestException } from "@nestjs/common";
import { PublicMessage } from "../enum/message.enum";

export function make_slug(slug) {
  slug = slug.trim();

  if (!slug && slug.trim() === "") throw new BadRequestException(PublicMessage.SomethingWrong);
    return slug.replace(/[،ًًًٌٍُِ\.\+\-_)(*&^%$#@!~'";:?><«»`ء]+/g, '')?.replace(/[\s]+/g, '-');
   
}
