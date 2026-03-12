import { isValidPhoneNumber } from "react-phone-number-input";
import { z } from "zod";

// import { useTranslation } from '@/hooks/useTranslation';

// Helper for required date string
// fieldNameKey should be in format "translationKey:FallbackName" for translation support
const createRequiredDateSchema = (
  t: (
    key: string,
    fallback?: string,
    params?: Record<string, string | number>,
  ) => string,
  fieldNameKey?: string,
) =>
  z
    .string()
    .min(
      1,
      fieldNameKey
        ? `event.validation.dateTimeRequired|field:${fieldNameKey}`
        : "This field is required.",
    )
    .superRefine((val, ctx) => {
      const date = new Date(val);
      if (isNaN(date.getTime())) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t(
            "common.validation.invalidDatetime",
            "Enter valid datetime.",
          ),
        });
        return;
      }
      if (date.getFullYear() > 9999) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t(
            "common.validation.yearLimit",
            "Year cannot be more than 4 digits.",
          ),
        });
        return;
      }

      // Check for past date (previous date validation)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (date < today) {
        const message = fieldNameKey
          ? `event.validation.fieldPastDate|field:${fieldNameKey}`
          : t("event.validation.pastDate", "Date cannot be in the past.");
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
export const BUSINESS_NAME_MAX = 50;
export const BUSINESS_NAME_MIN = 3;
export const BUSINESS_DESC_MAX = 500;
export const FIRST_NAME_MIN = 2;
export const LAST_NAME_MIN = 2;
export const FIRST_NAME_MAX = 50;
export const LAST_NAME_MAX = 50;
export const PASSWORD_MIN = 8;
export const PASSWORD_MAX = 50;
export const STOP_SALES_REASON_MIN = 1;
export const CANCEL_REASON_MIN = 1;

// Numeric Limits
export const MAX_CAPACITY = 100000;
export const MAX_PRICE = 100000;
export const MAX_QUANTITY = 100000;
export const PROMO_CODE_NAME_MAX = 50;
export const PROMO_CODE_AMOUNT_MAX = 100000;
export const PROMO_CODE_QUANTITY_MAX = 100000;

// Auth Schemas
export const loginSchema = (
  t: (
    key: string,
    fallback?: string,
    params?: Record<string, string | number>,
  ) => string,
) =>
  z.object({
    email: z
      .string()
      .min(1, t("auth.login.validation.emailRequired", "Email is required."))
      .email(t("auth.login.validation.emailInvalid", "Email is invalid.")),
    password: z
      .string()
      .min(
        1,
        t("auth.login.validation.passwordRequired", "Password is required."),
      ),
    rememberMe: z.boolean(),
  });

export type LoginFormData = z.infer<ReturnType<typeof loginSchema>>;

// Registration Schemas
export const registerBasicInfoSchema = (
  t: (
    key: string,
    fallback?: string,
    params?: Record<string, string | number>,
  ) => string,
) =>
  z.object({
    firstName: z
      .string()
      .min(
        1,
        t(
          "auth.signup.validation.firstNameRequired",
          "First name is required.",
        ),
      )
      .min(
        FIRST_NAME_MIN,
        t(
          "auth.signup.validation.firstNameTooShort",
          "First name must be at least {min} characters.",
          { min: FIRST_NAME_MIN },
        ),
      )
      .max(
        FIRST_NAME_MAX,
        t(
          "auth.signup.validation.firstNameTooLong",
          "First name must not exceed {max} characters.",
          { max: FIRST_NAME_MAX },
        ),
      ),
    lastName: z
      .string()
      .min(
        1,
        t("auth.signup.validation.lastNameRequired", "Last name is required."),
      )
      .min(
        LAST_NAME_MIN,
        t(
          "auth.signup.validation.lastNameTooShort",
          "Last name must be at least {min} characters.",
          { min: LAST_NAME_MIN },
        ),
      )
      .max(
        LAST_NAME_MAX,
        t(
          "auth.signup.validation.lastNameTooLong",
          "Last name must not exceed {max} characters.",
          { max: LAST_NAME_MAX },
        ),
      ),
    email: z
      .string()
      .min(1, t("auth.signup.validation.emailRequired", "Email is required."))
      .email(
        t("auth.signup.validation.emailInvalid", "Invalid email address."),
      ),
    phone: z
      .string()
      .min(
        1,
        t(
          "auth.signup.validation.phoneRequired",
          "Contact number is required.",
        ),
      )
      .refine(
        (val) => isValidPhoneNumber(val),
        t("auth.signup.validation.phoneInvalid", "Invalid phone number."),
      ),
  });

