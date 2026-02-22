import React from "react";
import { ChevronDown } from "lucide-react";

interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

const FormSelect = React.forwardRef<HTMLSelectElement, FormSelectProps>(
  ({ label, id, options, placeholder, ...props }, ref) => (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm text-label font-normal">
        {label}
      </label>
      <div className="relative">
        <select
          ref={ref}
          id={id}
          defaultValue=""
          className="h-[44px] w-full appearance-none rounded-lg border border-input bg-card px-3 pr-9 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 transition"
          {...props}
        >
          {placeholder && (
            <option value="" disabled className="text-muted-foreground">
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
      </div>
    </div>
  )
);

FormSelect.displayName = "FormSelect";
export default FormSelect;
