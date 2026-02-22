import React from "react";

interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
}

const FormTextarea = React.forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  ({ label, id, ...props }, ref) => (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm text-label font-normal">
        {label}
      </label>
      <textarea
        ref={ref}
        id={id}
        className="w-full min-h-[100px] rounded-lg border border-input bg-card px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 transition resize-vertical"
        {...props}
      />
    </div>
  )
);

FormTextarea.displayName = "FormTextarea";
export default FormTextarea;