export type RegisterBasicInfoFormData = z.infer<
  ReturnType<typeof registerBasicInfoSchema>
>;

export const registerOTPSchema = (
  t: (
    key: string,
    fallback?: string,
    params?: Record<string, string | number>,
  ) => string,
) =>
  z.object({
    otp: z
      .string()
      .length(
        6,
        t("auth.verifyOTP.validation.otpLength", "OTP must be 6 digits."),
      ),
  });

export type RegisterOTPFormData = z.infer<ReturnType<typeof registerOTPSchema>>;

export const registerPasswordSchema = (
  t: (
    key: string,
    fallback?: string,
    params?: Record<string, string | number>,
  ) => string,
) =>
  z
    .object({
      password: z
        .string()
        .min(
          1,
          t("auth.signup.validation.passwordRequired", "Password is required."),
        )
        .min(
          PASSWORD_MIN,
          t(
            "auth.signup.validation.passwordMin",
            "Password must be at least {min} characters.",
            { min: PASSWORD_MIN },
          ),
        )
        .max(
          PASSWORD_MAX,
          t(
            "auth.signup.validation.passwordMax",
            "Password cannot exceed {max} characters.",
            { max: PASSWORD_MAX },
          ),
        )
        .regex(
          /(?=.*[a-z])(?=.*[A-Z])/,
          t(
            "auth.signup.validation.passwordUpperLower",
            "Password must contain at least one uppercase and one lowercase letter.",
          ),
        )
        .regex(
          /[^A-Za-z0-9]/,
          t(
            "auth.signup.validation.passwordSpecialChar",
            "Password must contain at least one special character.",
          ),
        )
        .regex(
          /[0-9]/,
          t(
            "auth.signup.validation.passwordNumber",
            "Password must contain at least one number.",
          ),
        ),
      confirmPassword: z
        .string()
        .min(
          1,
          t(
            "auth.signup.validation.confirmPasswordRequired",
            "Confirm password is required.",
          ),
        ),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t(
        "auth.signup.validation.passwordMismatch",
        "Passwords do not match.",
      ),
      path: ["confirmPassword"],
    });

export type RegisterPasswordFormData = z.infer<
  ReturnType<typeof registerPasswordSchema>
>;

// Forgot Password Schema
export const forgotPasswordSchema = (
  t: (
    key: string,
    fallback?: string,
    params?: Record<string, string | number>,
  ) => string,
) =>
  z.object({
    email: z
      .string()
      .min(1, t("auth.login.validation.emailRequired", "Email is required."))
      .email(t("auth.login.validation.emailInvalid", "Invalid email address.")),
  });

export type ForgotPasswordFormData = z.infer<
  ReturnType<typeof forgotPasswordSchema>
>;

// Reset Password Schema
export const resetPasswordSchema = (
  t: (
    key: string,
    fallback?: string,
    params?: Record<string, string | number>,
  ) => string,
) =>
  z
    .object({
      newPassword: z
        .string()
        .min(
          1,
          t("auth.login.validation.passwordRequired", "Password is required."),
        )
        .min(
          PASSWORD_MIN,
          t(
            "auth.signup.validation.passwordMin",
            "Password must be at least {min} characters.",
            { min: PASSWORD_MIN },
          ),
        )
        .max(
          PASSWORD_MAX,
          t(
            "auth.signup.validation.passwordMax",
            "Password cannot exceed {max} characters.",
            { max: PASSWORD_MAX },
          ),
        )
        .regex(
          /(?=.*[a-z])(?=.*[A-Z])/,
          t(
            "auth.signup.validation.passwordUpperLower",
            "Password must contain at least one uppercase and one lowercase letter.",
          ),
        )
        .regex(
          /[^A-Za-z0-9]/,
          t(
            "auth.signup.validation.passwordSpecialChar",
            "Password must contain at least one special character.",
          ),
        )
        .regex(
          /[0-9]/,
          t(
            "auth.signup.validation.passwordNumber",
            "Password must contain at least one number.",
          ),
        ),
      confirmPassword: z
        .string()
        .min(
          1,
          t(
            "auth.signup.validation.confirmPasswordRequired",
            "Confirm password is required.",
          ),
        ),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: t(
        "auth.signup.validation.passwordMismatch",
        "Passwords do not match.",
      ),
      path: ["confirmPassword"],
    });

