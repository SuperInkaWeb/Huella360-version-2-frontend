import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { X, Save, Layers } from "lucide-react";
import { Button } from "../../../../components/ui/Button";
import type { Category, CreateCategoryRequest } from "../types/admin.types";

const categorySchema = z.object({
 nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
 padreId: z.number().nullable().optional(),
 iconoUrl: z.string().nullable().optional(),
 activo: z.boolean(),
 orden: z.number().int().min(0, "El orden debe ser un número positivo"),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

interface CategoryModalProps {
 isOpen: boolean;
 onClose: () => void;
 onSubmit: (data: CreateCategoryRequest) => Promise<void>;
 category?: Category | null;
 allCategories: Category[];
 isLoading?: boolean;
}

export const CategoryModal = ({
 isOpen,
 onClose,
 onSubmit,
 category,
 allCategories,
 isLoading
}: CategoryModalProps) => {
 const {
 register,
 handleSubmit,
 reset,
 formState: { errors },
 } = useForm<CategoryFormValues>({
 resolver: zodResolver(categorySchema),
 defaultValues: {
 nombre: "",
 padreId: null,
 iconoUrl: "",
 activo: true,
 orden: 0,
 },
 });

 useEffect(() => {
 if (category) {
 reset({
 nombre: category.nombre,
 padreId: category.padreId,
 iconoUrl: category.iconoUrl,
 activo: category.activo,
 orden: category.orden,
 });
 } else {
 reset({
 nombre: "",
 padreId: null,
 iconoUrl: "",
 activo: true,
 orden: 0,
 });
 }
 }, [category, reset, isOpen]);

 if (!isOpen) return null;

 const availableParents = allCategories.filter(c => !c.padreId && (!category || c.id !== category.id));

 const onFormSubmit = async (data: CategoryFormValues) => {
 const payload: CreateCategoryRequest = {
 nombre: data.nombre,
 padreId: (!data.padreId || isNaN(Number(data.padreId))) ? null : Number(data.padreId),
 iconoUrl: data.iconoUrl?.trim() || null,
 activo: data.activo,
 orden: data.orden,
 };
 await onSubmit(payload);
 };

 return (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
 <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
 {/* Header */}
 <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 ">
 <div className="flex items-center gap-3">
 <div className="p-2 bg-primary/10 rounded-lg text-primary">
 <Layers size={20} />
 </div>
 <h2 className="text-lg font-bold text-slate-900 ">
 {category ? "Editar Categoría" : "Nueva Categoría"}
 </h2>
 </div>
 <button
 onClick={onClose}
 className="p-2 text-slate-400 hover:text-slate-600 :text-slate-200 hover:bg-slate-100 :bg-slate-800 rounded-full transition-colors"
 >
 <X size={20} />
 </button>
 </div>

 {/* Content */}
 <form onSubmit={handleSubmit(onFormSubmit)} className="flex-1 overflow-y-auto p-6 space-y-5">
 {/* Nombre */}
 <div className="space-y-2">
 <label className="text-sm font-semibold text-slate-700 ">
 Nombre de la Categoría
 </label>
 <input
 {...register("nombre")}
 placeholder="Ej: Alimentos, Juguetes, Farmacia..."
 className={`w-full px-4 py-2.5 rounded-xl border ${errors.nombre
 ? "border-red-500 focus:ring-red-200"
 : "border-slate-200 focus:ring-primary/20 focus:border-primary"
 } bg-white outline-none focus:ring-4 transition-all`}
 />
 {errors.nombre && (
 <p className="text-xs text-red-500 font-medium ml-1">{errors.nombre.message}</p>
 )}
 </div>

 {/* Categoría Padre */}
 <div className="space-y-2">
 <label className="text-sm font-semibold text-slate-700 ">
 Categoría Padre (Opcional)
 </label>
 <select
 {...register("padreId", { valueAsNumber: true })}
 className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white outline-none focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all appearance-none"
 >
 <option value="">Ninguna (Categoría Principal)</option>
 {availableParents.map((prev) => (
 <option key={prev.id} value={prev.id}>
 {prev.nombre}
 </option>
 ))}
 </select>
 <p className="text-[11px] text-slate-500 ml-1">
 Selecciona una si deseas que esta sea una subcategoría.
 </p>
 </div>

 {/* Icono URL */}
 <div className="space-y-2">
 <label className="text-sm font-semibold text-slate-700 ">
 URL del Icono (Opcional)
 </label>
 <input
 {...register("iconoUrl")}
 placeholder="https://..."
 className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white outline-none focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all"
 />
 </div>

 <div className="grid grid-cols-2 gap-4">
 {/* Orden */}
 <div className="space-y-2">
 <label className="text-sm font-semibold text-slate-700 ">
 Orden
 </label>
 <input
 type="number"
 {...register("orden", { valueAsNumber: true })}
 className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white outline-none focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all"
 />
 </div>

 {/* Estado */}
 <div className="space-y-2">
 <label className="text-sm font-semibold text-slate-700 ">
 Estado
 </label>
 <div className="flex items-center h-[46px]">
 <label className="relative inline-flex items-center cursor-pointer">
 <input
 type="checkbox"
 {...register("activo")}
 className="sr-only peer"
 />
 <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
 <span className="ms-3 text-sm font-medium text-slate-600 ">
 Activa
 </span>
 </label>
 </div>
 </div>
 </div>
 </form>

 {/* Footer */}
 <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex gap-3">
 <Button
 type="button"
 variant="outline"
 className="flex-1 rounded-xl h-11"
 onClick={onClose}
 disabled={isLoading}
 >
 Cancelar
 </Button>
 <Button
 onClick={handleSubmit(onFormSubmit)}
 className="flex-1 rounded-xl h-11 shadow-md shadow-primary/20 items-center justify-center gap-2"
 disabled={isLoading}
 >
 <Save size={18} />
 {category ? "Actualizar" : "Guardar"}
 </Button>
 </div>
 </div>
 </div>
 );
};
