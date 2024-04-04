import { NextFunction, Request, Response } from "express";
import { IUser } from "../services/user/interface";

export type Handler = (
    req: Request & { user: IUser },
    res: Response,
    next?: NextFunction
) => void;
