import { useState, useEffect } from "react";
import { Plus, Search, PawPrint, Loader2, Info, AlertTriangle, ArrowUp } from "lucide-react";
import { Button } from "../../../../components/ui/Button";
import { useAuth } from "../../../auth/context/useAuth";
import { petService } from "../services/petService";
import { subscriptionService } from "../../shared/subscriptions/services/subscriptionService";
import { PetCard } from "../components/PetCard";
import { PetFormModal } from "../components/PetFormModal";
import type { Pet, CreatePetRequest, UpdatePetRequest } from "../types/pet.types";
import type { Suscripcion } from "../../shared/subscriptions/types/subscription.types";
import Swal from "sweetalert2";
import { Link } from "react-router-dom";

export const MascotasPage = () => {
 const { nombre } = useAuth();
 const [pets, setPets] = useState<Pet[]>([]);
 const [isLoading, setIsLoading] = useState(true);
 const [searchTerm, setSearchTerm] = useState("");
 const [isModalOpen, setIsModalOpen] = useState(false);
 const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
 const [suscripcion, setSuscripcion] = useState<Suscripcion | null>(null);

 const fetchPets = async () => {
 setIsLoading(true);
 try {
 const [data, subData] = await Promise.all([
   petService.getMyPets(),
   subscriptionService.getMySubscription().catch(() => null),
 ]);
 setPets(data);
 setSuscripcion(subData);
 } catch (error) {
 console.error("Error fetching pets:", error);
 } finally {
 setIsLoading(false);
 }
 };

 useEffect(() => {
 fetchPets();
 }, []);

 const handleCreateOrUpdate = async (data: CreatePetRequest | UpdatePetRequest, foto?: File) => {
 setIsLoading(true);
 try {
 if (selectedPet) {
 await petService.updatePet(selectedPet.id, data as UpdatePetRequest, foto);
 Swal.fire({
 title: "¡Actualizada!",
 text: "La información de tu mascota ha sido actualizada.",
 icon: "success",
 customClass: { popup: "rounded-[2rem]" }
 });
 } else {
 await petService.createPet(data as CreatePetRequest, foto);
 Swal.fire({
 title: "¡Registrada!",
 text: "Tu nueva mascota ha sido registrada con éxito.",
 icon: "success",
 customClass: { popup: "rounded-[2rem]" }
 });
 }
 setIsModalOpen(false);
 fetchPets();
 } catch (error: any) {
  const message = error?.response?.data?.message || "Hubo un problema al procesar la solicitud.";
  Swal.fire({
   title: "Error",
   text: message,
   icon: "error",
   customClass: { popup: "rounded-[2rem]" }
  });
 } finally {
 setIsLoading(false);
 }
 };

 const handleDelete = async (pet: Pet) => {
 const result = await Swal.fire({
 title: "¿Eliminar registro?",
 text: `¿Estás seguro de eliminar a ${pet.nombre}? Esta acción es permanente.`,
 icon: "warning",
 showCancelButton: true,
 confirmButtonColor: "#ef4444",
 confirmButtonText: "Sí, eliminar",
 cancelButtonText: "Cancelar",
 customClass: {
 popup: "rounded-[2rem]",
 confirmButton: "rounded-xl",
 cancelButton: "rounded-xl"
 }
 });

 if (result.isConfirmed) {
 try {
 await petService.deletePet(pet.id);
 fetchPets();
 Swal.fire({
 title: "Eliminado",
 text: "El registro ha sido eliminado.",
 icon: "success",
 customClass: { popup: "rounded-[2rem]" }
 });
 } catch (error) {
 Swal.fire("Error", "No se pudo eliminar el registro.", "error");
 }
 }
 };

 const filteredPets = pets.filter(pet =>
 pet.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
 pet.especie.toLowerCase().includes(searchTerm.toLowerCase()) ||
 pet.raza?.toLowerCase().includes(searchTerm.toLowerCase())
 );

 return (
 <div className="space-y-10 animate-in fade-in duration-700">
 {/* 1. Page Header */}
 <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
 <div>
 <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
 ¡Hola de nuevo, {nombre}!
 </h1>
 <p className="text-sm sm:text-base text-gray-500 mt-1">
 Esto es lo que está pasando con tus mascotas hoy.
 </p>
 </div>
 <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
  <button
   onClick={() => {
    if (suscripcion && suscripcion.plan.limiteMascotas > 0 && pets.length >= suscripcion.plan.limiteMascotas) {
      Swal.fire({
        title: "Límite alcanzado",
        text: `Tu plan ${suscripcion.plan.nombre} solo permite ${suscripcion.plan.limiteMascotas} mascota${suscripcion.plan.limiteMascotas !== 1 ? "s" : ""}. Mejora tu suscripción para registrar más.`,
        icon: "warning",
        confirmButtonText: "Ver planes",
        showCancelButton: true,
        cancelButtonText: "Cancelar",
        customClass: { popup: "rounded-[2rem]" },
      }).then((result) => {
        if (result.isConfirmed) window.location.href = "/portal/cliente/suscripcion";
      });
      return;
    }
    setSelectedPet(null);
    setIsModalOpen(true);
   }}
   className="inline-flex items-center justify-center px-4 py-2.5 border border-transparent rounded-xl shadow-md text-sm font-semibold text-white bg-primary hover:bg-primary-dark transition-all active:scale-95"
  >
   <Plus size={18} className="mr-2" />
   Nueva Mascota
  </button>
 </div>
 </div>

  {/* 2. Plan Limit Banner */}
  {suscripcion && suscripcion.plan.limiteMascotas > 0 && pets.length >= suscripcion.plan.limiteMascotas && (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
      <AlertTriangle size={20} className="text-amber-600 shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-amber-800">
          Límite de tu plan alcanzado
        </p>
        <p className="text-xs text-amber-700 mt-0.5">
          Tu plan {suscripcion.plan.nombre} permite hasta {suscripcion.plan.limiteMascotas} mascota{suscripcion.plan.limiteMascotas !== 1 ? "s" : ""}. 
          Tienes {pets.length} registrada{pets.length !== 1 ? "s" : ""}. 
          {pets.length > suscripcion.plan.limiteMascotas ? " Las mascotas existentes se mantendrán visibles." : ""}
        </p>
        <Link
          to="/portal/cliente/suscripcion"
          className="inline-flex items-center gap-1 mt-2 text-xs font-medium text-amber-700 hover:text-amber-800 underline underline-offset-2"
        >
          <ArrowUp size={14} />
          Mejorar plan
        </Link>
      </div>
    </div>
  )}

  {/* 3. KPI Cards */}
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {[
   { label: "Mascotas Registradas", value: pets.length, limit: suscripcion?.plan.limiteMascotas, colorClass: "text-primary", bgClass: "bg-primary/10", icon: PawPrint },
   { label: "Citas Activas", value: 0, limit: null, colorClass: "text-emerald-500", bgClass: "bg-emerald-500/10", icon: Loader2 },
   { label: "Alertas de Salud", value: 0, limit: null, colorClass: "text-amber-500", bgClass: "bg-amber-500/10", icon: Info },
  ].map((stat, i) => (
   <div key={i} className="relative overflow-hidden group p-6 bg-white rounded-2xl border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all">
   <div className={`absolute -right-4 -top-4 w-24 h-24 opacity-5 group-hover:scale-125 transition-transform ${stat.colorClass}`}>
    <stat.icon size={96} />
   </div>

   <div className="relative flex items-center gap-4">
    <div className={`shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center ${stat.bgClass} shadow-inner`}>
    <stat.icon className={stat.colorClass} size={28} />
    </div>
    <div className="flex-1 min-w-0">
    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-0.5">{stat.label}</p>
    <div className="flex items-baseline flex-wrap gap-x-2">
     <h3 className="text-2xl font-bold text-gray-900 ">
       {stat.limit != null ? `${stat.value} / ${stat.limit}` : stat.value}
     </h3>
     {stat.limit != null && stat.value >= stat.limit && (
     <span className="inline-flex items-center text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 ">
      Límite
     </span>
     )}
    </div>
    {stat.limit != null && (
      <div className="mt-2 w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${stat.value >= stat.limit ? "bg-amber-400" : "bg-primary"}`}
          style={{ width: `${Math.min((stat.value / stat.limit) * 100, 100)}%` }}
        />
      </div>
    )}
    </div>
   </div>
   </div>
  ))}
 </div>

 {/* 3. Filter & Grid Section */}
 <div className="space-y-6">
 <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
 <div className="relative group max-w-sm w-full">
 <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={18} />
 <input
 type="text"
 placeholder="Filtrar por nombre..."
 className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none text-sm font-medium"
 value={searchTerm}
 onChange={(e) => setSearchTerm(e.target.value)}
 />
 </div>
 <div className="flex flex-wrap items-center gap-3">
 <span className="text-sm font-semibold text-gray-400">Ordenar por:</span>
 <select className="flex-1 sm:flex-initial bg-white border-gray-200 text-sm font-bold text-gray-600 rounded-xl focus:ring-1 focus:ring-primary py-2.5 pl-4 pr-10 cursor-pointer transition-all">
 <option>Recientes</option>
 <option>Nombre</option>
 <option>Especie</option>
 </select>
 </div>
 </div>

 {isLoading && pets.length === 0 ? (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
 {[1, 2, 3].map((i) => (
 <div key={i} className="h-[400px] bg-white rounded-[2.5rem] animate-pulse border border-slate-100 " />
 ))}
 </div>
 ) : filteredPets.length === 0 ? (
 <div className="bg-white rounded-3xl p-16 text-center border border-slate-100 shadow-sm">
 <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
 <PawPrint size={40} className="text-primary" />
 </div>
 <h2 className="text-2xl font-black text-slate-900 ">No se encontraron mascotas</h2>
 <p className="text-slate-500 mt-2 font-medium">
 {searchTerm ? "Prueba con otro término de búsqueda." : "Aún no has registrado ninguna mascota."}
 </p>
 {!searchTerm && (
 <Button
 onClick={() => setIsModalOpen(true)}
 className="mt-8 rounded-2xl h-14 px-10 shadow-xl shadow-primary/20 font-bold"
 >
 Registrar mi primera mascota
 </Button>
 )}
 </div>
  ) : (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-10">
  {filteredPets
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    .map((pet, index) => (
   <PetCard
   key={pet.id}
   pet={pet}
   isOverLimit={!!(suscripcion && index >= suscripcion.plan.limiteMascotas && suscripcion.plan.limiteMascotas > 0)}
   onEdit={(p) => {
   setSelectedPet(p);
   setIsModalOpen(true);
   }}
   onDelete={handleDelete}
   />
  ))}
  </div>
  )}
 </div>
 {/* Modal */}
 <PetFormModal
 isOpen={isModalOpen}
 onClose={() => setIsModalOpen(false)}
 onSubmit={handleCreateOrUpdate}
 pet={selectedPet}
 isLoading={isLoading}
 />
 </div>
 );
};
