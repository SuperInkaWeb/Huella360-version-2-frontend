import React, { type ReactNode } from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  children: ReactNode;
  className?: string;
}

export const Button = ({ variant = "primary", children, className = "", ...props }: ButtonProps) => {
  const baseClasses = "flex cursor-pointer items-center justify-center overflow-hidden rounded-lg font-bold transition-all";

  const variants = {
    primary: "bg-primary text-white shadow-lg shadow-blue-500/20 hover:bg-blue-700",
    secondary: "bg-[#e7ecf3] text-[#0d131b] hover:bg-slate-200",
    outline: "bg-white border border-[#cfd9e7] text-[#0d131b] hover:bg-slate-50",
    ghost: "text-primary hover:underline gap-2",
    danger: "bg-red-500 text-white shadow-lg shadow-red-500/20 hover:bg-red-600"
  };

  return (
    <button className={`${baseClasses} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};