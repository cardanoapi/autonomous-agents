import { Request, Response, Router } from "express";
import { handlerWrapper } from "../errors/AppError";
import { fetchProposals } from "../repository/proposal";
import { validateHash } from "../helpers/validator";
import { ProposalTypes, SortTypes } from "../types/proposal";

const router = Router();


const getProposals=async(req:Request,res:Response)=>{
  const size = req.query.size ? +req.query.size : 1
  const page = req.query.page ? +req.query.page : 10
  const type = req.query.type ? req.query.type as ProposalTypes : undefined
  const sort = req.query.sort ? req.query.sort as SortTypes : undefined
  let proposal = req.query.proposal as string

  if (proposal){
    console.log(proposal,validateHash(proposal))
    if (!validateHash(proposal)){
      return res.status(400).json({message:"Provide valid proposal Id"})
    }
    proposal = proposal.includes('#')? proposal.slice(0,-2):proposal
  }
const { items,totalCount } = await fetchProposals(page,size,proposal,type,sort)
  return res.status(200).json({totalCount:Math.round(totalCount/size),page,size,items})
}

router.get('/list',handlerWrapper(getProposals))

export default router
