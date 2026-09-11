import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { X, Save, Camera, PawPrint, Info } from "lucide-react";
import { Button } from "../../../../components/ui/Button";
import { Sexo, type Pet, type CreatePetRequest } from "../types/pet.types";
import Swal from "sweetalert2";

const petSchema = z.object({
 nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
 especie: z.string().min(2, "La especie es obligatoria"),
 raza: z.string().optional().nullable(),
 sexo: z.enum([Sexo.MACHO, Sexo.HEMBRA]).nullable(),
 fechaNacimiento: z.string().nullable(),
 pesoKg: z.number().positive("El peso debe ser un valor positivo"),
 esterilizado: z.boolean(),
 observacionesMedicas: z.string().optional().nullable(),
});

type PetFormValues = z.infer<typeof petSchema>;

interface PetFormModalProps {
 isOpen: boolean;
 onClose: () => void;
 onSubmit: (data: CreatePetRequest, foto?: File) => void;
 pet?: Pet | null;
 isLoading?: boolean;
}

export const PetFormModal = ({
 isOpen,
 onClose,
 onSubmit,
 pet,
 isLoading
}: PetFormModalProps) => {
 const [fotoFile, setFotoFile] = useState<File | undefined>();
 const [fotoPreview, setFotoPreview] = useState<string | null>(null);

 const {
 register,
 handleSubmit,
 reset,
 formState: { errors },
 } = useForm<PetFormValues>({
 resolver: zodResolver(petSchema),
 defaultValues: {
 nombre: "",
 especie: "",
 raza: "",
 sexo: null,
 fechaNacimiento: "",
 pesoKg: 0,
 esterilizado: false,
 observacionesMedicas: "",
 },
 });

 useEffect(() => {
 if (pet) {
 reset({
 nombre: pet.nombre,
 especie: pet.especie,
 raza: pet.raza,
 sexo: pet.sexo,
 fechaNacimiento: pet.fechaNacimiento,
 pesoKg: pet.pesoKg,
 esterilizado: pet.esterilizado,
 observacionesMedicas: pet.observacionesMedicas,
 });
 setFotoPreview(pet.fotoUrl);
 } else {
 reset({
 nombre: "",
 especie: "",
 raza: "",
 sexo: null,
 fechaNacimiento: "",
 pesoKg: 0,
 esterilizado: false,
 observacionesMedicas: "",
 });
 setFotoPreview(null);
 }
 }, [pet, reset, isOpen]);

 const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
 const file = e.target.files?.[0];
 if (file) {
 setFotoFile(file);
 const reader = new FileReader();
 reader.onloadend = () => {
 setFotoPreview(reader.result as string);
 };
 reader.readAsDataURL(file);
 }
 };

 const onFormSubmit = (data: PetFormValues) => {
 if (!pet && !fotoFile) {
 Swal.fire("Imagen obligatoria", "Debes subir una foto de tu mascota", "warning");
 return;
 }

 const formattedData = {
 ...data,
 sexo: data.sexo || null, // Asegura null si está vacío
 fechaNacimiento: data.fechaNacimiento === "" ? null : data.fechaNacimiento,
 };
 onSubmit(formattedData as CreatePetRequest, fotoFile);
 };

 if (!isOpen) return null;

 return (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
 <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
 {/* Header */}
 <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between">
 <div className="flex items-center gap-4">
 <div className="p-3 bg-primary/10 rounded-xl text-primary">
 <PawPrint size={24} />
 </div>
 <div>
 <h2 className="text-xl font-bold text-gray-900 ">
 {pet ? "Editar Mascota" : "Registrar Nueva Mascota"}
 </h2>
 <p className="text-sm text-gray-500 ">Completa la información de tu compañero.</p>
 </div>
 </div>
 <button
 onClick={onClose}
 className="p-2 text-gray-400 hover:text-gray-600 :text-gray-200 hover:bg-gray-100 :bg-surface-darker rounded-lg transition-all"
 >
 <X size={20} />
 </button>
 </div>

 {/* Content */}
 <form onSubmit={handleSubmit(onFormSubmit)} className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
 <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
 {/* Foto Upload */}
 <div className="md:col-span-4 flex flex-col items-center gap-4">
 <div className="relative group">
 <div className="w-40 h-40 rounded-2xl overflow-hidden border border-gray-100 shadow-sm bg-gray-50 flex items-center justify-center transition-transform group-hover:scale-[1.02]">
 {fotoPreview ? (
 <img src={fotoPreview} alt="Preview" className="w-full h-full object-cover" />
 ) : (
 <PawPrint size={48} className="text-gray-300 " />
 )}
 </div>
 <label className="absolute -bottom-2 -right-2 p-2.5 bg-primary text-white rounded-xl shadow-lg border-4 border-white cursor-pointer hover:scale-110 active:scale-95 transition-all">
 <Camera size={18} />
 <input type="file" className="sr-only" onChange={handleImageChange} accept="image/*" />
 </label>
 </div>
 <p className="text-[11px] text-gray-400 font-medium text-center">Formato: JPG, PNG. Máx 5MB</p>
 </div>

 {/* Form Fields */}
 <div className="md:col-span-8 space-y-6">
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div className="space-y-2">
 <label className="text-sm font-semibold text-gray-700 ">Nombre</label>
 <input
 {...register("nombre")}
 placeholder="Ej: Max, Luna..."
 className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none text-sm"
 />
 {errors.nombre && <p className="text-xs text-red-500">{errors.nombre.message}</p>}
 </div>

 <div className="space-y-2">
 <label className="text-sm font-semibold text-gray-700 ">Especie</label>
 <select
 {...register("especie")}
 className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none text-sm appearance-none"
 >
 <option value="">Seleccionar...</option>
 <option value="Perro">Perro</option>
 <option value="Gato">Gato</option>
 <option value="Ave">Ave</option>
 <option value="Conejo">Conejo</option>
 <option value="Hámster">Hámster</option>
 <option value="Otro">Otro</option>
 </select>
 {errors.especie && <p className="text-xs text-red-500">{errors.especie.message}</p>}
 </div>

 <div className="space-y-2">
 <label className="text-sm font-semibold text-gray-700 ">Raza</label>
 <input
 {...register("raza")}
 placeholder="Ej: Golden Retriever..."
 className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none text-sm"
 />
 </div>

 <div className="space-y-2">
 <label className="text-sm font-semibold text-gray-700 ">Sexo</label>
 <select
 {...register("sexo")}
 className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none text-sm appearance-none"
 >
 <option value="">Seleccionar...</option>
 <option value={Sexo.MACHO}>Macho</option>
 <option value={Sexo.HEMBRA}>Hembra</option>
 </select>
 </div>

 <div className="space-y-2">
 <label className="text-sm font-semibold text-gray-700 ">Fecha Nacimiento</label>
 <input
 type="date"
 {...register("fechaNacimiento")}
 className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none text-sm"
 />
 </div>

 <div className="space-y-2">
 <label className="text-sm font-semibold text-gray-700 ">Peso (Kg)</label>
 <input
 type="number"
 step="0.1"
 {...register("pesoKg", { valueAsNumber: true })}
 className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none text-sm"
 />
 </div>
 </div>

 <div className="flex items-center gap-2 p-4 bg-gray-50 rounded-xl border border-gray-100 ">
 <input
 type="checkbox"
 id="esterilizado"
 {...register("esterilizado")}
 className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
 />
 <label htmlFor="esterilizado" className="text-sm font-semibold text-gray-700 ">
 ¿Se encuentra esterilizado/a?
 </label>
 </div>
 </div>
 </div>

 <div className="space-y-3">
 <div className="flex items-center gap-2 text-primary">
 <Info size={18} />
 <label className="text-sm font-semibold">Observaciones Médicas / Alergias</label>
 </div>
 <textarea
 {...register("observacionesMedicas")}
 placeholder="Alergia a la penicilina, condición cardíaca, etc..."
 rows={3}
 className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none resize-none text-sm"
 />
 </div>
 </form>

 <div className="px-8 py-6 border-t border-gray-100 flex gap-4 bg-gray-50 ">
 <Button
 type="button"
 variant="outline"
 className="flex-1 rounded-xl h-11 text-sm font-semibold"
 onClick={onClose}
 >
 Cancelar
 </Button>
 <Button
 onClick={handleSubmit(onFormSubmit)}
 className="flex-1 rounded-xl h-11 text-sm font-semibold shadow-md shadow-primary/20 flex items-center justify-center gap-2"
 disabled={isLoading}
 >
 <Save size={18} />
 {isLoading ? "Guardando..." : pet ? "Guardar" : "Registrar"}
 </Button>
 </div>
 </div>
 </div>
 );
};
