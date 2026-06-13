import express from "express";
import pagesRoutes from "./routes/pages.routes.js";
import { fileURLToPath } from "url";
import path, { dirname } from "path";
import i18next from "i18next";
import Backend from "i18next-fs-backend";
import { handle, LanguageDetector } from "i18next-http-middleware";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

i18next
  .use(Backend) 
  .use(LanguageDetector) 
  .init({
    fallbackLng: 'uk', 
    preload: ['uk', 'en'], 
    backend: {
      loadPath: path.join(process.cwd(), 'locates/{{lng}}/{{ns}}.json') 
    }
  });

app.use(express.json());
app.use(express.static(path.join(process.cwd(), "public")));
app.use(handle(i18next));

app.set("view engine", "ejs");
app.set("views", path.join(process.cwd(), "views"));

// ==============================================================================================================================

app.use("/", pagesRoutes);

export default app;