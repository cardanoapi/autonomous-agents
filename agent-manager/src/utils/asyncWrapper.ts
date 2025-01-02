import {NextFunction, Request, Response} from "express";

export const handlerWrapper = (fn: any) => (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = fn(req, res, next)
        if (result instanceof Promise) {
            result.catch((e) => {
                next(e)
            })
        }
    } catch (error) {
        // Handle sync errors
        next(error)
    }
}