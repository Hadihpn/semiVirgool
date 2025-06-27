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

export function PaginationGenerator(count:number=0,page:number=0,limit:number=0){
    return {
        totalCount:count,
        page:+page,
        limit:+limit,
        pageCount:Math.ceil(count/limit) 
    }
}
