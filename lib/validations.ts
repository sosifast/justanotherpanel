import { z } from 'zod';

export const loginSchema = z.object({
    email: z.string().min(3, "Email or Username must be at least 3 characters"),
    password: z.string().min(6, "Password must be at least 6 characters")
});

export const orderSchema = z.object({
    service_id: z.coerce.number().positive("Service ID must be positive"),
    link: z.string().url("Valid URL is required").or(z.string().min(5)),
    quantity: z.coerce.number().int().positive().optional(),
    comments: z.string().optional(),
    runs: z.coerce.number().int().min(1).optional(),
    interval: z.coerce.number().int().min(1).optional(),
    discount_code: z.string().optional()
});
