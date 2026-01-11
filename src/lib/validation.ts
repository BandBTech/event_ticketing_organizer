import { isValidPhoneNumber } from "react-phone-number-input";
import { z } from "zod";

// import { useTranslation } from '@/hooks/useTranslation';



// Helper for required date string
const createRequiredDateSchema = (t: (key: string, fallback?: string) => string, fieldName?: string) =>
  z.string().min(1, fieldName ? `${fieldName} is required.` : t('event.validation.dateTimeRequired', 'This field is required.')).superRefine((val, ctx) => {
    const date = new Date(val);
    if (isNaN(date.getTime())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: t('common.validation.invalidDatetime', 'Enter valid datetime.'),
      });
      return;
    }
    if (date.getFullYear() > 9999) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: t('common.validation.yearLimit', 'Year cannot be more than 4 digits.'),
      });
      return;
    }

    // Check for past date (previous date validation)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) {
      const message = fieldName
        ? t('event.validation.fieldPastDate', '{field} cannot be in the past.').replace('{field}', fieldName)
        : t('event.validation.pastDate', 'Date cannot be in the past.');
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message,
      });
    }
  });

// Field Validation Limits
export const EVENT_TITLE_MAX = 200;
export const EVENT_DESC_MAX = 5000;
export const VENUE_NAME_MAX = 200;
export const VENUE_ADDRESS_MAX = 500;
export const TIER_NAME_MAX = 100;
export const TIER_DESC_MAX = 500;
export const STOP_SALES_REASON_MAX = 500;
export const CANCEL_REASON_MAX = 500;
// Numeric Limits
export const MAX_CAPACITY = 100000;
export const MAX_PRICE = 100000;
export const MAX_QUANTITY = 100000;
export const PROMO_CODE_NAME_MAX = 50;
export const PROMO_CODE_AMOUNT_MAX = 100000;
export const PROMO_CODE_QUANTITY_MAX = 100000;

// Helper to create a required number schema with proper "is required" message
const createRequiredNumberSchema = (
  t: (key: string, fallback?: string) => string,
  fieldName: string,
  minValue: number = 1,
  minMessage?: string,
  maxValue?: number,
  maxMessage?: string
) =>
  z.preprocess(
    (val) => {
      // Convert empty string or NaN to undefined so z.number() treats it as missing
      if (val === '' || val === null || val === undefined) return undefined;
      const num = Number(val);
      return isNaN(num) ? undefined : num;
    },
    z
      .number({
        error: t('common.validation.required', '{field} is required.').replace('{field}', fieldName),
      })
      .min(minValue, minMessage || t('common.validation.min', '{field} must be at least {value}.').replace('{field}', fieldName).replace('{value}', minValue.toString()))
      .max(maxValue || Number.MAX_SAFE_INTEGER, maxMessage || t('common.validation.max', '{field} cannot exceed {value}.').replace('{field}', fieldName).replace('{value}', (maxValue || Number.MAX_SAFE_INTEGER).toString()))
  );

