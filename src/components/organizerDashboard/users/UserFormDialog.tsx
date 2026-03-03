"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import {
  EnvelopeIcon,
  KeyIcon,
  ShieldCheckIcon,
  UserIcon,
  ArrowsClockwiseIcon,
} from "@phosphor-icons/react";
import type { Country } from "react-phone-number-input";

import { PasswordRequirements } from "@/components/auth/PasswordRequirements";

import { DialogFooter } from "@/components/ui/dialog";
import { Modal } from "@/components/ui/modal";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  TranslatedFormMessage,
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
  UpdateOrgUserFormData,
} from "@/lib/validation";
import { OrgUser } from "@/types/organizerUser";
import { useTranslation } from "@/hooks/useTranslation";
import { toast } from "sonner";
import { queryKeys } from "@/lib/queryKeys";

interface UserFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userToEdit?: OrgUser | null;
}

function generateStrongPassword(): string {
  const uppercase = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lowercase = "abcdefghjkmnpqrstuvwxyz";
  const numbers = "0123456789";
  const special = "!@#$%&*?";

  const password = [
    uppercase[Math.floor(Math.random() * uppercase.length)],
    lowercase[Math.floor(Math.random() * lowercase.length)],
    numbers[Math.floor(Math.random() * numbers.length)],
    special[Math.floor(Math.random() * special.length)],
  ];

  const allChars = uppercase + lowercase + numbers + special;
  for (let i = password.length; i < 12; i++) {
    password.push(allChars[Math.floor(Math.random() * allChars.length)]);
  }

  for (let i = password.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [password[i], password[j]] = [password[j], password[i]];
  }

  return password.join("");
}

