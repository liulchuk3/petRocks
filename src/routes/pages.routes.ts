import { Router } from "express";
import { AuthRequest, optionalAuth, requireAuth } from "../middleware/auth.middleware.js";
import { getShortUserData, getFullUserData } from "../services/getUserData.service.js"; // Уявна функція, яка дістає дані користувача за userId
import { refresh } from "../controllers/auth.controller.js";

const router = Router();

    router.get("/", optionalAuth, async (req: AuthRequest, res) => {
        const userData = req.userId ? await getShortUserData(req.userId) : null; // Уявна функція, яка дістає дані користувача за userId
        console.log("User Data:", userData); // Виводимо дані користувача в консоль
        res.render("pages/index", {
        currentLng: req.language,
        userData: userData ?? null, // дані користувача або null, якщо гість
        // userData contains id, email, username, imageUrl
        items: [
            { id: 1, name: "Rock", price: 9.99, imageUrl: "/images/testRock1.png" },
            { id: 2, name: "Paper", price: 4.99, imageUrl: "/images/testRock1.png" },
            { id: 3, name: "Scissors", price: 6.99, imageUrl: "/images/testRock1.png" },
            { id: 4, name: "Lizard", price: 7.99, imageUrl: "/images/testRock1.png" },
            { id: 5, name: "Spock", price: 8.99, imageUrl: "/images/testRock1.png" }
        ],
    });
    });

    router.get("/profile", requireAuth, async (req: AuthRequest, res) => {
        const userData = await getFullUserData(req.userId!);
        res.render("pages/profile", {
            currentLng: req.language,
            userData: userData // дані користувача або null, якщо гість
        });
    });

    router.get("/authorization-sign-in", (req: AuthRequest, res) => {
        const currentLng = req.language;
        res.render("pages/authorization-sign-in", { currentLng, userData: null });
    });

    router.get("/authorization-sign-up", (req: AuthRequest, res) => {
        const currentLng = req.language;
        res.render("pages/authorization-sign-up", { currentLng, userData: null });
    });
    
export default router;