import { useEffect, useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { PageResponse } from "../../../../shared/types/api";

export type EstadoValidacion = "PENDIENTE" | "VERIFICADO" | "RECHAZADO";

export interface ListadoParams {
  page: number;
  size: number;
  q?: string;
  estado?: EstadoValidacion;
}

export const TAMANO_PAGINA = 20;

// Espera a que el admin deje de escribir antes de consultar al backend.
export function useDebouncedValue<T>(valor: T, ms = 350): T {
  const [debounced, setDebounced] = useState(valor);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(valor), ms);
    return () => clearTimeout(id);
  }, [valor, ms]);
  return debounced;
}

/**
 * Listado paginado del panel admin: la búsqueda, el filtro por estado y la página
 * se resuelven en el backend. Antes se cargaban 50 registros una sola vez y se
 * filtraba en el navegador, así que desde el registro 51 no se podía ver ni validar nada.
 */
export function useAdminListado<T>(clave: string, fetcher: (params: ListadoParams) => Promise<PageResponse<T>>) {
  const [page, setPage] = useState(0);
  const [busqueda, setBusquedaState] = useState("");
  const [estado, setEstadoState] = useState<EstadoValidacion | undefined>(undefined);
  const q = useDebouncedValue(busqueda.trim());

  const query = useQuery({
    queryKey: ["admin", clave, page, q, estado],
    queryFn: () => fetcher({ page, size: TAMANO_PAGINA, q: q || undefined, estado }),
    placeholderData: keepPreviousData,
  });

  // Cambiar el filtro vuelve a la primera página.
  const setBusqueda = (valor: string) => { setBusquedaState(valor); setPage(0); };
  const setEstado = (valor: EstadoValidacion | undefined) => { setEstadoState(valor); setPage(0); };

  return {
    items: query.data?.content ?? [],
    total: query.data?.totalElements ?? 0,
    totalPages: query.data?.totalPages ?? 0,
    isLoading: query.isLoading,
    isError: query.isError,
    recargar: query.refetch,
    page, setPage,
    busqueda, setBusqueda,
    estado, setEstado,
  };
}
