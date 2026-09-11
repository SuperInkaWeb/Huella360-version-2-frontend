import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { User, LayoutDashboard, ChevronDown } from "lucide-react";
import { useAuth } from "../features/auth/context/useAuth";
import { getRedirectByRole } from "../features/auth/services/authRedirect";
import { LogoutButton } from "./LogoutButton";

export const UserDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { role } = useAuth();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const dashboardPath = role ? getRedirectByRole(role) : "/";

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1 rounded-full hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200"
      >
        <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          <User size={20} />
        </div>
        <ChevronDown
          size={14}
          className={`text-slate-500 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-lg shadow-xl py-2 z-100 animate-in fade-in zoom-in duration-150">
          <div className="px-4 py-2 border-b border-slate-100 mb-1">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Mi Cuenta
            </p>
            <p className="text-sm font-medium truncate capitalize">
              {role?.toLowerCase() || "Usuario"}
            </p>
          </div>

          <Link
            to={dashboardPath}
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <LayoutDashboard size={16} />
            Panel de Control
          </Link>
          <div className="border-t border-slate-100 mt-1 pt-1">
            <LogoutButton
              showConfirmation={true}
              variant="ghost"
              className="w-full flex items-center justify-start gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50 hover:text-red-600 border-none h-auto font-normal"
            />
          </div>
        </div>
      )}
    </div>
  );
};
