import { SetMetadata } from "@nestjs/common";
import { Roles } from "../enum/roles.enum";

export const ROLE_KEY="ROLES";
export const CanAccess= (...roles:Roles[])=> SetMetadata(ROLE_KEY,roles)