export const createTicketSchema = (t: (key: string, fallback?: string) => string) => z
  .object({
    id: z.string().optional(),
    name: z
      .string()
      .min(1, t('event.validation.tierNameRequired', "Tier Name is required."))
      .max(TIER_NAME_MAX, t('event.validation.tierNameLength', "Tier Name must be under {max} characters.").replace('{max}', TIER_NAME_MAX.toString())),
    price: createRequiredNumberSchema(
      t,
      t('event.field.ticketPrice', 'Price'),
      1,
      t('event.validation.priceRequired', "Price must be at least 1."),
      MAX_PRICE,
      t('event.validation.priceMax', "Price cannot exceed {max}.").replace('{max}', MAX_PRICE.toString())
    ),
    quantity: createRequiredNumberSchema(
      t,
      t('event.field.ticketQuantity', 'Quantity'),
      1,
      t('event.validation.quantityMin', "Quantity must be at least 1."),
      MAX_QUANTITY,
      t('event.validation.quantityMax', "Quantity cannot exceed {max}.").replace('{max}', MAX_QUANTITY.toString())
    ),
    gst: z.preprocess(
      (val) => {
        if (val === '' || val === null || val === undefined) return undefined;
        const num = Number(val);
        return isNaN(num) ? undefined : num;
      },
      z
        .number({
          error: t('event.validation.gstRequired', "GST is required. Set to 0 if not applicable."),
        })
        .min(0, t('event.validation.gstPositive', "GST must be positive."))
        .max(100, t('event.validation.gstMax', "GST cannot exceed 100%."))
    ),
    salesStart: createRequiredDateSchema(t, t('event.field.salesStart', 'Sales Start Date')),
    salesEnd: createRequiredDateSchema(t, t('event.field.salesEnd', 'Sales End Date')),
  })
  .refine((data) => {
    if (!data.salesEnd || !data.salesStart) return true;
    return new Date(data.salesEnd) > new Date(data.salesStart);
  }, {
    message: t('event.validation.salesEndAfterStart', "Sales End Date must be after Sales Start Date."),
    path: ["salesEnd"],
  });

export const createPromoCodeSchema = (t: (key: string, fallback?: string) => string) => z.object({
  code: z
    .string()
    .min(1, t('event.validation.promoCodeRequired', "Promo Code is required."))
    .max(PROMO_CODE_NAME_MAX, t('event.validation.promoCodeMaxLength', "Promo Code must be under {max} characters.").replace('{max}', PROMO_CODE_NAME_MAX.toString()))
    .regex(/^[A-Z0-9_-]+$/, t('event.validation.promoCodeFormat', "Promo Code may only contain A-Z , 0-9, _ or -")),
  discountType: z.string().min(1, t('event.validation.discountTypeRequired', "Discount Type is required.")),
  amount: createRequiredNumberSchema(
    t,
    t('event.field.discountAmount', 'Amount'),
    1,
    t('event.validation.amountRequired', "Amount must be at least 1."),
    PROMO_CODE_AMOUNT_MAX,
    t('event.validation.amountMax', "Amount cannot exceed {max}.").replace('{max}', PROMO_CODE_AMOUNT_MAX.toLocaleString())
  ),
  quantity: createRequiredNumberSchema(
    t,
    t('event.field.discountQuantity', 'Quantity'),
    1,
    t('event.validation.quantityMin', "Quantity must be at least 1."),
    PROMO_CODE_QUANTITY_MAX,
    t('event.validation.quantityMax', "Quantity cannot exceed {max}.").replace('{max}', PROMO_CODE_QUANTITY_MAX.toLocaleString())
  ),
});

