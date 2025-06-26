import { PaginationDto } from "../dtos/pagination.dto";

export function PaginationSolver(paginationDto : PaginationDto){
    let {page,limit} = paginationDto;
    if(!page || page<=1) page=0
    else page--
    if(!limit || limit<10) limit =10;
    const skip = page*limit;
    return {
        page:page ===0?1:page,
        limit,
        skip
    }

}