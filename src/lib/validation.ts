// import { isValidPhoneNumber } from "react-phone-number-input";
import { z } from "zod";

// import { useTranslation } from '@/hooks/useTranslation';

const dateString = z
  .string()
  .refine(
    (val) => !isNaN(Date.parse(val)),
    "Enter valid datetime."
  );
export const ticketSchema = z
  .object({
    id: z.string().optional(),
    name: z
      .string()
      .min(1, "Ticket name is required.")
      .max(100, "Ticket name must be under 100 characters."),
    price: z.coerce.number().min(1, "Price must be positive."),
    quantity: z.coerce.number().min(1, "Quantity must be at least 1."),
    gst: z.coerce
      .number()
      .min(0, "GST myst be positive.")
      .max(100, "GST cannot exceed 100%."),
    salesStart: dateString,
    salesEnd: dateString,
  })
  .refine((data) => new Date(data.salesEnd) >= new Date(data.salesStart), {
    message: "Sales end date must be after sales start date.",
    path: ["salesEnd"],
  });
export const promoCodeSchema = z.object({
  code: z
    .string()
    .min(1, "Promo code is required.")
    .regex(/^[A-Z0-9_-]+$/, "Promo code may only coantain A-Z , 0-9, _ or -"),
  discountType: z.string().min(1, "Discount type is required."),
  amount: z.coerce.number().min(0, "Amount must be positive."),
  quantity: z.coerce
    .number()
    .int("Quantity must be integer.")
    .min(1, "Quantity must be at least 1."),
});

export const eventSchema = z
  .object({
    name: z.string().min(1, "Event Title is required."),
    description: z.string().min(1, "Event Description is required."),
    tags: z.array(z.string()).min(1, "At least one tag is required."),
    image: z.string().min(1, "Image is required."),
    venue: z.string().min(1, "Venue Name is required."),
    venueAddress: z.string().min(1, "Venue Address is required."),
    capacity: z.coerce.number().min(1, "Capacity must be at least 1."),
    timezone: z.string().min(1, "Timezone is required."),
    startDate: dateString,
    endDate: dateString,
    tickets: z.array(ticketSchema).min(1, "At least one ticket is required."),
    promoCodes: z.array(promoCodeSchema).optional(),
  })
  .refine((data) => new Date(data.endDate) > new Date(data.startDate), {
    message: "Event end date must be after start date.",
    path: ["endDate"],
  });

export type EventFormData = z.infer<typeof eventSchema>;
export type TicketFormData = z.infer<typeof ticketSchema>;
export type PromoCodeFormData = z.infer<typeof promoCodeSchema>;




/**
 * Validation helper utility
 * Uses common validation messages with field substitution
 */

export interface ValidationHelpers {
  required: (field: string) => string;
  invalid: (field: string) => string;
  minLength: (field: string, length: number) => string;
  maxLength: (field: string, length: number) => string;
  min: (field: string, value: number) => string;
  max: (field: string, value: number) => string;
  pattern: (field: string) => string;
  email: (field: string) => string;
  phone: (field: string) => string;
  passwordMatch: () => string;
  passwordUpperLower: () => string;
  passwordSpecialChar: () => string;
  passwordNumber: () => string;
}

/**
 * Creates validation helpers with translation support
 * @param t - Translation function from useTranslation hook
 * @returns Object with validation helper methods
 */
export const createValidationHelpers = (
  t: (key: string, fallback?: string) => string
): ValidationHelpers => ({
  /**
   * Required field validation
   * Uses: common.validation.required
   */
  required: (field: string) => {
    const message = t('common.validation.required', '{field} is required.');
    return message.replace('{field}', field);
  },

  /**
   * Invalid field validation
   * Uses: common.validation.invalid
   */
  invalid: (field: string) => {
    const message = t('common.validation.invalid', '{field} is invalid.');
    return message.replace('{field}', field);
  },

  /**
   * Minimum length validation
   * Uses: common.validation.minLength
   */
  minLength: (field: string, length: number) => {
    const message = t('common.validation.minLength', '{field} must be at least {length} characters long.');
    return message.replace('{field}', field).replace('{length}', length.toString());
  },

  /**
   * Maximum length validation
   * Uses: common.validation.maxLength
   */
  maxLength: (field: string, length: number) => {
    const message = t('common.validation.maxLength', '{field} cannot exceed {length} characters.');
    return message.replace('{field}', field).replace('{length}', length.toString());
  },

  /**
   * Minimum value validation
   * Uses: common.validation.min
   */
  min: (field: string, value: number) => {
    const message = t('common.validation.min', '{field} must be at least {value}.');
    return message.replace('{field}', field).replace('{value}', value.toString());
  },

  /**
   * Maximum value validation
   * Uses: common.validation.max
   */
  max: (field: string, value: number) => {
    const message = t('common.validation.max', '{field} cannot exceed {value}.');
    return message.replace('{field}', field).replace('{value}', value.toString());
  },

  /**
   * Pattern validation
   * Uses: common.validation.pattern
   */
  pattern: (field: string) => {
    const message = t('common.validation.pattern', '{field} format is invalid.');
    return message.replace('{field}', field);
  },

  /**
   * Email specific validation
   */
  email: () => {
    return t('auth.signup.validation.emailInvalid', 'Please enter a valid email address');
  },

  /**
   * Phone specific validation
   */
  phone: () => {
    return t('auth.signup.validation.phoneInvalid', 'Please enter a valid phone number');
  },

  /**
   * Password match validation
   */
  passwordMatch: () => {
    return t('auth.signup.validation.passwordMismatch', 'Passwords do not match');
  },

  /**
   * Password uppercase & lowercase validation
   */
  passwordUpperLower: () => {
    return t(
      'auth.signup.validation.passwordUpperLower',
      'Must contain at least one uppercase and one lowercase'
    );
  },

  /**
   * Password special character validation
   */
  passwordSpecialChar: () => {
    return t(
      'auth.signup.validation.passwordSpecialChar',
      'Must contain at least one special character'
    );
  },

  /**
   * Password number validation
   */
  passwordNumber: () => {
    return t(
      'auth.signup.validation.passwordNumber',
      'Must contain at least one numeric digit'
    );
  },
});

/**
 * Example usage:
 * 
 * const { t } = useTranslation(locale);
 * const v = createValidationHelpers(t);
 * 
 * const schema = z.object({
 *   firstName: z.string()
 *     .min(1, v.required('First name'))
 *     .min(2, v.minLength('First name', 2))
 *     .max(50, v.maxLength('First name', 50)),
 *   email: z.string()
 *     .min(1, v.required('Email'))
 *     .email(v.email('Email')),
 *   password: z.string()
 *     .min(8, v.minLength('Password', 8))
 *     .regex(/(?=.*[a-z])(?=.*[A-Z])/, v.passwordUpperLower())
 *     .regex(/[^A-Za-z0-9]/, v.passwordSpecialChar())
 *     .regex(/[0-9]/, v.passwordNumber())
 * });
 */
