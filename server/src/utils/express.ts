import { NextFunction, Request, Response } from "express";

export type Handler = (
    req: Request & { userId: string },
    res: Response,
    next?: NextFunction
) => void;
