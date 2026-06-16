import { z } from "zod";

const phone = z.string().trim().min(6, "Telefonul este obligatoriu.");

export const loginSchema = z.object({
  email: z.string().email("Email invalid."),
  password: z.string().min(6, "Parola este prea scurtă."),
});

export const registerSchema = z.object({
  firstName: z.string().trim().min(2, "Prenumele este obligatoriu."),
  lastName: z.string().trim().min(2, "Numele este obligatoriu."),
  phone,
  email: z.string().email("Email invalid."),
  password: z.string().min(8, "Parola trebuie să aibă minimum 8 caractere."),
});

export const orderSchema = z.object({
  firstName: z.string().trim().min(2, "Prenumele este obligatoriu."),
  lastName: z.string().trim().min(2, "Numele este obligatoriu."),
  phone,
  email: z.string().trim().email("Email invalid.").optional().or(z.literal("")),
  locality: z.string().trim().optional(),
  deliveryMethod: z.enum(["PICKUP", "AGREEMENT"]),
  comment: z.string().trim().max(1000).optional(),
  honeypot: z.string().max(0).optional(),
  items: z
    .array(
      z.object({
        variantId: z.string().min(1),
        quantity: z.number().int().min(1).max(20),
      }),
    )
    .min(1, "Coșul este gol."),
});

export const contactSchema = z.object({
  firstName: z.string().trim().min(2, "Prenumele este obligatoriu."),
  lastName: z.string().trim().optional(),
  phone: z.string().trim().optional(),
  email: z.string().trim().email("Email invalid.").optional().or(z.literal("")),
  message: z.string().trim().min(10, "Mesajul este prea scurt."),
  honeypot: z.string().max(0).optional(),
});

export const productSchema = z.object({
  name: z.string().trim().min(2),
  slug: z.string().trim().min(2),
  sku: z.string().trim().optional(),
  categoryId: z.string().trim().optional(),
  shortDescription: z.string().trim().optional(),
  longDescription: z.string().trim().optional(),
  material: z.string().trim().optional(),
  manufacturer: z.string().trim().optional(),
  gender: z.string().trim().optional(),
  basePriceCents: z.number().int().min(1),
  discountPriceCents: z.number().int().min(0).optional(),
  isRecommended: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
  status: z.enum(["draft", "active", "inactive"]),
  variants: z
    .array(
      z.object({
        id: z.string().optional(),
        size: z.string().trim().optional(),
        color: z.string().trim().optional(),
        sku: z.string().trim().optional(),
        stockQuantity: z.number().int().min(0),
        priceOverrideCents: z.number().int().min(0).optional(),
        discountOverrideCents: z.number().int().min(0).optional(),
      }),
    )
    .min(1),
  imageUrls: z.array(z.string()).default([]),
});

export const statusSchema = z.object({
  status: z.enum(["NEW", "CONTACTED", "CONFIRMED", "COMPLETED", "CANCELLED", "ARCHIVED"]),
  internalNotes: z.string().trim().optional(),
});

export const settingsSchema = z.record(z.string(), z.string().trim());
