import { Request, Response } from "express";
import { getAllUsers } from "../services/user.service.js";

export const getUsers = async (
    req: Request,
    res: Response
) => {
    const users = await getAllUsers();

    res.json(users);
};