export const createEventSchema = (t: (key: string, fallback?: string) => string) => z
  .object({
    name: z.string()
      .min(1, t('event.validation.titleRequired', "Event Title is required."))
      .max(EVENT_TITLE_MAX, t('event.validation.titleMaxLength', "Event Title must be under {max} characters.").replace('{max}', EVENT_TITLE_MAX.toString())),
    description: z.string()
      .min(1, t('event.validation.descriptionRequired', "Event Description is required."))
      .max(EVENT_DESC_MAX, t('event.validation.descriptionMaxLength', "Event Description must be under {max} characters.").replace('{max}', EVENT_DESC_MAX.toString())),
    tags: z.array(z.string()).min(1, t('event.validation.tagsRequired', "At least one Tag is required.")),
    image: z.string().min(1, t('event.validation.imageRequired', "Image is required.")),
    venue: z.string()
      .min(1, t('event.validation.venueRequired', "Venue Name is required."))
      .max(VENUE_NAME_MAX, t('event.validation.venueMaxLength', "Venue Name must be under {max} characters.").replace('{max}', VENUE_NAME_MAX.toString())),
    venueAddress: z.string()
      .min(1, t('event.validation.venueAddressRequired', "Venue Address is required."))
      .max(VENUE_ADDRESS_MAX, t('event.validation.venueAddressMaxLength', "Venue Address must be under {max} characters.").replace('{max}', VENUE_ADDRESS_MAX.toString())),
    capacity: createRequiredNumberSchema(
      t,
      t('event.field.capacity', 'Capacity'),
      1,
      t('event.validation.capacityMin', "Capacity must be at least 1."),
      MAX_CAPACITY,
      t('event.validation.capacityMax', "Capacity cannot exceed {max}.").replace('{max}', MAX_CAPACITY.toString())
    ),
    timezone: z.string().min(1, t('event.validation.timezoneRequired', "Timezone is required.")),
    startDate: createRequiredDateSchema(t, t('event.field.startDateTime', 'Event Start Date')),
    endDate: createRequiredDateSchema(t, t('event.field.endDateTime', 'Event End Date')),
    tickets: z.array(createTicketSchema(t)).min(1, t('event.validation.ticketsRequired', "At least one Ticket is required.")),
    promoCodes: z.array(createPromoCodeSchema(t)).optional(),
  })
  .refine((data) => {
    if (!data.endDate || !data.startDate) return true;
    return new Date(data.endDate) > new Date(data.startDate);
  }, {
    message: t('event.validation.endDateAfterStart', "Event End Date must be after Event Start Date."),
    path: ["endDate"],
  })
  .superRefine((data, ctx) => {
    // Validate that each ticket's sales dates are not after the event start date
    if (!data.startDate) return;
    const eventStartDate = new Date(data.startDate);

    data.tickets.forEach((ticket, index) => {
      // Sales start date should not be after event start date
      if (ticket.salesStart) {
        const salesStartDate = new Date(ticket.salesStart);
        if (salesStartDate > eventStartDate) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t('event.validation.salesStartBeforeEventStart', "Sales Start Date cannot be after Event Start Date."),
            path: ["tickets", index, "salesStart"],
          });
        }
      }

      // Sales end date should not be after event start date
      if (ticket.salesEnd) {
        const salesEndDate = new Date(ticket.salesEnd);
        if (salesEndDate > eventStartDate) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t('event.validation.salesEndBeforeEventStart', "Sales End Date cannot be after Event Start Date."),
            path: ["tickets", index, "salesEnd"],
          });
        }
      }
    });

    // Check for duplicate promo codes
    if (data.promoCodes && data.promoCodes.length > 0) {
      const codes = data.promoCodes.map((p, i) => ({ code: p.code, index: i }));
      const seen = new Set();

      codes.forEach(({ code, index }) => {
        if (!code) return;
        const normalizedCode = code.trim().toUpperCase();
        if (seen.has(normalizedCode)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t('event.validation.duplicatePromoCode', "Promo Code must be unique."),
            path: ["promoCodes", index, "code"],
          });
        }
        seen.add(normalizedCode);
      });
    }

    // Check for duplicate tier names
    if (data.tickets && data.tickets.length > 0) {
      const names = data.tickets.map((t, i) => ({ name: t.name, index: i }));
      const seenNames = new Set();

      names.forEach(({ name, index }) => {
        if (!name) return;
        const normalizedName = name.trim().toLowerCase();
        if (seenNames.has(normalizedName)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t('event.validation.duplicateTierName', "Tier Name must be unique."),
            path: ["tickets", index, "name"],
          });
        }
        seenNames.add(normalizedName);
      });
    }
  });

export const createTierTemplateSchema = (t: (key: string, fallback?: string) => string) => z.object({
  template_name: z.string()
    .min(1, t('event.validation.tierNameRequired', "Tier Template Name is required."))
    .max(TIER_NAME_MAX, t('event.validation.tierNameLength', "Tier Template Name must be under {max} characters.").replace('{max}', TIER_NAME_MAX.toString())),
  description: z.string()
    .max(TIER_DESC_MAX, t('event.validation.tierDescLength', "Event Description must be under {max} characters.").replace('{max}', TIER_DESC_MAX.toString()))
    .optional(),
});

