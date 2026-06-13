import { Router } from "express";

const router = Router();

    router.get("/", (req, res) => {
        const rocks = [
            {
                imageUrl: "/images/testRock1.png",
                name: "Rocky",
                description: "A friendly rock loves to be petted",
                price: 9.99,
                id: 1
            },
            {
                imageUrl: "/images/testRock1.png",
                name: "Pebbles",
                description: "A small rock that enjoys sunny days",
                price: 7.99,
                id: 2
            },
            {
                imageUrl: "/images/testRock1.png",
                name: "Granite",
                description: "A sturdy rock that can withstand any weather",
                price: 12.99,
                id: 3
            },
            {
                imageUrl: "/images/testRock1.png",
                name: "Boulder",
                description: "A massive rock dominates the landscape",
                price: 19.99,
                id: 4
            },
            {
                imageUrl: "/images/testRock1.png",
                name: "Slate",
                description: "A smooth rock loves to be stacked",
                price: 8.99,
                id: 5
            },
            {
                imageUrl: "/images/testRock1.png",
                name: "Marble",
                description: "A polished rock shines in the sunlight",
                price: 14.99,
                id: 6
            }
        ]

    res.render("pages/index", { rocks });
    });

    router.get("/authorization", (req, res) => {
        res.render("pages/authorization");
    });

export default router;