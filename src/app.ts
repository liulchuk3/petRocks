import express from "express";
import pagesRoutes from "./routes/pages.routes.js";
import { fileURLToPath } from "url";
import path, { dirname } from "path";

const app = express();

app.use(express.json());
app.use(express.static(path.join(process.cwd(), "public")));

app.set("view engine", "ejs");
app.set("views", path.join(process.cwd(), "views"));

app.use("/", pagesRoutes);

export default app;