import type { Product, ServiceResponse, AdoptionResponse } from "../types/marketplace";

export const mapAdoptionToProduct = (data: AdoptionResponse): Product => ({
    id: `adoption_${data.id}`,
    nombre: data.titulo,
    descripcion: data.historia,
    precio: 0,
    precioActual: 0,
    stock: 1,
    imagenes: data.mascotaFotoUrl ? [data.mascotaFotoUrl] : [],
    categoriaId: -1,
    categoriaNombre: "Adopción",
    empresaId: data.publicadoPorId,
    empresaNombre: data.publicadoPorNombre || "Dueño Particular",
    empresaTipoServicio: data.publicadoPorTipoServicio,
    badge: { text: "Adopción", style: "adoption" },
    itemType: 'adoption'
});

export const mapServiceToProduct = (data: ServiceResponse): Product => ({
    id: `service_${data.id}`,
    nombre: data.nombre,
    descripcion: data.descripcion || "Sin descripción disponible.",
    precio: data.precio,
    precioActual: data.precio,
    stock: 1,
    imagenes: data.imagenUrl ? [data.imagenUrl] : [],
    categoriaId: -2,
    categoriaNombre: "Servicio Médico",
    empresaId: data.veterinarioId || data.empresaId || 0,
    empresaNombre: data.veterinarioId
        ? `${data.veterinarioNombres} ${data.veterinarioApellidos}`
        : (data.empresaNombre || "Veterinario"),
    empresaTipoServicio: data.empresaTipoServicio || data.veterinarioEspecialidad,
    mpPublicKey: data.mpPublicKey,
    badge: { text: data.modalidad || "Servicio", style: "service" },
    itemType: 'service'
});