export default function UserFormDialog({
  open,
  onOpenChange,
  userToEdit,
}: UserFormDialogProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const isEditing = !!userToEdit;
  const [defaultCountry, setDefaultCountry] = useState<Country>("NP");

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
    mode: "onChange",
  });

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

  useEffect(() => {
    if (open) {
      if (userToEdit) {
        const currentRole = userToEdit.roles?.find((r) => r.name === "manager")
          ? "manager"
          : "staff";
        form.reset({
          role_type: currentRole,
          active: userToEdit.account_status === "active",
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
    navigator.clipboard
      .writeText(newPassword)
      .then(() => {
        toast.success(
          t(
            "users.generatePassword.successCopy",
            "Password generated and copied to clipboard!",
          ),
        );
      })
      .catch(() => {
        toast.success(
          t(
            "users.generatePassword.success",
            "Password generated successfully",
          ),
        );
      });
  };

  const createMutation = useMutation({
    mutationFn: (data: CreateOrgUserFormData) =>
      organizerUserService.createUser({
        email: data.email,
        first_name: data.first_name,
        last_name: data.last_name,
        password: data.password,
        phone: data.phone || undefined,
        role_name: data.role_name,
      }),
    onSuccess: () => {
      toast.success(t("users.create.success", "User created successfully"));
      queryClient.invalidateQueries({ queryKey: queryKeys.orgUsers.all });
      onOpenChange(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: UpdateOrgUserFormData) =>
      organizerUserService.updateUser(userToEdit!.id, {
        role_type: data.role_type,
        active: data.active,
      }),
    onSuccess: () => {
      toast.success(t("users.update.success", "User updated successfully"));
      queryClient.invalidateQueries({ queryKey: queryKeys.orgUsers.all });
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast.error(
        error.message || t("users.update.error", "Failed to update user"),
      );
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
    <Modal
      isOpen={open}
      onClose={onOpenChange}
      title={
        isEditing
          ? t("users.edit.title", "Edit Team Member")
          : t("users.create.title", "Add Team Member")
      }
      description={
        isEditing
          ? t(
              "users.edit.description",
              "Update team member's role and access status.",
            )
          : t(
              "users.create.description",
              "Add a new staff or manager to your organization.",
            )
      }
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden h-full">
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {!isEditing && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="first_name"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <FormLabel required className="text-sm font-medium">
                          {t("auth.signup.firstName", "First Name")}
                        </FormLabel>
                        <div className="relative">
                          <div
                            className="absolute left-4 top-1/2 -translate-y-1/2"
                            aria-hidden="true"
                          >
                            <UserIcon
                              weight="duotone"
                              size={24}
                              className="text-gray-600"
                            />
                          </div>
                          <FormControl>
                            <Input
                              placeholder={t(
                                "auth.signup.firstNamePlaceholder",
                                "Enter first name",
                              )}
                              {...field}
                              className={cn(
                                "h-12 pl-14 pr-4",
                                fieldState.error && "border-destructive",
                              )}
                            />
                          </FormControl>
                        </div>
                        <TranslatedFormMessage t={t} />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="last_name"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <FormLabel required className="text-sm font-medium">
                          {t("auth.signup.lastName", "Last Name")}
                        </FormLabel>
                        <div className="relative">
                          <div
                            className="absolute left-4 top-1/2 -translate-y-1/2"
                            aria-hidden="true"
                          >
                            <UserIcon
                              weight="duotone"
                              size={24}
                              className="text-gray-600"
                            />
                          </div>
                          <FormControl>
                            <Input
                              placeholder={t(
                                "auth.signup.lastNamePlaceholder",
                                "Enter last name",
                              )}
                              {...field}
                              className={cn(
                                "h-12 pl-14 pr-4",
                                fieldState.error && "border-destructive",
                              )}
                            />
                          </FormControl>
                        </div>
                        <TranslatedFormMessage t={t} />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel required className="text-sm font-medium">
                        {t("auth.signup.email", "Email")}
                      </FormLabel>
                      <div className="relative">
                        <div
                          className="absolute left-4 top-1/2 -translate-y-1/2"
                          aria-hidden="true"
                        >
                          <EnvelopeIcon
                            weight="duotone"
                            size={24}
                            className="text-gray-600"
                          />
                        </div>
                        <FormControl>
                          <Input
                            placeholder={t(
                              "auth.signup.emailPlaceholder",
                              "Enter email address",
                            )}
                            type="email"
                            {...field}
                            className={cn(
                              "h-12 pl-14 pr-4",
                              fieldState.error && "border-destructive",
                            )}
                          />
                        </FormControl>
                      </div>
                      <TranslatedFormMessage t={t} />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel required className="text-sm font-medium">
                        {t("auth.signup.password", "Password")}
                      </FormLabel>
                      <div className="relative">
                        <div
                          className="absolute left-4 top-1/2 -translate-y-1/2"
                          aria-hidden="true"
                        >
                          <KeyIcon
                            weight="duotone"
                            size={24}
                            className="text-gray-600"
                          />
                        </div>
                        <FormControl>
                          <Input
                            type="text"
                            placeholder="••••••••"
                            {...field}
                            className={cn(
                              "h-12 pl-14 pr-14",
                              fieldState.error && "border-destructive",
                            )}
                          />
                        </FormControl>
                        <button
                          type="button"
                          onClick={handleGeneratePassword}
                          title="Generate secure password"
                          className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-10 h-10 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <ArrowsClockwiseIcon
                            weight="duotone"
                            size={24}
                            className="text-gray-600"
                          />
                        </button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {t(
                          "users.create.passwordHint",
                          "Click the icon to generate a secure password",
                        )}
                      </p>
                      <PasswordRequirements password={field.value} />
                      <TranslatedFormMessage t={t} />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">
                        {t("auth.signup.phone", "Contact Number")}
                      </FormLabel>
                      <FormControl>
                        <PhoneInput
                          value={field.value || ""}
                          onChange={field.onChange}
                          defaultCountry={defaultCountry}
                          placeholder={t(
                            "auth.signup.phonePlaceholder",
                            "981-234-5678",
                          )}
                          className={cn(
                            fieldState.error && "border-destructive",
                          )}
                        />
                      </FormControl>
                      <TranslatedFormMessage t={t} />
                    </FormItem>
                  )}
                />

                <Separator />

                <FormField
                  control={form.control}
                  name="role_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-900">
                        {t("common.role", "Role")}
                      </FormLabel>
                      <div className="relative">
                        <div
                          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 pointer-events-none"
                          aria-hidden="true"
                        >
                          <ShieldCheckIcon
                            weight="duotone"
                            size={24}
                            className="text-gray-600"
                          />
                        </div>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="h-12 pl-14">
                              <SelectValue
                                placeholder={t(
                                  "common.placeholder.selectRole",
                                  "Select a role",
                                )}
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="staff">
                              <div className="flex flex-col items-start">
                                <span className="font-medium">
                                  {t("common.staff", "Staff")}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {t(
                                    "common.staffDescription",
                                    "Can check-in tickets and view events",
                                  )}
                                </span>
                              </div>
                            </SelectItem>
                            <SelectItem value="manager">
                              <div className="flex flex-col items-start">
                                <span className="font-medium">
                                  {t("common.manager", "Manager")}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {t(
                                    "common.managerDescription",
                                    "Full access to manage events and team",
                                  )}
                                </span>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <TranslatedFormMessage t={t} />
                    </FormItem>
                  )}
                />
              </>
            )}

            {isEditing && userToEdit && (
              <>
                <div className="rounded-lg border bg-muted/30 p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-lg font-semibold text-primary">
                        {userToEdit.first_name?.[0]?.toUpperCase()}
                        {userToEdit.last_name?.[0]?.toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">
                        {userToEdit.first_name} {userToEdit.last_name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {userToEdit.email}
                      </p>
                    </div>
                  </div>
                </div>

                <Separator />

                <FormField
                  control={form.control}
                  name="role_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-900">
                        {t("common.role", "Role")}
                      </FormLabel>
                      <div className="relative">
                        <div
                          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 pointer-events-none"
                          aria-hidden="true"
                        >
                          <ShieldCheckIcon
                            weight="duotone"
                            size={24}
                            className="text-gray-600"
                          />
                        </div>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="h-12 pl-14">
                              <SelectValue
                                placeholder={t(
                                  "common.placeholder.selectRole",
                                  "Select a role",
                                )}
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="staff">
                              <div className="flex flex-col items-start">
                                <span className="font-medium">
                                  {t("common.staff", "Staff")}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {t(
                                    "common.staffDescription",
                                    "Can check-in tickets and view events",
                                  )}
                                </span>
                              </div>
                            </SelectItem>
                            <SelectItem value="manager">
                              <div className="flex flex-col items-start">
                                <span className="font-medium">
                                  {t("common.manager", "Manager")}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {t(
                                    "common.managerDescription",
                                    "Full access to manage events and team",
                                  )}
                                </span>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <TranslatedFormMessage t={t} />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="active"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base font-medium text-gray-900">
                          {t("users.activeAccount", "Active Account")}
                        </FormLabel>
                        <p className="text-sm text-muted-foreground">
                          {t(
                            "users.activeAccountDescription",
                            "When disabled, user cannot access the system.",
                          )}
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
            )}
          </div>

          <DialogFooter className="px-6 py-4 border-t bg-background shrink-0 gap-2 sm:justify-end">
            <Button
                variant="outline"
                type="button"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                {t("common.cancel", "Cancel")}
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing
                  ? t("common.saveChanges", "Save Changes")
                  : t("users.create.label", "Add Team Member")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
    </Modal>
  );
}
