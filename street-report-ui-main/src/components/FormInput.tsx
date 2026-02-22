import React from "react";

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(
  ({ label, id, ...props }, ref) => (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm text-label font-normal">
        {label}
      </label>
      <input
        ref={ref}
        id={id}
        className="h-[44px] w-full rounded-lg border border-input bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 transition"
        {...props}
      />
    </div>
  )
);

FormInput.displayName = "FormInput";
export default FormInput;