export type ResetPasswordFormData = z.infer<
  ReturnType<typeof resetPasswordSchema>
>;

// Helper to create a required number schema with proper "is required" message
// fieldNameKey should be in format "translationKey:FallbackName" for translation support
const createRequiredNumberSchema = (
  t: (
    key: string,
    fallback?: string,
    params?: Record<string, string | number>,
  ) => string,
  fieldNameKey: string,
  minValue: number = 1,
  maxValue: number = Number.MAX_SAFE_INTEGER,
  isInteger: boolean = false,
) => {
  // Use pipe format: "common.validation.required|field:translationKey:FallbackName"
  let schema = z.number({
    message: `common.validation.required|field:${fieldNameKey}`,
  });

  if (isInteger) {
    schema = schema.int(`common.validation.integer|field:${fieldNameKey}`);
  }

  return z.preprocess(
    (val) => {
      // Convert empty string or NaN to undefined so z.number() treats it as missing
      if (val === "" || val === null || val === undefined) return undefined;
      const num = Number(val);
      return isNaN(num) ? undefined : num;
    },
    schema
      .min(
        minValue,
        `common.validation.min|field:${fieldNameKey},value:${minValue}`,
      )
      .max(
        maxValue,
        `common.validation.max|field:${fieldNameKey},value:${maxValue}`,
      ),
  );
};

export const createTicketSchema = (
  t: (
    key: string,
    fallback?: string,
    params?: Record<string, string | number>,
  ) => string,
) =>
  z
    .object({
      id: z.string().optional(),
      name: z
        .string()
        .min(
          1,
          t("event.validation.tierNameRequired", "Tier Name is required."),
        )
        .max(
          TIER_NAME_MAX,
          t(
            "event.validation.tierNameLength",
            "Tier Name must be under {max} characters.",
            { max: TIER_NAME_MAX.toString() },
          ),
        ),
      price: createRequiredNumberSchema(
        t,
        "event.field.ticketPrice:Price",
        1,
        MAX_PRICE,
      ),
      quantity: createRequiredNumberSchema(
        t,
        "event.field.ticketQuantity:Quantity",
        1,
        MAX_QUANTITY,
        true,
      ),
      gst: z.preprocess(
        (val) => {
          if (val === "" || val === null || val === undefined) return 0;
          const num = Number(val);
          return isNaN(num) ? 0 : num;
        },
        z
          .number({
            message: "GST must be a number.",
          })
          .min(0, t("event.validation.gstPositive", "GST must be positive."))
          .max(100, t("event.validation.gstMax", "GST cannot exceed 100%.")),
      ).optional().default(0),
      salesStart: createRequiredDateSchema(
        t,
        "event.field.salesStart:Sales Start Date",
      ),
      salesEnd: createRequiredDateSchema(
        t,
        "event.field.salesEnd:Sales End Date",
      ),
    })
    .refine(
      (data) => {
        if (!data.salesEnd || !data.salesStart) return true;
        return new Date(data.salesEnd) > new Date(data.salesStart);
      },
      {
        message: t(
          "event.validation.salesEndAfterStart",
          "Sales End Date must be after Sales Start Date.",
        ),
        path: ["salesEnd"],
      },
    );
// .superRefine((data, ctx) => {
//   // Skip 24hr validation if editing an existing ticket (has ID)
//   if (data.id) return;

//   const now = new Date();
//   // 24 hours from now
//   const bufferTime = new Date(now.getTime() + 24 * 60 * 60 * 1000);

//   if (data.salesStart) {
//     const startDate = new Date(data.salesStart);
//     if (startDate < bufferTime) {
//       ctx.addIssue({
//         code: z.ZodIssueCode.custom,
//         message: t('event.validation.salesStart24Hrs', "Sales Start Date must be at least 24 hours from now."),
//         path: ["salesStart"],
//       });
//     }
//   }

