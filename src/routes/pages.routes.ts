import { Router } from "express";
import { AuthRequest, optionalAuth, requireAuth } from "../middleware/auth.middleware.js";
import { getUserData } from "../services/getUserData.service.js"; // Уявна функція, яка дістає дані користувача за userId

const router = Router();

    router.get("/", optionalAuth, async (req: AuthRequest, res) => {
        const userData = req.userId ? await getUserData(req.userId) : null; // Уявна функція, яка дістає дані користувача за userId
        res.render("pages/index", {
        currentLng: req.language,
        userData: userData ?? null, // дані користувача або null, якщо гість
    });
    });

    router.get("/authorization-sign-in", (req, res) => {
        const currentLng = req.language;
        res.render("pages/authorization-sign-in", { currentLng });
    });

    router.get("/authorization-sign-up", (req, res) => {
        const currentLng = req.language;
        res.render("pages/authorization-sign-up", { currentLng });
    });
    
export default router;