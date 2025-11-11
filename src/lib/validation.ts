import { z } from "zod";

const dateString = z
  .string()
  .refine(
    (val) => !isNaN(Date.parse(val)),
    "Must be a valid date or datetime string"
  );
export const ticketSchema = z
  .object({
    id: z.string().optional(),
    name: z
      .string()
      .min(1, "Ticket name is required")
      .max(100, "Ticket name must be under 100 characters"),
    price: z.coerce.number().min(1, "price must be positive"),
    quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
    gst: z.coerce
      .number()
      .min(0, "GST myst be positive")
      .max(100, "GST cannot exceed 100%"),
    salesStart: dateString,
    salesEnd: dateString,
  })
  .refine((data) => new Date(data.salesEnd) >= new Date(data.salesStart), {
    message: "Sales end date must be after sales start date",
    path: ["salesEnd"],
  });
export const promoCodeSchema = z.object({
  code: z
    .string()
    .min(1, "Promo code is required")
    .regex(/^[A-Z0-9_-]+$/, "Promo code may only coantain A-Z , 0-9, _ or -"),
  discountType: z.string().min(1, "Discount type is required"),
  amount: z.coerce.number().min(0, "Amount must be positive"),
  quantity: z.coerce
    .number()
    .int("Quantity must be integer")
    .min(1, "Quantity must be at least 1"),
});

export const eventSchema = z
  .object({
    name: z.string().min(1, "Event name is required"),
    description: z.string().min(1, "Description is required"),
    tags: z.array(z.string()).min(1, "At least one tag is required"),
    image: z.string().min(1, "Image is required"),
    venue: z.string().min(1, "Venue name is required"),
    venueAddress: z.string().min(1, "Venue address is required"),
    capacity: z.coerce.number().min(1, "Capacity must be at least 1"),
    timezone: z.string().min(1, "Timezone is required"),
    startDate: dateString,
    endDate: dateString,
    tickets: z.array(ticketSchema).min(1, "At least one ticket is required"),
    promoCodes: z.array(promoCodeSchema).optional(),
  })
  .refine((data) => new Date(data.endDate) > new Date(data.startDate), {
    message: "Event end date must be after start date",
    path: ["endDate"],
  });

export const loginSchema = z.object({
  email: z.email("invalid Email format").min(1, "Email is required"),
  password: z.string().min(1, "Password is reuired"),
});

export const passwordSchema= z
 .string()
    .min(8, "Password must be at least 8 characters long")
    .max(64, "Password cannot exceed 64 characters")
    .refine((val) => /[A-Z]/.test(val), {
      message: "Password must include at least one uppercase letter",
    })

    .refine((val) => /[a-z]/.test(val), {
      message: "Password must include at least one lowercase letter",
    })
    .refine((val) => /\d/.test(val), {
      message: "Password must include at least one number",
    })
    .refine((val) => /[!@#$%^&*(),.?":{}|<>_\-]/.test(val), {
      message: "Password must include at least one special character",
    });

export const signupSchema = z.object({
  first_name: z
    .string()
    .trim()
    .min(2, "First Name must be at least 2 characters")
    .max(50, "First name cannor exceed 50 characters")
    .regex(/^[A-Za-z\s'-]+$/, "First name can only conatin letters and spaces"),

  last_name: z
    .string()
    .trim()
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name cannot exceed 50 characters")
    .regex(/^[A-Za-z\s'-]+$/, "Last name can only contain letters and spaces"),
  phone: z
    .string()
    .trim()
    .min(7, "Phone number must have at least 7 digits")
    .max(15, "Phone number cannot exceed 15 digits")
    .regex(/^\d+$/, "Phone number must contain digits only"),

  country_code: z
    .string()
    .optional(),
  
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .toLowerCase()
    .pipe(z.email("Please enter a valid email address")),
  password: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password"),
})
.refine((data) => data.password === data.confirmPassword,{
  path:["confirmPassword"],
  message:"Password do not match"
});

export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;  
export type SignupFormData = z.infer<typeof signupSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
export type EventFormData = z.infer<typeof eventSchema>;
export type TicketFormData = z.infer<typeof ticketSchema>;
export type PromoCodeFormData = z.infer<typeof promoCodeSchema>;
