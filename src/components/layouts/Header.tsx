import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../features/auth/context/useAuth";
import { UserDropdown } from "../UserDropdown";
import { useClientPointsDashboard } from "../../features/dashboard/gamification/hooks/useGamification";
import { Gift, Menu, X } from "lucide-react";

export const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, role } = useAuth();
  const isCliente = role === "CLIENTE";
  const { data: pointsData } = useClientPointsDashboard(isAuthenticated && isCliente);

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const navItems = [
    { name: "Inicio", path: "/" },
    { name: "Marketplace", path: "/marketplace" },
    { name: "Para Dueños", path: "/#duenos" },
    { name: "Veterinarios", path: "/#veterinarios" },
    { name: "Negocios", path: "/#negocios" },
    { name: "Precios", path: "/#pricing" },
  ];

  const handleNavClick = (path: string) => {
    if (path.startsWith("/#")) {
      const sectionId = path.replace("/#","");
      if (location.pathname !== "/") {
        navigate("/");
        setTimeout(() => {
          document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      } else {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <nav
      className={`fixed top-0 w-full z-[100] transition-all duration-300 glass-nav ${
        scrolled
          ? "shadow-md border-transparent"
          : "border-b border-border/50"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <img
            src="/LOGO HUELLA60-logo secundario.png"
            alt="Logo Huella360"
            className="h-10 w-auto object-contain"
          />
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              onClick={() => handleNavClick(item.path)}
              className={`nav-link font-medium transition-colors ${
                location.pathname === item.path
                  ? "active font-semibold text-text-primary"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              {item.name}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-4">
          {!isAuthenticated ? (
            <>
              <Link
                to="/login"
                className="font-medium text-text-primary hover:text-primary transition-colors"
              >
                Iniciar sesión
              </Link>
              <Link
                to="/register"
                className="bg-primary text-white px-6 py-2.5 rounded-full font-semibold hover:bg-primary-dark hover:shadow-md transition-all duration-300"
              >
                Prueba Gratis
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-4">
              {isCliente && pointsData && (
                <Link
                  to="/portal/cliente/puntos"
                  className="flex items-center gap-2 px-3 py-1.5 bg-yellow-50 border border-yellow-200 rounded-full hover:bg-yellow-100 transition-colors group"
                  title="Tus puntos Huella360"
                >
                  <Gift className="w-4 h-4 text-yellow-600 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-bold text-yellow-700">
                    {pointsData.totalPuntos} pts
                  </span>
                </Link>
              )}
              <UserDropdown />
            </div>
          )}
        </div>

        <button
          className="md:hidden text-text-primary"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
        >
          {mobileOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden glass-nav border-t border-border/50 px-6 py-6 space-y-4">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              onClick={() => handleNavClick(item.path)}
              className="block font-medium text-text-secondary hover:text-text-primary transition-colors"
            >
              {item.name}
            </Link>
          ))}
          <hr className="border-border" />
          {!isAuthenticated ? (
            <div className="flex flex-col gap-3">
              <Link to="/login" className="font-medium text-text-primary hover:text-primary transition-colors">
                Iniciar sesión
              </Link>
              <Link
                to="/register"
                className="bg-primary text-white px-6 py-2.5 rounded-full font-semibold text-center hover:bg-primary-dark transition-all"
              >
                Prueba Gratis
              </Link>
            </div>
          ) : (
            <UserDropdown />
          )}
        </div>
      )}
    </nav>
  );
};