//   if (data.salesEnd) {
//     const endDate = new Date(data.salesEnd);

//     if (endDate < bufferTime) {
//       ctx.addIssue({
//         code: z.ZodIssueCode.custom,
//         message: t('event.validation.salesEnd24Hrs', "Sales End Date must be at least 24 hours from now."),
//         path: ["salesEnd"],
//       });
//     }
//   }
// })

export const createPromoCodeSchema = (
  t: (
    key: string,
    fallback?: string,
    params?: Record<string, string | number>,
  ) => string,
) =>
  z
    .object({
      code: z
        .string()
        .min(
          1,
          t("event.validation.promoCodeRequired", "Promo Code is required."),
        )
        .max(
          PROMO_CODE_NAME_MAX,
          t(
            "event.validation.promoCodeMaxLength",
            "Promo Code must be under {max} characters.",
            { max: PROMO_CODE_NAME_MAX.toString() },
          ),
        )
        .regex(
          /^[A-Z0-9_-]+$/,
          t(
            "event.validation.promoCodeFormat",
            "Promo Code may only contain A-Z , 0-9, _ or -",
          ),
        ),
      discountType: z
        .string()
        .min(
          1,
          t(
            "event.validation.discountTypeRequired",
            "Discount Type is required.",
          ),
        ),
      amount: z.preprocess((val) => {
        if (val === "" || val === null || val === undefined) return undefined;
        const num = Number(val);
        return isNaN(num) ? undefined : num;
      }, z.number().optional()),
      quantity: createRequiredNumberSchema(
        t,
        "event.field.discountQuantity:Quantity",
        1,
        PROMO_CODE_QUANTITY_MAX,
        true,
      ),
    })
    .superRefine((data, ctx) => {
      const { discountType, amount } = data;

      // Handle empty amount based on discount type
      if (amount === undefined || amount === null) {
        const message =
          discountType === "percentage"
            ? t(
              "event.validation.discountPercentageRequired",
              "Discount Percentage is required.",
            )
            : t(
              "event.validation.discountAmountRequired",
              "Discount Amount is required.",
            );
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message,
          path: ["amount"],
        });
        return;
      }

      if (discountType === "percentage") {
        if (!amount) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t(
              "event.validation.discountPercentageRequired",
              "Discount Percentage is required.",
            ),
            path: ["amount"],
          });
        }
        // Percentage validation: 0.01 - 100, max 2 decimal places
        if (amount < 0.01) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t(
              "event.validation.percentageMin",
              "Percentage must be at least 0.01%.",
            ),
            path: ["amount"],
          });
        }
        if (amount > 100) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t(
              "event.validation.percentageMax",
              "Percentage cannot exceed 100%.",
            ),
            path: ["amount"],
          });
        }
        // Check for max 2 decimal places
        const decimalStr = amount.toString();
        const decimalPart = decimalStr.split(".")[1];
        if (decimalPart && decimalPart.length > 2) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t(
              "event.validation.percentageDecimals",
              "Percentage can have at most 2 decimal places.",
            ),
            path: ["amount"],
          });
        }
      } else {
        // Amount (fixed) validation: 1 - PROMO_CODE_AMOUNT_MAX
        if (amount < 1) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t(
              "event.validation.amountRequired",
              "Amount must be at least 1.",
            ),
            path: ["amount"],
          });
        }
        if (amount > PROMO_CODE_AMOUNT_MAX) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t(
              "event.validation.amountMax",
              "Amount cannot exceed {max}.",
              { max: PROMO_CODE_AMOUNT_MAX.toLocaleString() },
            ),
            path: ["amount"],
          });
        }
      }
    });

