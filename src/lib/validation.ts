// src/lib/validation.ts
import { z } from "zod";

export const EntryTypeEnum = z.enum(["CREDIT", "DEBIT"]);

export const carCreateSchema = z
  .object({
    accountId: z.uuid(),
    make: z.string().min(1),
    model: z.string().min(1),
    year: z
      .number()
      .int()
      .gte(1950)
      .lte(new Date().getFullYear() + 1),
    imgUrl: z
      .url()
      .optional()
      .or(z.literal("").transform(() => undefined)),
    buyPrice: z.number().nonnegative(),
    buyDate: z.coerce.date(),
    sellPrice: z.number().nonnegative().optional(),
    sellDate: z.coerce.date().optional(),
    notes: z.string().max(5000).optional(),
  })
  .refine((d) => (d.sellDate ? d.sellPrice !== undefined : true), {
    message: "sellPrice is required when sellDate is provided",
    path: ["sellPrice"],
  });

export const carUpdateSchema = carCreateSchema.partial().extend({
  id: z.uuid().optional(), // ignore if included
});

export const entryCreateSchema = z.object({
  accountId: z.uuid(),
  amount: z.number().positive(),
  type: EntryTypeEnum,
  description: z.string().max(5000).optional(),
  relatedCarId: z.uuid().optional(),
  date: z.coerce.date(),
});

export const entryUpdateSchema = entryCreateSchema.partial();
