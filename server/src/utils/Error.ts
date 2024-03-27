import { Response } from "express"

export const clientError = (status: number, message: string) => {
    const error = new Error();
    (error as any).status = status;
    (error as any).clientMessage = message
    return error
}

export const errorHandler = (e: any, res: Response) => {
    if (e.clientMessage)
        return res.status(e.status).json({ message: e.clientMessage })

    console.log(e.message);
    res.status(500).json({ error: e.message })
}