export const createEventSchema = (
  t: (
    key: string,
    fallback?: string,
    params?: Record<string, string | number>,
  ) => string,
) =>
  z
    .object({
      name: z
        .string()
        .min(1, t("event.validation.titleRequired", "Event Title is required."))
        .max(
          EVENT_TITLE_MAX,
          t(
            "event.validation.titleMaxLength",
            "Event Title must be under {max} characters.",
            { max: EVENT_TITLE_MAX.toString() },
          ),
        ),
      description: z
        .string()
        .min(
          1,
          t(
            "event.validation.descriptionRequired",
            "Event Description is required.",
          ),
        )
        .superRefine((val, ctx) => {
          const textLength = val.replace(/<[^>]*>/g, "").length;
          if (textLength > EVENT_DESC_MAX) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: t(
                "event.validation.descriptionMaxLength",
                "Event Description must be under {max} characters.",
                { max: EVENT_DESC_MAX.toString() },
              ),
            });
          }
        }),
      tags: z
        .array(z.string())
        .min(
          1,
          t("event.validation.tagsRequired", "At least one Tag is required."),
        ),
      image: z
        .string()
        .min(
          1,
          t("event.validation.imageRequired", "Banner Image is required."),
        ),
      venue: z
        .string()
        .min(1, t("event.validation.venueRequired", "Venue Name is required."))
        .max(
          VENUE_NAME_MAX,
          t(
            "event.validation.venueMaxLength",
            "Venue Name must be under {max} characters.",
            { max: VENUE_NAME_MAX.toString() },
          ),
        ),
      venueAddress: z
        .string()
        .min(
          1,
          t(
            "event.validation.venueAddressRequired",
            "Venue Address is required.",
          ),
        )
        .max(
          VENUE_ADDRESS_MAX,
          t(
            "event.validation.venueAddressMaxLength",
            "Venue Address must be under {max} characters.",
            { max: VENUE_ADDRESS_MAX.toString() },
          ),
      )
        .superRefine((val, ctx) => {
          // Only validate as coordinates when the value strictly matches numeric "lat,lng" format.
          // This avoids false negatives on normal addresses like "Kathmandu, Nepal".
          const coordMatch = val.match(/^(-?\d*\.?\d*),(-?\d*\.?\d*)$/);
          if (!coordMatch) return;

          const [, latStr, lngStr] = coordMatch;

          if (!latStr) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: t(
                "event.validation.latitudeRequired",
                "Latitude is required.",
              ),
            });
          } else {
            const lat = parseFloat(latStr);
            if (isNaN(lat) || lat < -90 || lat > 90) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: t(
                  "event.validation.latitudeRange",
                  "Latitude must be between -90 and 90",
                ),
              });
            }
          }

          if (!lngStr) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: t(
                "event.validation.longitudeRequired",
                "Longitude is required.",
              ),
            });
          } else {
            const lng = parseFloat(lngStr);
            if (isNaN(lng) || lng < -180 || lng > 180) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: t(
                  "event.validation.longitudeRange",
                  "Longitude must be between -180 and 180",
                ),
              });
            }
          }
        }),
      capacity: createRequiredNumberSchema(
        t,
        "event.field.capacity:Capacity",
        1,
        MAX_CAPACITY,
        true,
      ),
      timezone: z
        .string()
        .min(
          1,
          t("event.validation.timezoneRequired", "Timezone is required."),
        ),
      startDate: createRequiredDateSchema(
        t,
        "event.field.startDateTime:Event Start Date",
      ),
      endDate: createRequiredDateSchema(
        t,
        "event.field.endDateTime:Event End Date",
      ),
      tickets: z
        .array(createTicketSchema(t))
        .min(
          1,
          t(
            "event.validation.ticketsRequired",
            "At least one Ticket is required.",
          ),
        ),
      promoCodes: z.array(createPromoCodeSchema(t)).optional(),
    })
    .refine(
      (data) => {
        if (!data.endDate || !data.startDate) return true;
        return new Date(data.endDate) > new Date(data.startDate);
      },
      {
        message: t(
          "event.validation.endDateAfterStart",
          "Event End Date must be after Event Start Date.",
        ),
        path: ["endDate"],
      },
    )
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
              message: t(
                "event.validation.salesStartBeforeEventStart",
                "Sales Start Date cannot be after Event Start Date.",
              ),
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
              message: t(
                "event.validation.salesEndBeforeEventStart",
                "Sales End Date cannot be after Event Start Date.",
              ),
              path: ["tickets", index, "salesEnd"],
            });
          }
        }
      });

      // Validate ticket quantities sum <= capacity
      if (data.capacity && data.tickets && data.tickets.length > 0) {
        const totalTickets = data.tickets.reduce((sum, ticket) => {
          return sum + (ticket.quantity || 0);
        }, 0);

        if (totalTickets > data.capacity) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t(
              "event.validation.capacityExceeded",
              "Total number of tickets ({total}) cannot exceed venue capacity ({capacity}).",
              { total: totalTickets, capacity: data.capacity }
            ),
            path: ["capacity"],
          });
          
          // Also attach to tickets array for visibility in ticket section
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t(
              "event.validation.capacityExceeded",
              "Total number of tickets ({total}) cannot exceed venue capacity ({capacity}).",
              { total: totalTickets, capacity: data.capacity }
            ),
            path: ["tickets"],
          });
        }
      }

      // Check for duplicate promo codes
      if (data.promoCodes && data.promoCodes.length > 0) {
        const codes = data.promoCodes.map((p, i) => ({
          code: p.code,
          index: i,
        }));
        const seen = new Set();

        codes.forEach(({ code, index }) => {
          if (!code) return;
          const normalizedCode = code.trim().toUpperCase();
          if (seen.has(normalizedCode)) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: t(
                "event.validation.duplicatePromoCode",
                "Promo Code must be unique.",
              ),
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
              message: t(
                "event.validation.duplicateTierName",
                "Tier Name must be unique.",
              ),
              path: ["tickets", index, "name"],
            });
          }
          seenNames.add(normalizedName);
        });
      }

      // Check for duplicate tags
      if (data.tags && data.tags.length > 0) {
        const tags = data.tags.map((tag, i) => ({ tag, index: i }));
        const seenTags = new Set();

        tags.forEach(({ tag, index }) => {
          if (!tag) return;
          const normalizedTag = tag.trim().toLowerCase();
          if (seenTags.has(normalizedTag)) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: t("event.validation.duplicateTag", "Tag already exists"),
              path: ["tags"], // Attach error to the field itself to be displayed by TranslatedFormMessage
            });
          }
          seenTags.add(normalizedTag);
        });
      }
    });

