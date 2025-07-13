import { BaseEntity } from "src/common/abstracts/base.entity";
import { EntityEnum } from "src/common/enum/entity.enum";
import { UserEntity } from "src/modules/user/entities/user.entity";
import { Column, Entity, ManyToOne } from "typeorm";
@Entity(EntityEnum.Image)
export class ImageEntity extends BaseEntity {
    @Column()
    name:string
     @Column()
    location:string
     @Column()
    alt:string
     @Column()
    userId:number
    @ManyToOne(()=>UserEntity,user=>user.images,{onDelete:"CASCADE"})
    user:UserEntity

}
