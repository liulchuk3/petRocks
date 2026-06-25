import { Router } from "express";
import { AuthRequest, optionalAuth, requireAdmin, requireAuth } from "../middleware/auth.middleware.js";
import { getShortUserData, getFullUserData } from "../services/getUserData.service.js"; // Уявна функція, яка дістає дані користувача за userId
import { getCartCount } from "../services/items.service.js"; // Уявна функція, яка дістає кількість товарів у кошику користувача
import { refresh } from "../controllers/auth.controller.js";
import { getAllItemsForHomePageController } from "../controllers/items.controllers.js";

const router = Router();

    router.get("/", optionalAuth, async (req: AuthRequest, res) => {
        const itemsData = await getAllItemsForHomePageController(); // Уявна функція, яка дістає всі товари з бази даних
        const userData = req.userId ? await getShortUserData(req.userId) : null; // Уявна функція, яка дістає дані користувача за userId
        const userCartCount = req.userId ? await getCartCount(req.userId!) : 0; // Уявна функція, яка дістає кількість товарів у кошику користувача
        console.log("User Data:", userData); // Виводимо дані користувача в консоль
        res.render("pages/index", {
        currentLng: req.language,
        userData: userData ?? null, // дані користувача або null, якщо гість
        userCartCount, // кількість товарів у кошику користувача
        // userData contains id, email, username, imageUrl
        items: itemsData, // масив товарів з бази даних
    });
    });

    router.get("/catalog", optionalAuth, async (req: AuthRequest, res) => {
        const itemsData = await getAllItemsForHomePageController(); // Уявна функція, яка дістає всі товари з бази даних
        const userData = req.userId ? await getShortUserData(req.userId) : null;
        const userCartCount = req.userId ? await getCartCount(req.userId!) : 0;
        res.render("pages/catalog", {
            currentLng: req.language,
            userData: userData ?? null, // дані користувача або null, якщо гість
            userCartCount, // кількість товарів у кошику користувача
            items: itemsData, // масив товарів з бази даних
        });
    });

    router.get("/profile", requireAuth, async (req: AuthRequest, res) => {
        const userData = await getFullUserData(req.userId!);
        res.render("pages/profile", {
            currentLng: req.language,
            userData: userData // дані користувача або null, якщо гість
        });
    });

    router.get("/admin", requireAuth, requireAdmin, async (req: AuthRequest, res) => {
        const userData = req.userId ? await getShortUserData(req.userId) : null;
        res.render("pages/admin", {
            currentLng: req.language,
            userData: userData // дані користувача або null, якщо гість
        });
    });

    router.get("/authorization-sign-in", (req: AuthRequest, res) => {
        res.render("pages/authorization-sign-in", { currentLng: req.language, userData: null });
    });

    router.get("/authorization-sign-up", (req: AuthRequest, res) => {
        res.render("pages/authorization-sign-up", { currentLng: req.language, userData: null });
    });
    
export default router;