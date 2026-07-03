import { Router } from "express";
import { AuthRequest, optionalAuth, requireAdmin, requireAuth } from "../middleware/auth.middleware.js";
import { getShortUserData, getFullUserData } from "../services/getUserData.service.js"; // Уявна функція, яка дістає дані користувача за userId
import { getCartCount } from "../services/items.service.js"; // Уявна функція, яка дістає кількість товарів у кошику користувача
import { getAllItemsForHomePageController, getAllItemsForCatalogController, getItemBySlugController } from "../controllers/items.controllers.js";
import { parseCatalogQuery } from "../utils/catalog-query.js";

const router = Router();

    router.get("/", optionalAuth, async (req: AuthRequest, res) => {
        const itemsData = await getAllItemsForHomePageController(); // Уявна функція, яка дістає всі товари з бази даних
        const userData = req.userId ? await getShortUserData(req.userId) : null; // Уявна функція, яка дістає дані користувача за userId
        const userCartCount = req.userId ? await getCartCount(req.userId!) : 0; // Уявна функція, яка дістає кількість товарів у кошику користувача
        res.render("pages/index", {
        currentLng: req.language,
        userData: userData ?? null, // дані користувача або null, якщо гість
        userCartCount: userCartCount, // кількість товарів у кошику користувача
        // userData contains id, email, username, imageUrl
        items: itemsData, // масив товарів з бази даних
    });
    });

    router.get("/catalog", optionalAuth, async (req: AuthRequest, res) => {
        const selectedFilters = parseCatalogQuery(req.query);
        const itemsData = await getAllItemsForCatalogController(selectedFilters); // Уявна функція, яка дістає всі товари з бази даних
        const userData = req.userId ? await getShortUserData(req.userId) : null;
        const userCartCount = req.userId ? await getCartCount(req.userId!) : 0;
        res.render("pages/catalog", {
            currentLng: req.language,
            userData: userData ?? null, // дані користувача або null, якщо гість
            userCartCount: userCartCount, // кількість товарів у кошику користувача
            selectedFilters,
            items: itemsData, // масив товарів з бази даних
        });
    });

    router.get("/about", optionalAuth, async (req: AuthRequest, res) => {
        const userData = req.userId ? await getShortUserData(req.userId) : null;
        const userCartCount = req.userId ? await getCartCount(req.userId!) : 0;
        res.render("pages/about", {
            currentLng: req.language,
            userData: userData ?? null,
            userCartCount: userCartCount
        });
    });

    router.get("/contact", optionalAuth, async (req: AuthRequest, res) => {
        const userData = req.userId ? await getShortUserData(req.userId) : null;
        const userCartCount = req.userId ? await getCartCount(req.userId!) : 0;
        res.render("pages/contact", {
            currentLng: req.language,
            userData: userData ?? null,
            userCartCount: userCartCount
        });
    });

    router.get("/rock/:slug", optionalAuth, async (req: AuthRequest, res) => {
        const itemsData = await getAllItemsForHomePageController();
        const item = await getItemBySlugController(req); // Уявна функція, яка дістає товар за slug
        const userData = req.userId ? await getShortUserData(req.userId) : null;
        const userCartCount = req.userId ? await getCartCount(req.userId!) : 0;
        res.render("pages/item-page", {
            currentLng: req.language,
            userData: userData ?? null, // дані користувача або null, якщо гість
            userCartCount: userCartCount, // кількість товарів у кошику користувача
            item: item, // передаємо дані товару в шаблон
            items: itemsData // масив товарів з бази даних
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