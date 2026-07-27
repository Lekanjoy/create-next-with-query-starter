"use client";
import * as React from "react";
import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react";

interface FieldProps {
  name: string;
  value: string | boolean | number | undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onChange: (...event: any[]) => void;
  onBlur: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ref: React.Ref<any>;
}

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  field?: FieldProps;
  containerClassName?: string;
  labelClassName?: string;
  icon?: React.ReactElement;
  iconPosition?: "left" | "right";
}

export function TextInput({
  label,
  field,
  className,
  type = "text",
  icon,
  iconPosition = "right",
  containerClassName,
  labelClassName,
  ...props
}: TextInputProps) {
  const isCheckbox = type === "checkbox";
  const isPassword = type === "password";
  const [showPassword, setShowPassword] = React.useState(false);
  const inputType = isPassword && showPassword ? "text" : type;
  const hasIcon = !!icon || isPassword;

  return (
    <FormItem className={cn(containerClassName)}>
      {label && (
        <FormLabel className={cn(labelClassName)}>{label}</FormLabel>
      )}
      <FormControl>
        <div className="relative">
          <Input
            type={inputType}
            {...props}
            {...field}
            checked={isCheckbox ? Boolean(field?.value) : undefined}
            value={isCheckbox ? undefined : ((field?.value as string) ?? "")}
            onChange={(e) =>
              isCheckbox
                ? field?.onChange(e.target.checked)
                : field?.onChange(e.target.value)
            }
            className={cn(
              className,
              isCheckbox && "size-4",
              hasIcon && iconPosition === "left" && "pl-9",
              hasIcon && iconPosition === "right" && "pr-9",
            )}
          />
          {icon && !isPassword && (
            <span
              className={cn(
                "absolute inset-y-0 flex items-center text-muted-foreground",
                iconPosition === "left" ? "left-3" : "right-3",
              )}
            >
              {icon}
            </span>
          )}
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 inset-y-0 flex items-center text-muted-foreground hover:text-foreground"
              title={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          )}
        </div>
      </FormControl>
      {!isCheckbox && <FormMessage />}
    </FormItem>
  );
}
