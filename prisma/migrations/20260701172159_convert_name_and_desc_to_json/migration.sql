-- 1. Змінюємо тип колонки "name", конвертуючи старий текст у JSON-об'єкт із ключем "en"
ALTER TABLE "Items" 
  ALTER COLUMN "name" TYPE JSONB USING jsonb_build_object('en', "name");

-- 2. Змінюємо тип колонки "description", так само конвертуючи існуючий текст
ALTER TABLE "Items" 
  ALTER COLUMN "description" TYPE JSONB USING jsonb_build_object('en', "description");