export type EventFormData = z.infer<ReturnType<typeof createEventSchema>>;
export type TicketFormData = z.infer<ReturnType<typeof createTicketSchema>>;
export type PromoCodeFormData = z.infer<ReturnType<typeof createPromoCodeSchema>>;
export type TierTemplateFormData = z.infer<ReturnType<typeof createTierTemplateSchema>>;

export const createOrgUserSchema = (t: (key: string, fallback?: string) => string) => {
  const v = createValidationHelpers(t);

  return z.object({
    first_name: z.string()
      .trim()
      .min(1, v.required("First Name"))
      .min(2, t('common.validation.firstNameMin', "First Name must be at least 2 characters."))
      .max(50, t('common.validation.firstNameMax', "First Name must not exceed 50 characters.")),
    last_name: z.string()
      .trim()
      .min(1, v.required("Last Name"))
      .min(2, t('common.validation.lastNameMin', "Last Name must be at least 2 characters."))
      .max(50, t('common.validation.lastNameMax', "Last Name must not exceed 50 characters.")),
    email: z.string()
      .min(1, t('common.validation.emailRequired', "Email is required."))
      .email(t('common.validation.emailInvalid', "Invalid email address.")),
    password: z.string()
      .min(1, v.required("Password"))
      .min(8, t('auth.validation.passwordMin', "Password must be at least 8 characters."))
      .regex(/(?=.*[a-z])(?=.*[A-Z])/, v.passwordUpperLower())
      .regex(/[^A-Za-z0-9]/, v.passwordSpecialChar())
      .regex(/[0-9]/, v.passwordNumber()),
    phone: z.string()
      .optional()
      .refine((val) => !val || isValidPhoneNumber(val), v.phone("Phone")),
    role_name: z.enum(['staff', 'manager']),
  });
};

// Update schema uses t for consistency and potential future validation messages
export const updateOrgUserSchema = (t: (key: string, fallback?: string) => string) => z.object({
  role_type: z.enum(['staff', 'manager'], {
    message: t('users.validation.roleRequired', 'Role is required')
  }),
  active: z.boolean().optional(),
});

export type CreateOrgUserFormData = z.infer<ReturnType<typeof createOrgUserSchema>>;
export type UpdateOrgUserFormData = z.infer<ReturnType<typeof updateOrgUserSchema>>;

export const stopSalesSchema = (t: (key: string, fallback?: string) => string) => z.object({
  reason: z.string()
    .max(STOP_SALES_REASON_MAX, t('event.validation.stopSalesReasonMaxLength', "Reason cannot exceed {max} characters.").replace('{max}', STOP_SALES_REASON_MAX.toString()))
    .optional(),
});

export type StopSalesFormData = z.infer<ReturnType<typeof stopSalesSchema>>;

export const cancelEventSchema = (t: (key: string, fallback?: string) => string) => z.object({
  reason: z.string()
    .min(1, t('event.validation.cancelReasonRequired', "Reason is required."))
    .min(10, t('event.validation.cancelReasonMinLength', "Reason must be at least 10 characters."))
    .max(CANCEL_REASON_MAX, t('event.validation.cancelReasonMaxLength', "Reason cannot exceed {max} characters.").replace('{max}', CANCEL_REASON_MAX.toString())),
});

export type CancelEventFormData = z.infer<ReturnType<typeof cancelEventSchema>>;

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

export const createOrganizerProfileSchema = (t: (key: string, fallback?: string) => string) => z.object({
  business_name: z
    .string()
    .min(1, t('profile.validation.businessNameRequired', 'Business name is required.'))
    .min(3, t('profile.validation.businessNameMinLength', 'Business name must be at least 3 characters.'))
    .max(50, t('profile.validation.businessNameMaxLength', 'Business name must be less than 50 characters.')),
  business_description: z
    .string()
    .max(500, t('profile.validation.descriptionMaxLength', 'Description must be less than 500 characters.'))
    .optional(),
});

export type OrganizerProfileFormValues = z.infer<ReturnType<typeof createOrganizerProfileSchema>>;
