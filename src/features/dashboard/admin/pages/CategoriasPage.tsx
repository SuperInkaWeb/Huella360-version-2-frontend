import { useState, useEffect } from "react";
import { Search, Plus, Layers, Edit2, Trash2, ChevronRight, ChevronDown, FolderTree } from "lucide-react";
import { Button } from "../../../../components/ui/Button";
import { adminService } from "../services/adminService";
import { CategoryModal } from "../components/CategoryModal";
import type { Category, CreateCategoryRequest } from "../types/admin.types";
import Swal from "sweetalert2";

export const CategoriasPage = () => {
 const [categories, setCategories] = useState<Category[]>([]);
 const [isLoading, setIsLoading] = useState(true);
 const [searchTerm, setSearchTerm] = useState("");
 const [isModalOpen, setIsModalOpen] = useState(false);
 const [editingCategory, setEditingCategory] = useState<Category | null>(null);
 const [expandedParents, setExpandedParents] = useState<Set<number>>(new Set());

 const fetchCategories = async () => {
 setIsLoading(true);
 try {
 const data = await adminService.getCategories();
 const sorted = [...data].sort((a, b) => {
 if (a.orden !== b.orden) return a.orden - b.orden;
 return a.nombre.localeCompare(b.nombre);
 });
 setCategories(sorted);
 } catch (error) {
 console.error("Error fetching categories:", error);
 } finally {
 setIsLoading(false);
 }
 };

 useEffect(() => {
 fetchCategories();
 }, []);

 const handleCreate = async (data: CreateCategoryRequest) => {
 try {
 await adminService.createCategory(data);
 Swal.fire({
 title: "¡Creada!",
 text: "La categoría se ha creado correctamente.",
 icon: "success",
 timer: 2000,
 showConfirmButton: false,
 customClass: { popup: "rounded-2xl" }
 });
 setIsModalOpen(false);
 fetchCategories();
 } catch (error) {
 Swal.fire({
 title: "Error",
 text: "No se pudo crear la categoría.",
 icon: "error",
 customClass: { popup: "rounded-2xl" }
 });
 }
 };

 const handleUpdate = async (data: CreateCategoryRequest) => {
 if (!editingCategory) return;
 try {
 await adminService.updateCategory(editingCategory.id, data);
 Swal.fire({
 title: "¡Actualizada!",
 text: "La categoría se ha actualizado correctamente.",
 icon: "success",
 timer: 2000,
 showConfirmButton: false,
 customClass: { popup: "rounded-2xl" }
 });
 setIsModalOpen(false);
 setEditingCategory(null);
 fetchCategories();
 } catch (error) {
 Swal.fire({
 title: "Error",
 text: "No se pudo actualizar la categoría.",
 icon: "error",
 customClass: { popup: "rounded-2xl" }
 });
 }
 };

 const handleDelete = async (category: Category) => {
 const result = await Swal.fire({
 title: "¿Eliminar categoría?",
 text: `¿Estás seguro de eliminar "${category.nombre}"? Esta acción no se puede deshacer.`,
 icon: "warning",
 showCancelButton: true,
 confirmButtonColor: "#ef4444",
 confirmButtonText: "Sí, eliminar",
 cancelButtonText: "Cancelar",
 background: 'rgba(255, 255, 255, 0.9)',
 backdrop: `rgba(45, 62, 130, 0.1)`,
 customClass: {
 popup: 'rounded-[1.5rem] border border-white/40 shadow-2xl backdrop-blur-xl',
 confirmButton: 'rounded-xl px-6 py-2.5 font-bold',
 cancelButton: 'rounded-xl px-6 py-2.5 font-bold'
 }
 });

 if (result.isConfirmed) {
 try {
 await adminService.deleteCategory(category.id);
 fetchCategories();
 Swal.fire({
 title: "¡Eliminada!",
 text: "Categoría eliminada con éxito.",
 icon: "success",
 timer: 2000,
 showConfirmButton: false,
 customClass: { popup: "rounded-[1.5rem]" }
 });
 } catch (error) {
 Swal.fire({
 title: "Error",
 text: "No se pudo eliminar la categoría. Asegúrate de que no tenga productos asociados.",
 icon: "error",
 customClass: { popup: "rounded-[1.5rem]" }
 });
 }
 }
 };

 const toggleExpand = (id: number) => {
 const newExpanded = new Set(expandedParents);
 if (newExpanded.has(id)) {
 newExpanded.delete(id);
 } else {
 newExpanded.add(id);
 }
 setExpandedParents(newExpanded);
 };

 const filteredCategories = categories.filter(c =>
 c.nombre.toLowerCase().includes(searchTerm.toLowerCase())
 );

 const rootCategories = filteredCategories.filter(c => !c.padreId);
 const getSubcategories = (parentId: number) => filteredCategories.filter(c => c.padreId === parentId);

 return (
 <div className="h-full flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
 {/* Header */}
 <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
 <div className="space-y-1">
 <h1 className="text-4xl font-black text-[#2D3E82] tracking-tight flex items-center gap-3">
 <Layers className="text-[#1ea59c]" size={36} />
 Categorías del Catálogo
 </h1>
 <p className="text-slate-500 font-medium max-w-xl">
 Gestiona la jerarquía de categorías para organizar productos y servicios en el marketplace global.
 </p>
 </div>
 <Button
 onClick={() => {
 setEditingCategory(null);
 setIsModalOpen(true);
 }}
 className="h-[56px] px-8 rounded-2xl flex items-center gap-3 bg-[#2D3E82] hover:bg-[#1ea59c] text-white shadow-lg shadow-[#2D3E82]/20 transition-all active:scale-95 group font-black uppercase tracking-wider text-xs"
 >
 <Plus size={20} strokeWidth={3} className="group-hover:rotate-90 transition-transform duration-300" />
 <span>Nueva Categoría</span>
 </Button>
 </div>

 {/* Search Bar */}
 <div className="relative group w-full max-w-md">
 <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#1ea59c] transition-colors" size={18} />
 <input
 type="text"
 placeholder="Buscar categorías por nombre..."
 className="w-full pl-11 pr-4 py-4 rounded-2xl border border-white/40 bg-white/60 backdrop-blur-xl focus:ring-4 focus:ring-[#1ea59c]/10 focus:border-[#1ea59c] transition-all outline-none shadow-soft"
 value={searchTerm}
 onChange={(e) => setSearchTerm(e.target.value)}
 />
 </div>

 {/* List Area - Glassmorphic Container */}
 <div className="flex-1 overflow-auto custom-scrollbar bg-white/40 backdrop-blur-2xl rounded-[2.5rem] border border-white/40 shadow-soft p-6">
 <div className="space-y-4">
 {isLoading ? (
 <div className="flex flex-col gap-4 animate-pulse">
 {[1, 2, 3, 4, 5].map(i => (
 <div key={i} className="h-20 bg-white/60 rounded-3xl" />
 ))}
 </div>
 ) : rootCategories.length === 0 ? (
 <div className="flex flex-col items-center justify-center py-32 space-y-4">
 <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center text-slate-300">
 <FolderTree size={48} />
 </div>
 <h3 className="text-xl font-bold text-[#2D3E82] ">Sin categorías</h3>
 <p className="text-slate-500 max-w-xs text-center">No se encontraron categorías. Comienza estructurando tu marketplace hoy mismo.</p>
 </div>
 ) : (
 <div className="grid grid-cols-1 gap-4">
 {rootCategories.map((cat) => {
 const subs = getSubcategories(cat.id);
 const isExpanded = expandedParents.has(cat.id);

 return (
 <div key={cat.id} className="group/container animate-in zoom-in-95 duration-500">
 {/* Parent Row - High Premium Item */}
 <div className={`flex items-center gap-4 p-5 rounded-[2rem] bg-white/40 border border-transparent hover:border-[#1ea59c]/30 hover:bg-white/80 :bg-white/10 transition-all duration-300 relative overflow-hidden ${!cat.activo ? 'opacity-50' : ''}`}>
 {/* Decoration Glow */}
 <div className="absolute -right-8 -top-8 w-24 h-24 bg-[#1ea59c]/5 blur-3xl rounded-full opacity-0 group-hover/container:opacity-100 transition-opacity" />

 <button
 onClick={() => toggleExpand(cat.id)}
 className={`w-8 h-8 flex items-center justify-center rounded-xl text-slate-400 hover:text-[#1ea59c] hover:bg-[#1ea59c]/10 transition-all ${subs.length === 0 ? 'invisible' : ''}`}
 >
 {isExpanded ? <ChevronDown size={20} strokeWidth={3} /> : <ChevronRight size={20} strokeWidth={3} />}
 </button>

 <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-[#1ea59c]/20 to-[#2D3E82]/20 flex items-center justify-center text-[#1ea59c] font-black text-xl border border-[#1ea59c]/10 shadow-sm group-hover/container:scale-105 transition-transform duration-500">
 {cat.iconoUrl ? <img src={cat.iconoUrl} alt="" className="w-8 h-8 object-contain" /> : cat.nombre.charAt(0)}
 </div>

 <div className="flex-1 min-w-0">
 <div className="flex items-center gap-3">
 <span className="text-lg font-black text-[#2D3E82] tracking-tight truncate group-hover/container:text-[#1ea59c] transition-colors">{cat.nombre}</span>
 {!cat.activo && (
 <span className="px-2 py-0.5 rounded-lg text-[9px] bg-rose-500/10 text-rose-600 font-black uppercase tracking-widest border border-rose-500/20">Inactiva</span>
 )}
 {subs.length > 0 && (
 <span className="px-2 py-0.5 rounded-lg text-[9px] bg-[#2D3E82]/5 text-[#2D3E82] font-black uppercase tracking-widest border border-[#2D3E82]/10">
 {subs.length} {subs.length === 1 ? 'Sub' : 'Subs'}
 </span>
 )}
 </div>
 <p className="text-[11px] text-slate-400 font-mono font-medium lowercase tracking-tighter">slug: {cat.slug}</p>
 </div>

 <div className="flex items-center gap-2 opacity-0 group-hover/container:opacity-100 transition-all translate-x-4 group-hover/container:translate-x-0">
 <button
 onClick={() => {
 setEditingCategory(cat);
 setIsModalOpen(true);
 }}
 className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-[#1ea59c] hover:bg-[#1ea59c]/10 rounded-xl transition-all border border-transparent hover:border-[#1ea59c]/20"
 >
 <Edit2 size={18} />
 </button>
 <button
 onClick={() => handleDelete(cat)}
 className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-500/10 rounded-xl transition-all border border-transparent hover:border-rose-500/20"
 >
 <Trash2 size={18} />
 </button>
 </div>
 </div>

 {/* Subcategories - Nested with premium indentation */}
 {isExpanded && subs.length > 0 && (
 <div className="ml-16 mt-3 space-y-3 pl-8 border-l-2 border-slate-100 animate-in slide-in-from-left-4 duration-500">
 {subs.map(sub => (
 <div key={sub.id} className={`flex items-center gap-4 p-4 rounded-2xl bg-white/20 hover:bg-white/60 :bg-white/10 transition-all group/sub ${!sub.activo ? 'opacity-50' : ''}`}>
 <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 group-hover/sub:text-[#1ea59c] font-bold text-sm transition-colors border border-transparent group-hover/sub:border-[#1ea59c]/20">
 {sub.nombre.charAt(0)}
 </div>
 <div className="flex-1 min-w-0">
 <span className="text-sm font-black text-[#2D3E82] tracking-tight">{sub.nombre}</span>
 <p className="text-[10px] text-slate-400 font-mono tracking-tighter">{sub.slug}</p>
 </div>
 <div className="flex items-center gap-1 opacity-0 group-hover/sub:opacity-100 transition-all">
 <button
 onClick={() => {
 setEditingCategory(sub);
 setIsModalOpen(true);
 }}
 className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-[#1ea59c] rounded-lg transition-colors"
 >
 <Edit2 size={14} />
 </button>
 <button
 onClick={() => handleDelete(sub)}
 className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
 >
 <Trash2 size={14} />
 </button>
 </div>
 </div>
 ))}
 </div>
 )}
 </div>
 );
 })}
 </div>
 )}
 </div>
 </div>

 <CategoryModal
 isOpen={isModalOpen}
 onClose={() => setIsModalOpen(false)}
 onSubmit={editingCategory ? handleUpdate : handleCreate}
 category={editingCategory}
 allCategories={categories}
 isLoading={false}
 />
 </div>
 );
};
