"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import {
  EnvelopeIcon,
  KeyIcon,
  ShieldCheckIcon,
  UserIcon,
  ArrowsClockwiseIcon,
} from "@phosphor-icons/react/dist/ssr";
import type { Country } from "react-phone-number-input";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { PhoneInput } from "@/components/ui/phone-input";
import { cn } from "@/lib/utils";

import { organizerUserService } from "@/services/organizerUserService";
import {
  createOrgUserSchema,
  updateOrgUserSchema,
  CreateOrgUserFormData,
  UpdateOrgUserFormData
} from "@/lib/validation";
import { OrgUser } from "@/types/organizerUser";
import { useTranslation } from "@/hooks/useTranslation";
import { toast } from "sonner";
import { queryKeys } from "@/lib/queryKeys";

interface UserFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orgId: string;
  userToEdit?: OrgUser | null;
}

/**
 * Generate a random password that meets all requirements:
 * - At least 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one special character
 * - At least one number
 */
function generateStrongPassword(): string {
  const uppercase = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lowercase = "abcdefghjkmnpqrstuvwxyz";
  const numbers = "23456789";
  const special = "!@#$%&*?";

  // Ensure at least one of each required character type
  const password = [
    uppercase[Math.floor(Math.random() * uppercase.length)],
    lowercase[Math.floor(Math.random() * lowercase.length)],
    numbers[Math.floor(Math.random() * numbers.length)],
    special[Math.floor(Math.random() * special.length)],
  ];

  // Fill rest with random mix (to reach 12 characters for better security)
  const allChars = uppercase + lowercase + numbers + special;
  for (let i = password.length; i < 12; i++) {
    password.push(allChars[Math.floor(Math.random() * allChars.length)]);
  }

  // Shuffle the password
  for (let i = password.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [password[i], password[j]] = [password[j], password[i]];
  }

  return password.join("");
}