export const createTierTemplateSchema = (
  t: (
    key: string,
    fallback?: string,
    params?: Record<string, string | number>,
  ) => string,
) =>
  z.object({
    template_name: z
      .string()
      .min(1, t("event.validation.tierNameRequired", "Tier Name is required."))
      .max(
        TIER_NAME_MAX,
        t(
          "event.validation.tierNameLength",
          "Tier Name must be under {max} characters.",
          { max: TIER_NAME_MAX.toString() },
        ),
      ),
    description: z
      .string()
      .max(
        TIER_DESC_MAX,
        t(
          "event.validation.tierDescLength",
          "Tier Description must be under {max} characters.",
          { max: TIER_DESC_MAX.toString() },
        ),
      )
      .optional(),
  });

export type EventFormData = z.infer<ReturnType<typeof createEventSchema>>;
export type TicketFormData = z.infer<ReturnType<typeof createTicketSchema>>;
export type PromoCodeFormData = z.infer<
  ReturnType<typeof createPromoCodeSchema>
>;
export type TierTemplateFormData = z.infer<
  ReturnType<typeof createTierTemplateSchema>
>;

export const createOrgUserSchema = (
  t: (
    key: string,
    fallback?: string,
    params?: Record<string, string | number>,
  ) => string,
) => {
  const v = createValidationHelpers(t);

  return z.object({
    first_name: z
      .string()
      .trim()
      .min(
        1,
        t(
          "auth.signup.validation.firstNameRequired",
          "First Name is required.",
        ),
      )
      .min(
        FIRST_NAME_MIN,
        t(
          "auth.signup.validation.firstNameTooShort",
          "First Name must be at least {min} characters.",
          { min: FIRST_NAME_MIN.toString() },
        ),
      )
      .max(
        FIRST_NAME_MAX,
        t(
          "auth.signup.validation.firstNameTooLong",
          "First Name must not exceed {max} characters.",
          { max: FIRST_NAME_MAX.toString() },
        ),
      ),
    last_name: z
      .string()
      .trim()
      .min(
        1,
        t("auth.signup.validation.lastNameRequired", "Last Name is required."),
      )
      .min(
        LAST_NAME_MIN,
        t(
          "auth.signup.validation.lastNameTooShort",
          "Last Name must be at least {min} characters.",
          { min: LAST_NAME_MIN.toString() },
        ),
      )
      .max(
        LAST_NAME_MAX,
        t(
          "auth.signup.validation.lastNameTooLong",
          "Last Name must not exceed {max} characters.",
          { max: LAST_NAME_MAX.toString() },
        ),
      ),
    email: z
      .string()
      .min(1, t("auth.signup.validation.emailRequired", "Email is required."))
      .email(
        t("auth.signup.validation.emailInvalid", "Invalid email address."),
      ),
    password: z
      .string()
      .min(
        1,
        t("auth.signup.validation.passwordRequired", "Password is required."),
      )
      .min(
        PASSWORD_MIN,
        t(
          "auth.signup.validation.passwordMin",
          "Password must be at least {min} characters.",
          { min: PASSWORD_MIN.toString() },
        ),
      )
      .regex(
        /(?=.*[a-z])(?=.*[A-Z])/,
        t(
          "auth.signup.validation.passwordUpperLower",
          "Password must contain at least one uppercase and one lowercase letter.",
        ),
      )
      .regex(
        /[^A-Za-z0-9]/,
        t(
          "auth.signup.validation.passwordSpecialChar",
          "Password must contain at least one special character.",
        ),
      )
      .regex(
        /[0-9]/,
        t(
          "auth.signup.validation.passwordNumber",
          "Password must contain at least one number.",
        ),
      ),
    phone: z
      .string()
      .optional()
      .refine(
        (val) => !val || isValidPhoneNumber(val),
        t("auth.signup.validation.phoneInvalid", "Invalid phone number."),
      ),
    role_name: z.enum(["staff", "manager"]),
  });
};

