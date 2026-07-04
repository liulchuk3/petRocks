import type { Request } from "express";

export type CatalogQueryOptions = {
  minPrice?: number;
  maxPrice?: number;
  sortByPrice?: "asc" | "desc" | "discount";
  sortByDate?: "newest" | "oldest";
};

const getSingleQueryValue = (value: unknown) => {
  if (Array.isArray(value)) {
    return value[0];
  }

  return typeof value === "string" ? value : undefined;
};

export const parseCatalogQuery = (query: Request["query"]): CatalogQueryOptions => {
  const minPriceRaw = getSingleQueryValue(query["min-price"]);
  const maxPriceRaw = getSingleQueryValue(query["max-price"]);
  const sortByPriceRaw = getSingleQueryValue(query["sort-by-price"]);
  const sortByDateRaw = getSingleQueryValue(query["sort-by-date"]);
  const sortByDiscountRaw = getSingleQueryValue(query["sort-by-discount"]);

  const minPrice = minPriceRaw && minPriceRaw.trim() !== "" ? Number(minPriceRaw) : undefined;
  const maxPrice = maxPriceRaw && maxPriceRaw.trim() !== "" ? Number(maxPriceRaw) : undefined;

  return {
    minPrice: Number.isFinite(minPrice) ? minPrice : undefined,
    maxPrice: Number.isFinite(maxPrice) ? maxPrice : undefined,
    sortByPrice: sortByPriceRaw === "asc" || sortByPriceRaw === "desc" || sortByPriceRaw === "discount" ? sortByPriceRaw : undefined,
    sortByDate: sortByDateRaw === "newest" || sortByDateRaw === "oldest" ? sortByDateRaw : undefined,
  };
};
