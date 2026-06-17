// middleware/lang-sync.middleware.ts
import { Request, Response, NextFunction } from 'express';

const SUPPORTED_LNGS = ['uk', 'en'];

export const syncLangWithUrl = (req: Request, res: Response, next: NextFunction) => {
  const urlLng = req.params.lng as string;

  if (urlLng && SUPPORTED_LNGS.includes(urlLng)) {
    // URL головний — перезаписуємо те, що визначив i18next з cookie
    req.language = urlLng;
    
    // Оновлюємо i18next інстанс щоб req.t() теж перемкнувся
    if (req.i18n) {
      req.i18n.changeLanguage(urlLng);
    }

    // Синхронізуємо cookie з URL (щоб наступний візит без префіксу теж був правильний)
    res.cookie('i18next', urlLng, {
      maxAge: 60 * 24 * 365 * 60 * 1000,
      path: '/',
    });
  }

  next();
};