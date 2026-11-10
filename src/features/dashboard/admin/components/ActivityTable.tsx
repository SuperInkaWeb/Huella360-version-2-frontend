import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { adminService } from "../services/adminService";
import type { AdminUser, AdminVeterinario, Company } from "../types/admin.types";

// Actividad reciente con datos reales: últimos registros de clientes, empresas y veterinarios.
// Antes mostraba 3 filas fijas de ejemplo ("Clínica San José — Suscripción Premium") que
// parecían ventas reales. Las suscripciones no se listan porque no hay endpoint de admin para ellas.

const MAX_ITEMS = 6;
const LIMITE_POR_FUENTE = 6;

type Tono = "ok" | "pendiente" | "error";

interface Actividad {
  key: string;
  name: string;
  role: string;
  action: string;
  status: string;
  tono: Tono;
  createdAt: string;
}

const ESTADO_VALIDACION: Record<Company["estadoValidacion"], { status: string; tono: Tono }> = {
  VERIFICADO: { status: "Verificado", tono: "ok" },
  PENDIENTE: { status: "Pendiente", tono: "pendiente" },
  RECHAZADO: { status: "Rechazado", tono: "error" },
};

const ROL_LABEL: Record<string, string> = {
  CLIENTE: "Cliente",
  REPARTIDOR: "Repartidor",
};

const TONO_CLASES: Record<Tono, string> = {
  ok: "bg-[#1ea59c]/10 text-[#1ea59c] border border-[#1ea59c]/20",
  pendiente: "bg-amber-100/50 text-amber-600 border border-amber-200/50",
  error: "bg-red-50 text-red-500 border border-red-200/50",
};

const TONO_ICONO: Record<Tono, string> = {
  ok: "bg-[#1ea59c]/10 text-[#1ea59c]",
  pendiente: "bg-[#2D3E82]/10 text-[#2D3E82]",
  error: "bg-red-50 text-red-500",
};

// Empresas y veterinarios ya aparecen con su propia fila; de usuarios solo se toman los demás roles.
const desdeUsuario = (u: AdminUser): Actividad | null => {
  const role = ROL_LABEL[u.rol];
  if (!role) return null;
  return {
    key: `u-${u.id}`,
    name: u.nombre || u.correo,
    role,
    action: "Registro nuevo",
    status: u.estado ? "Activo" : "Inactivo",
    tono: u.estado ? "ok" : "error",
    createdAt: u.createdAt,
  };
};

const desdeEmpresa = (c: Company): Actividad => ({
  key: `c-${c.id}`,
  name: c.nombreComercial,
  role: "Empresa",
  action: "Registro de empresa",
  ...ESTADO_VALIDACION[c.estadoValidacion],
  createdAt: c.createdAt,
});

const desdeVeterinario = (v: AdminVeterinario): Actividad => ({
  key: `v-${v.id}`,
  name: `${v.nombres ?? ""} ${v.apellidos ?? ""}`.trim() || v.correo,
  role: "Veterinario",
  action: "Registro de veterinario",
  ...ESTADO_VALIDACION[v.estadoValidacion],
  createdAt: v.createdAt,
});

const formatoFecha = new Intl.DateTimeFormat("es-PE", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const formatearFecha = (iso: string): string => {
  const fecha = new Date(iso);
  return Number.isNaN(fecha.getTime()) ? "—" : formatoFecha.format(fecha);
};

export const ActivityTable = () => {
  const pagina = { page: 0, size: LIMITE_POR_FUENTE };
  const usuarios = useQuery({
    queryKey: ["admin-actividad", "usuarios"],
    queryFn: () => adminService.getUsers(pagina),
  });
  const empresas = useQuery({
    queryKey: ["admin-actividad", "empresas"],
    queryFn: () => adminService.getCompanies(pagina),
  });
  const veterinarios = useQuery({
    queryKey: ["admin-actividad", "veterinarios"],
    queryFn: () => adminService.getVeterinarios(pagina),
  });

  const fuentes = [usuarios, empresas, veterinarios];
  const cargando = fuentes.some((f) => f.isLoading);
  const todasFallaron = fuentes.every((f) => f.isError);

  const actividades: Actividad[] = [
    ...(usuarios.data?.content ?? []).map(desdeUsuario),
    ...(empresas.data?.content ?? []).map(desdeEmpresa),
    ...(veterinarios.data?.content ?? []).map(desdeVeterinario),
  ]
    .filter((a): a is Actividad => a !== null)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, MAX_ITEMS);

  if (cargando) {
    return (
      <div className="flex items-center justify-center py-12 text-gray-400">
        <Loader2 className="w-5 h-5 animate-spin mr-2" />
        <span className="text-sm font-medium">Cargando actividad…</span>
      </div>
    );
  }

  if (todasFallaron) {
    return (
      <p className="py-12 text-center text-sm font-medium text-gray-400">
        No se pudo cargar la actividad reciente.
      </p>
    );
  }

  if (actividades.length === 0) {
    return (
      <p className="py-12 text-center text-sm font-medium text-gray-400">
        Sin actividad reciente.
      </p>
    );
  }

  return (
    <div className="w-full">
      <table className="min-w-full">
        <thead>
          <tr className="border-b border-gray-100/50 ">
            <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
              Usuario / Entidad
            </th>
            <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
              Acción REALIZADA
            </th>
            <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
              Estado
            </th>
            <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
              Fecha
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100/50 ">
          {actividades.map((activity) => (
            <tr key={activity.key} className="group hover:bg-[#1ea59c]/5 transition-colors duration-300">
              <td className="px-6 py-5 whitespace-nowrap">
                <div className="flex items-center">
                  <div
                    className={`h-10 w-10 rounded-xl ${TONO_ICONO[activity.tono]} flex items-center justify-center font-bold text-sm shadow-sm group-hover:scale-110 transition-transform duration-500`}
                  >
                    {activity.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-black text-[#2D3E82] ">{activity.name}</div>
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      {activity.role}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-5 whitespace-nowrap">
                <p className="text-sm font-medium text-gray-600 ">{activity.action}</p>
              </td>
              <td className="px-6 py-5 whitespace-nowrap">
                <span
                  className={`px-3 py-1 inline-flex text-[10px] font-black uppercase tracking-tighter rounded-full ${TONO_CLASES[activity.tono]}`}
                >
                  {activity.status}
                </span>
              </td>
              <td className="px-6 py-5 whitespace-nowrap text-sm font-medium text-gray-400 group-hover:text-gray-500 transition-colors">
                {formatearFecha(activity.createdAt)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
