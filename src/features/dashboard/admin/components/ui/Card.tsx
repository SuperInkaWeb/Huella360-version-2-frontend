import type { ReactNode } from "react";

interface CardProps {
 children: ReactNode;
 className?: string;
}

export const Card = ({ children, className = "" }: CardProps) => {
 return (
 <div
 className={`bg-white shadow rounded-xl overflow-hidden border border-transparent ${className}`}
 >
 {children}
 </div>
 );
};