export default function UserFormDialog({
  open,
  onOpenChange,
  orgId,
  userToEdit,
}: UserFormDialogProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const isEditing = !!userToEdit;
  const [defaultCountry, setDefaultCountry] = useState<Country>("NP");

  // Dynamically choose schema based on mode
  const schema = isEditing ? updateOrgUserSchema(t) : createOrgUserSchema(t);
  type FormData = CreateOrgUserFormData | UpdateOrgUserFormData;

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: isEditing
      ? {
        role_type: "staff",
        active: true,
      }
      : {
        first_name: "",
        last_name: "",
        email: "",
        password: "",
        phone: "",
        role_name: "staff",
      },
  });

  // Detect country from IP
  useEffect(() => {
    const detectCountry = async () => {
      try {
        const cached = sessionStorage.getItem("user_country_code");
        if (cached) {
          setDefaultCountry(cached as Country);
          return;
        }

        const response = await fetch("https://ipapi.co/json/");
        if (response.ok) {
          const data = await response.json();
          if (data.country_code) {
            setDefaultCountry(data.country_code as Country);
            sessionStorage.setItem("user_country_code", data.country_code);
          }
        }
      } catch (error) {
        console.log("Could not detect country, using default (NP)", error);
      }
    };

    if (open && !isEditing) {
      detectCountry();
    }
  }, [open, isEditing]);

  // Reset form when dialog opens or userToEdit changes
  useEffect(() => {
    if (open) {
      if (userToEdit) {
        const currentRole = userToEdit.roles?.find(r => r.name === 'manager') ? 'manager' : 'staff';
        form.reset({
          role_type: currentRole,
          active: userToEdit.account_status === 'active',
        } as UpdateOrgUserFormData);
      } else {
        form.reset({
          first_name: "",
          last_name: "",
          email: "",
          password: "",
          phone: "",
          role_name: "staff",
        } as CreateOrgUserFormData);
      }
    }
  }, [open, userToEdit, form]);

  const handleGeneratePassword = () => {
    const newPassword = generateStrongPassword();
    form.setValue("password", newPassword, { shouldValidate: true });
    // Copy to clipboard
    navigator.clipboard.writeText(newPassword).then(() => {
      toast.success("Password generated and copied to clipboard!");
    }).catch(() => {
      toast.success("Password generated!");
    });
  };

  const createMutation = useMutation({
    mutationFn: (data: CreateOrgUserFormData) =>
      organizerUserService.createUser(orgId, {
        email: data.email,
        first_name: data.first_name,
        last_name: data.last_name,
        password: data.password,
        phone: data.phone || undefined,
        role_name: data.role_name,
      }),
    onSuccess: () => {
      toast.success(t('users.create.success', "User created successfully"));
      queryClient.invalidateQueries({ queryKey: queryKeys.orgUsers.all(orgId) });
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast.error(error.message || t('users.create.error', "Failed to create user"));
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: UpdateOrgUserFormData) =>
      organizerUserService.updateUser(orgId, userToEdit!.id, {
        role_type: data.role_type,
        active: data.active
      }),
    onSuccess: () => {
      toast.success(t('users.update.success', "User updated successfully"));
      queryClient.invalidateQueries({ queryKey: queryKeys.orgUsers.all(orgId) });
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast.error(error.message || t('users.update.error', "Failed to update user"));
    },
  });

  const onSubmit = (data: FormData) => {
    if (isEditing) {
      updateMutation.mutate(data as UpdateOrgUserFormData);
    } else {
      createMutation.mutate(data as CreateOrgUserFormData);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing
              ? t('users.edit.title', "Edit Team Member")
              : t('users.create.title', "Add Team Member")}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? t('users.edit.description', "Update team member's role and access status.")
              : t('users.create.description', "Add a new staff or manager to your organization.")}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Create Mode - Full form */}
            {!isEditing && (
              <>
                {/* Name Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="first_name"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-900">
                          {t('common.firstName', "First Name")}
                        </FormLabel>
                        <div className="relative">
                          <div
                            className="absolute left-4 top-1/2 -translate-y-1/2"
                            aria-hidden="true"
                          >
                            <UserIcon weight="duotone" size={24} className="text-gray-600" />
                          </div>
                          <FormControl>
                            <Input
                              placeholder="Jane"
                              {...field}
                              className={cn(
                                "h-12 pl-14 pr-4",
                                fieldState.error && "border-destructive"
                              )}
                            />
                          </FormControl>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="last_name"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-900">
                          {t('common.lastName', "Last Name")}
                        </FormLabel>
                        <div className="relative">
                          <div
                            className="absolute left-4 top-1/2 -translate-y-1/2"
                            aria-hidden="true"
                          >
                            <UserIcon weight="duotone" size={24} className="text-gray-600" />
                          </div>
                          <FormControl>
                            <Input
                              placeholder="Smith"
                              {...field}
                              className={cn(
                                "h-12 pl-14 pr-4",
                                fieldState.error && "border-destructive"
                              )}
                            />
                          </FormControl>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Email Field */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-900">
                        {t('common.email', "Email")}
                      </FormLabel>
                      <div className="relative">
                        <div
                          className="absolute left-4 top-1/2 -translate-y-1/2"
                          aria-hidden="true"
                        >
                          <EnvelopeIcon weight="duotone" size={24} className="text-gray-600" />
                        </div>
                        <FormControl>
                          <Input
                            placeholder="jane.smith@example.com"
                            type="email"
                            {...field}
                            className={cn(
                              "h-12 pl-14 pr-4",
                              fieldState.error && "border-destructive"
                            )}
                          />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Password Field with Generate Button */}
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-900">
                        {t('common.password', "Password")}
                      </FormLabel>
                      <div className="relative">
                        <div
                          className="absolute left-4 top-1/2 -translate-y-1/2"
                          aria-hidden="true"
                        >
                          <KeyIcon weight="duotone" size={24} className="text-gray-600" />
                        </div>
                        <FormControl>
                          <Input
                            type="text"
                            placeholder="••••••••"
                            {...field}
                            className={cn(
                              "h-12 pl-14 pr-14",
                              fieldState.error && "border-destructive"
                            )}
                          />
                        </FormControl>
                        <button
                          type="button"
                          onClick={handleGeneratePassword}
                          title="Generate secure password"
                          className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-10 h-10 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <ArrowsClockwiseIcon weight="duotone" size={24} className="text-gray-600" />
                        </button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {t('users.create.passwordHint', "Click the icon to generate a secure password")}
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Phone Field - Same as registration form */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-900">
                    {t('common.phone', "Contact Number")}
                    <span className="text-muted-foreground text-xs font-normal ml-1">(optional)</span>
                  </label>
                  <Controller
                    name="phone"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <>
                        <PhoneInput
                          value={field.value || ""}
                          onChange={field.onChange}
                          defaultCountry={defaultCountry}
                          placeholder={t('auth.signup.phonePlaceholder', "981-234-5678")}
                          className={cn(
                            fieldState.error && "border-destructive"
                          )}
                        />
                        {fieldState.error && (
                          <p className="text-sm text-destructive">{fieldState.error.message}</p>
                        )}
                      </>
                    )}
                  />
                </div>

                <Separator />

                {/* Role Field */}
                <FormField
                  control={form.control}
                  name="role_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-900">
                        {t('common.role', "Role")}
                      </FormLabel>
                      <div className="relative">
                        <div
                          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 pointer-events-none"
                          aria-hidden="true"
                        >
                          <ShieldCheckIcon weight="duotone" size={24} className="text-gray-600" />
                        </div>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="h-12 pl-14">
                              <SelectValue placeholder="Select a role" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="staff">
                              <div className="flex flex-col">
                                <span className="font-medium">Staff</span>
                                <span className="text-xs text-muted-foreground">Can check-in tickets and view events</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="manager">
                              <div className="flex flex-col">
                                <span className="font-medium">Manager</span>
                                <span className="text-xs text-muted-foreground">Full access to manage events and team</span>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            {/* Edit Mode - Role and Status only */}
            {isEditing && userToEdit && (
              <>
                {/* User Info Display */}
                <div className="rounded-lg border bg-muted/30 p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-lg font-semibold text-primary">
                        {userToEdit.first_name?.[0]?.toUpperCase()}{userToEdit.last_name?.[0]?.toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{userToEdit.first_name} {userToEdit.last_name}</p>
                      <p className="text-sm text-muted-foreground">{userToEdit.email}</p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Role Field */}
                <FormField
                  control={form.control}
                  name="role_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-900">
                        {t('common.role', "Role")}
                      </FormLabel>
                      <div className="relative">
                        <div
                          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 pointer-events-none"
                          aria-hidden="true"
                        >
                          <ShieldCheckIcon weight="duotone" size={24} className="text-gray-600" />
                        </div>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="h-12 pl-14">
                              <SelectValue placeholder="Select a role" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="staff">
                              <div className="flex flex-col">
                                <span className="font-medium">Staff</span>
                                <span className="text-xs text-muted-foreground">Can check-in tickets and view events</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="manager">
                              <div className="flex flex-col">
                                <span className="font-medium">Manager</span>
                                <span className="text-xs text-muted-foreground">Full access to manage events and team</span>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Active Status Toggle */}
                <FormField
                  control={form.control}
                  name="active"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base font-medium text-gray-900">
                          {t('common.active', "Active Account")}
                        </FormLabel>
                        <p className="text-sm text-muted-foreground">
                          {t('users.edit.activeDescription', "When disabled, user cannot access the system.")}
                        </p>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </>
            )}

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                variant="outline"
                type="button"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                {t('common.cancel', "Cancel")}
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing
                  ? t('common.saveChanges', "Save Changes")
                  : t('users.create.submit', "Add Team Member")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
