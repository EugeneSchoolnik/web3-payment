import { Handler } from "express";
import { ethers } from "ethers"
import db from "../db";
import { clientError, errorHandler } from "../utils/Error";

export const newAddress: Handler = async (req, res) => {
    try {
        const wallet = ethers.Wallet.createRandom();
        const privateKey = wallet.privateKey
        const address = wallet.address;

        const [result] = await db.execute("INSERT INTO addressPool (address, privateKey) VALUES (?, ?)", [address, privateKey]) as any

        if (result.affectedRows !== 1) throw clientError(500, "Error while adding address")

        res.status(201).json({ data: address })
    } catch (e: any) {
        errorHandler(e, res)
    }
}
