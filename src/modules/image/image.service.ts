import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { ImageDto } from "./dto/create-image.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { ImageEntity } from "./entities/image.entity";
import { Repository } from "typeorm";
import { MulterFile } from "src/common/utils/multer.util";
import { REQUEST } from "@nestjs/core";
import { Request } from "express";
import { NotFoundMessage, PublicMessage } from "src/common/enum/message.enum";

@Injectable()
export class ImageService {
  constructor(
    @InjectRepository(ImageEntity)
    private imageRepository: Repository<ImageEntity>,
    @Inject(REQUEST) private request: Request
  ) {}
  async create(imageDto: ImageDto, image: MulterFile) {
    const userId = this.request.user?.id;
    const { alt, name } = imageDto;
    let location = image?.path?.slice(7);
    await this.imageRepository.insert({
      alt: alt || name,
      name,
      location,
    });
    return {
      message: PublicMessage.Created,
    };
  }

  findAll() {
    const userId = this.request.user?.id;
    return this.imageRepository.find({
      where: { userId },
      order: { id: "DESC" },
    });
  }

  async findOne(id: number) {
    const userId = this.request.user?.id;
    const image = await this.imageRepository.find({
      where: { userId, id },
      order: { id: "DESC" },
    });
    if (!image) throw new NotFoundException(NotFoundMessage.NotFoundCategory);
    return image;
  }

  async remove(id: number) {
    const image = await this.findOne(id);
    await this.imageRepository.remove(image);
    return {
      message: PublicMessage.Deleted,
    };
  }
}
