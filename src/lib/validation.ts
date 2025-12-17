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
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: t('event.validation.pastDate', 'Date cannot be in the past.'),
      });
    }
  });

// Helper to create a required number schema with proper "is required" message
const createRequiredNumberSchema = (
  t: (key: string, fallback?: string) => string,
  fieldName: string,
  minValue: number = 1,
  minMessage?: string
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
  );

export const createTicketSchema = (t: (key: string, fallback?: string) => string) => z
  .object({
    id: z.string().optional(),
    name: z
      .string()
      .min(1, t('event.validation.ticketNameRequired', "Ticket name is required."))
      .max(100, t('event.validation.ticketNameLength', "Ticket name must be under 100 characters.")),
    price: createRequiredNumberSchema(
      t,
      t('event.field.ticketPrice', 'Price'),
      1,
      t('event.validation.priceRequired', "Price is required and must be at least 1.")
    ),
    quantity: createRequiredNumberSchema(
      t,
      t('event.field.ticketQuantity', 'Quantity'),
      1,
      t('event.validation.quantityMin', "Quantity must be at least 1.")
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
    message: t('event.validation.salesEndAfterStart', "Sales end date must be after Sales start date."),
    path: ["salesEnd"],
  });

export const createPromoCodeSchema = (t: (key: string, fallback?: string) => string) => z.object({
  code: z
    .string()
    .min(1, t('event.validation.promoCodeRequired', "Promo code is required."))
    .regex(/^[A-Z0-9_-]+$/, t('event.validation.promoCodeFormat', "Promo code may only contain A-Z , 0-9, _ or -")),
  discountType: z.string().min(1, t('event.validation.discountTypeRequired', "Discount type is required.")),
  amount: createRequiredNumberSchema(
    t,
    t('event.field.discountAmount', 'Amount'),
    1,
    t('event.validation.amountRequired', "Amount is required and must be at least 1.")
  ),
  quantity: z.preprocess(
    (val) => {
      if (val === '' || val === null || val === undefined) return undefined;
      const num = Number(val);
      return isNaN(num) ? undefined : num;
    },
    z
      .number({
        error: t('common.validation.required', '{field} is required.').replace('{field}', t('event.field.discountQuantity', 'Quantity')),
      })
      .int(t('event.validation.quantityInteger', "Quantity must be integer."))
      .min(1, t('event.validation.quantityMin', "Quantity must be at least 1."))
  ),
});

export const createEventSchema = (t: (key: string, fallback?: string) => string) => z
  .object({
    name: z.string()
      .min(1, t('event.validation.titleRequired', "Event title is required."))
      .max(200, t('event.validation.titleMaxLength', "Event title must be under 200 characters.")),
    description: z.string()
      .min(1, t('event.validation.descriptionRequired', "Event description is required.")),
    tags: z.array(z.string()).min(1, t('event.validation.tagsRequired', "At least one tag is required.")),
    image: z.string().min(1, t('event.validation.imageRequired', "Image is required.")),
    venue: z.string()
      .min(1, t('event.validation.venueRequired', "Venue name is required."))
      .max(200, t('event.validation.venueMaxLength', "Venue name must be under 200 characters.")),
    venueAddress: z.string()
      .min(1, t('event.validation.venueAddressRequired', "Venue address is required."))
      .max(500, t('event.validation.venueAddressMaxLength', "Venue address must be under 500 characters.")),
    capacity: createRequiredNumberSchema(
      t,
      t('event.field.capacity', 'Capacity'),
      1,
      t('event.validation.capacityMin', "Capacity must be at least 1.")
    ),
    timezone: z.string().min(1, t('event.validation.timezoneRequired', "Timezone is required.")),
    startDate: createRequiredDateSchema(t, t('event.field.startDateTime', 'Event Start Date')),
    endDate: createRequiredDateSchema(t, t('event.field.endDateTime', 'Event End Date')),
    tickets: z.array(createTicketSchema(t)).min(1, t('event.validation.ticketsRequired', "At least one ticket is required.")),
    promoCodes: z.array(createPromoCodeSchema(t)).optional(),
  })
  .refine((data) => {
    if (!data.endDate || !data.startDate) return true;
    return new Date(data.endDate) > new Date(data.startDate);
  }, {
    message: t('event.validation.endDateAfterStart', "Event end date must be after Event start date."),
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
            message: t('event.validation.salesStartBeforeEventStart', "Sales start date cannot be after event start date."),
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
            message: t('event.validation.salesEndBeforeEventStart', "Sales end date cannot be after event start date."),
            path: ["tickets", index, "salesEnd"],
          });
        }
      }
    });
  });

export const createTierTemplateSchema = (t: (key: string, fallback?: string) => string) => z.object({
  template_name: z.string().min(1, t('event.validation.tierNameRequired', "Tier template name is required.")),
  description: z.string().optional(),
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
      .min(1, v.required("First name"))
      .min(2, t('common.validation.firstNameMin', "First name must be at least 2 characters."))
      .max(50, t('common.validation.firstNameMax', "First name must not exceed 50 characters.")),
    last_name: z.string()
      .trim()
      .min(1, v.required("Last name"))
      .min(2, t('common.validation.lastNameMin', "Last name must be at least 2 characters."))
      .max(50, t('common.validation.lastNameMax', "Last name must not exceed 50 characters.")),
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
