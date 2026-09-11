import { forwardRef } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, helperText, className = "", id, ...props }, ref) => {
        const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

        const baseInputClasses = "w-full px-4 py-2.5 rounded-xl border transition-all outline-none text-sm";
        const lightClasses = "bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 focus:border-primary";
        const errorClasses = error ? "border-red-500 focus:ring-red-500/20 focus:border-red-500" : "";

        return (
            <div className={`space-y-1.5 ${className}`}>
                {label && (
                    <label
                        htmlFor={inputId}
                        className="text-sm font-semibold text-slate-700"
                    >
                        {label} {props.required && <span className="text-red-500">*</span>}
                    </label>
                )}
                <div className="relative">
                    <input
                        id={inputId}
                        ref={ref}
                        className={`${baseInputClasses} ${lightClasses} ${errorClasses}`}
                        {...props}
                    />
                </div>
                {error ? (
                    <p className="text-xs font-medium text-red-500 animate-in fade-in slide-in-from-top-1 duration-200">
                        {error}
                    </p>
                ) : helperText ? (
                    <p className="text-xs text-slate-500">
                        {helperText}
                    </p>
                ) : null}
            </div>
        );
    }
);

Input.displayName = "Input";