// Update schema uses t for consistency and potential future validation messages
export const updateOrgUserSchema = (
  t: (
    key: string,
    fallback?: string,
    params?: Record<string, string | number>,
  ) => string,
) =>
  z.object({
    role_type: z.enum(["staff", "manager"], {
      message: t("users.validation.roleRequired", "Role is required"),
    }),
    active: z.boolean().optional(),
  });

export type CreateOrgUserFormData = z.infer<
  ReturnType<typeof createOrgUserSchema>
>;
export type UpdateOrgUserFormData = z.infer<
  ReturnType<typeof updateOrgUserSchema>
>;

export const stopSalesSchema = (
  t: (
    key: string,
    fallback?: string,
    params?: Record<string, string | number>,
  ) => string,
) =>
  z.object({
    reason: z
      .string()
      .max(
        STOP_SALES_REASON_MAX,
        t(
          "event.validation.stopSalesReasonMaxLength",
          "Reason cannot exceed {max} characters.",
          { max: STOP_SALES_REASON_MAX.toString() },
        ),
      )
      .optional(),
  });

export type StopSalesFormData = z.infer<ReturnType<typeof stopSalesSchema>>;

export const cancelEventSchema = (
  t: (
    key: string,
    fallback?: string,
    params?: Record<string, string | number>,
  ) => string,
) =>
  z.object({
    reason: z
      .string()
      .min(1, t("event.validation.cancelReasonRequired", "Reason is required."))
      .min(
        CANCEL_REASON_MIN,
        t(
          "event.validation.cancelReasonMinLength",
          "Reason must be at least {min} characters.",
          { min: CANCEL_REASON_MIN.toString() },
        ),
      )
      .max(
        CANCEL_REASON_MAX,
        t(
          "event.validation.cancelReasonMaxLength",
          "Reason cannot exceed {max} characters.",
          { max: CANCEL_REASON_MAX.toString() },
        ),
      ),
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
  t: (
    key: string,
    fallback?: string,
    params?: Record<string, string | number>,
  ) => string,
): ValidationHelpers => ({
  /**
   * Required field validation
   * Uses: common.validation.required
   */
  required: (field: string) => {
    const message = t("common.validation.required", "{field} is required.", {
      field,
    });
    return message;
  },

  /**
   * Invalid field validation
   * Uses: common.validation.invalid
   */
  invalid: (field: string) => {
    const message = t("common.validation.invalid", "{field} is invalid.", {
      field,
    });
    return message;
  },

  /**
   * Minimum length validation
   * Uses: common.validation.minLength
   */
  minLength: (field: string, length: number) => {
    const message = t(
      "common.validation.minLength",
      "{field} must be at least {length} characters long.",
      { field, length },
    );
    return message;
  },

  /**
   * Maximum length validation
   * Uses: common.validation.maxLength
   */
  maxLength: (field: string, length: number) => {
    const message = t(
      "common.validation.maxLength",
      "{field} cannot exceed {length} characters.",
      { field, length },
    );
    return message;
  },

  /**
   * Minimum value validation
   * Uses: common.validation.min
   */
  min: (field: string, value: number) => {
    const message = t(
      "common.validation.min",
      "{field} must be at least {value}.",
      { field, value },
    );
    return message;
  },

  /**
   * Maximum value validation
   * Uses: common.validation.max
   */
  max: (field: string, value: number) => {
    const message = t(
      "common.validation.max",
      "{field} cannot exceed {value}.",
      { field, value },
    );
    return message;
  },

  /**
   * Pattern validation
   * Uses: common.validation.pattern
   */
  pattern: (field: string) => {
    const message = t(
      "common.validation.pattern",
      "{field} format is invalid.",
      { field },
    );
    return message;
  },

  /**
   * Email specific validation
   */
  email: () => {
    return t(
      "auth.signup.validation.emailInvalid",
      "Please enter a valid email address",
    );
  },

  /**
   * Phone specific validation
   */
  phone: () => {
    return t(
      "auth.signup.validation.phoneInvalid",
      "Please enter a valid phone number",
    );
  },

  /**
   * Password match validation
   */
  passwordMatch: () => {
    return t(
      "auth.signup.validation.passwordMismatch",
      "Passwords do not match",
    );
  },

  /**
   * Password uppercase & lowercase validation
   */
  passwordUpperLower: () => {
    return t(
      "auth.signup.validation.passwordUpperLower",
      "Must contain at least one uppercase and one lowercase",
    );
  },

  /**
   * Password special character validation
   */
  passwordSpecialChar: () => {
    return t(
      "auth.signup.validation.passwordSpecialChar",
      "Must contain at least one special character",
    );
  },

  /**
   * Password number validation
   */
  passwordNumber: () => {
    return t(
      "auth.signup.validation.passwordNumber",
      "Must contain at least one numeric digit",
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

export const createOrganizerProfileSchema = (
  t: (
    key: string,
    fallback?: string,
    params?: Record<string, string | number>,
  ) => string,
) =>
  z.object({
    business_name: z
      .string()
      .min(
        1,
        t(
          "profile.validation.businessNameRequired",
          "Business name is required.",
        ),
      )
      .min(
        BUSINESS_NAME_MIN,
        t(
          "profile.validation.businessNameMinLength",
          "Business name must be at least {min} characters.",
          { min: BUSINESS_NAME_MIN.toString() },
        ),
      )
      .max(
        BUSINESS_NAME_MAX,
        t(
          "profile.validation.businessNameMaxLength",
          "Business name must be less than {max} characters.",
          { max: BUSINESS_NAME_MAX.toString() },
        ),
      ),
    business_description: z
      .string()
      .max(
        BUSINESS_DESC_MAX,
        t(
          "profile.validation.descriptionMaxLength",
          "Description must be less than {max} characters.",
          { max: BUSINESS_DESC_MAX.toString() },
        ),
      )
      .optional(),
  });

export type OrganizerProfileFormValues = z.infer<
  ReturnType<typeof createOrganizerProfileSchema>
>;

// const PayoutRequestFormSchema = z.object({
//   event_id: z.string().min(1, "payouts.validation.selectEvent"),
//   amount: z
//     .number()
//     .min(0.01, "payouts.validation.amountMustBeGreaterThanZero"),
//   description: z.string().optional(),
// });

export const createPayoutRequestSchema = (
  t: (
    key: string,
    fallback?: string,
    params?: Record<string, string | number>,
  ) => string,
) =>
  z.object({
    event_id: z.string().min(1, "payouts.validation.selectEvent"),
    amount: createRequiredNumberSchema(
      t,
      "payouts.table.amount:Amount",
      1,
    ),
    description: z.string().optional(),
  });

export type PayoutRequestFormData = z.infer<ReturnType<typeof createPayoutRequestSchema>>;