import { Router } from "express";
import { AuthRequest, requireAuth } from "../middleware/auth.middleware.js";
import { optionalAuth } from "../middleware/optional.middleware.js";

const router = Router();

    router.get("/", optionalAuth, (req: AuthRequest, res) => {
        res.render("pages/index", {
        currentLng: req.language,
        userId: req.userId ?? null, // є — авторизований, null — гість
            items: [
                { id: 1, name: "Rock 1", price: 10.99, imageUrl: "/images/testRock1.png" },
                { id: 2, name: "Rock 2", price: 15.49, imageUrl: "/images/testRock1.png" },
            ]
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