import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, Upload, Trash2, Tag, Package } from "lucide-react";
import { Button } from "../../../../components/ui/Button";
import { CategoryCombobox } from "../../../../components/ui/CategoryCombobox";
import type { Category } from "../../../catalog/types/category";
import { categoryService } from "../../../catalog/services/categoryService";
import type { CreateProductRequest, Product } from "../../../catalog/types/product";
import { productService } from "../services/productService";
import Swal from "sweetalert2";

const productSchema = z.object({
  nombre: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  descripcion: z.string().optional(),
  precio: z.number().min(0.01, "El precio debe ser mayor a 0"),
  precioOferta: z.number().optional().nullable(),
  ofertaInicio: z.string().optional().nullable(),
  ofertaFin: z.string().optional().nullable(),
  stock: z.number().int("El stock debe ser un número entero").min(0, "El stock no puede ser negativo").max(999999, "El stock no puede superar 999,999"),
  categoriaId: z.number().positive("Selecciona una categoría"),
  visible: z.boolean(),
}).refine((data) => {
  if (data.precioOferta !== null && data.precioOferta !== undefined && data.precioOferta > 0) {
    return data.precioOferta < data.precio;
  }
  return true;
}, {
  message: "El precio de oferta debe ser menor al precio base",
  path: ["precioOferta"],
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  product?: Product | null;
}

export const ProductFormModal = ({ isOpen, onClose, onSuccess, product }: ProductFormModalProps) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showOffer, setShowOffer] = useState(false);

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: { visible: true, precio: 0, stock: 0 },
  });

  const precio = watch("precio");

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await categoryService.getAllCategories();
        setCategories(data);
      } catch (error) { console.error(error); }
    };
    if (isOpen) {
      fetchCategories();
      if (product) {
        reset({
          nombre: product.nombre,
          descripcion: product.descripcion,
          precio: product.precio,
          precioOferta: product.precioOferta ?? null,
          ofertaInicio: product.ofertaInicio?.substring(0, 16) ?? null,
          ofertaFin: product.ofertaFin?.substring(0, 16) ?? null,
          stock: product.stock,
          categoriaId: product.categoriaId,
          visible: product.visible,
        });
        setPreviews(product.imagenes);
        if (product.precioOferta) setShowOffer(true);
      } else {
        reset({ nombre: "", descripcion: "", precio: 0, stock: 0, visible: true, categoriaId: 0 as any });
        setPreviews([]);
        setSelectedImages([]);
        setShowOffer(false);
      }
    }
  }, [isOpen, product, reset]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const totalImages = previews.length + files.length;

    if (totalImages > 5) {
      Swal.fire({
        icon: 'warning',
        title: 'Límite excedido',
        text: `Solo puedes subir un máximo de 5 imágenes. Ya tienes ${previews.length}, intentaste subir ${files.length}.`,
        confirmButtonColor: '#3b82f6'
      });
      return;
    }

    if (files.length > 0) {
      setSelectedImages((prev) => [...prev, ...files]);
      const newPreviews = files.map((file) => URL.createObjectURL(file));
      setPreviews((prev) => [...prev, ...newPreviews]);
    }
    e.target.value = "";
  };

  const removeImage = (index: number) => {
    const imageToRemove = previews[index];
    const isNewImage = imageToRemove.startsWith('blob:');

    if (isNewImage) {
      const newImagesBeforeThisOne = previews
        .slice(0, index)
        .filter(p => p.startsWith('blob:')).length;
      setSelectedImages((prev) => prev.filter((_, i) => i !== newImagesBeforeThisOne));
    }

    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: ProductFormData) => {
    if (previews.length === 0) {
      Swal.fire("Imagen obligatoria", "Debes subir al menos una imagen", "warning");
      return;
    }

    setIsSubmitting(true);

    try {
      const currentServerImages = previews.filter(p => !p.startsWith('blob:'));

      const payloadToSend = {
        ...data,
        imagenes: currentServerImages,
        precioOferta: !showOffer || !data.precioOferta ? null : data.precioOferta,
        ofertaInicio: showOffer && data.ofertaInicio
          ? (data.ofertaInicio.length === 16 ? `${data.ofertaInicio}:00` : data.ofertaInicio)
          : null,
        ofertaFin: showOffer && data.ofertaFin
          ? (data.ofertaFin.length === 16 ? `${data.ofertaFin}:00` : data.ofertaFin)
          : null,
        actualizarOferta: true,
      };

      if (product) {
        await productService.updateProductMultipart(
          product.id,
          payloadToSend as any,
          selectedImages,
          false
        );
        Swal.fire("Éxito", "Producto actualizado correctamente", "success");
      } else {
        await productService.createProduct(
          payloadToSend as CreateProductRequest,
          selectedImages
        );
        Swal.fire("Éxito", "Producto creado correctamente", "success");
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      const msg = error.response?.data?.message || "Ocurrió un error al procesar el producto";
      Swal.fire("Error", msg, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl max-h-[90vh] flex flex-col border border-slate-200">

        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Package size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {product ? "Editar Producto" : "Nuevo Producto"}
              </h2>
              <p className="text-xs text-slate-400">Completa la información de tu producto</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto p-6 space-y-5">

          {/* Imagen principal — primero, es lo más visual */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Imágenes del producto</label>
            <div className="grid grid-cols-5 gap-3">
              {previews.map((src, i) => (
                <div key={i} className="aspect-square bg-slate-100 rounded-xl border border-slate-200 overflow-hidden relative group">
                  <img src={src} className="w-full h-full object-cover" alt="" />
                  <button type="button" onClick={() => removeImage(i)} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
              {previews.length < 5 && (
                <label className="aspect-square bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-all">
                  <Upload size={20} className="text-slate-400 mb-1" />
                  <span className="text-[10px] text-slate-400 font-medium">Agregar</span>
                  <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageChange} />
                </label>
              )}
            </div>
            {previews.length === 0 && <p className="text-xs text-slate-400 mt-2">Sube al menos una imagen del producto</p>}
          </div>

          {/* Nombre */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nombre del producto</label>
            <input
              {...register("nombre")}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 focus:border-primary/40 outline-none transition-all"
              placeholder="Ej. Comida premium para perros"
            />
            {errors.nombre && <p className="text-xs text-red-500 mt-1">{errors.nombre.message}</p>}
          </div>

          {/* Categoría */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Categoría</label>
            <CategoryCombobox
              categories={categories}
              value={watch("categoriaId") || null}
              onChange={(id) => setValue("categoriaId", id, { shouldValidate: true })}
              error={errors.categoriaId?.message}
            />
          </div>

          {/* Precio y Stock — grid 2 columnas */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Precio (S/)</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                {...register("precio", { valueAsNumber: true })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 focus:border-primary/40 outline-none transition-all"
                placeholder="0.00"
              />
              {errors.precio && <p className="text-xs text-red-500 mt-1">{errors.precio.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Stock</label>
              <input
                type="number"
                min="0"
                max="999999"
                step="1"
                {...register("stock", { valueAsNumber: true })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 focus:border-primary/40 outline-none transition-all"
                placeholder="0"
              />
              {errors.stock && <p className="text-xs text-red-500 mt-1">{errors.stock.message}</p>}
            </div>
          </div>

          {/* Oferta temporal */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => setShowOffer(!showOffer)}
              className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Tag size={16} className={showOffer ? "text-primary" : "text-slate-400"} />
                <span className="text-sm font-semibold text-slate-700">Oferta temporal</span>
              </div>
              <div className={`w-9 h-5 rounded-full transition-colors ${showOffer ? 'bg-primary' : 'bg-slate-300'}`}>
                <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform mt-0.5 ${showOffer ? 'translate-x-4.5 ml-0.5' : 'ml-0.5'}`} />
              </div>
            </button>

            {showOffer && (
              <div className="p-4 space-y-3 bg-primary/[0.02]">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Precio de oferta (S/)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    {...register("precioOferta", { valueAsNumber: true })}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:ring-2 focus:ring-primary/20 focus:border-primary/40 outline-none"
                    placeholder={`Menor a S/ ${precio || 0}`}
                  />
                  {errors.precioOferta && <p className="text-xs text-red-500 mt-1">{errors.precioOferta.message}</p>}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Inicio</label>
                    <input type="datetime-local" {...register("ofertaInicio")} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-primary/20 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Fin</label>
                    <input type="datetime-local" {...register("ofertaFin")} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-primary/20 outline-none" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Descripción</label>
            <textarea
              {...register("descripcion")}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 focus:border-primary/40 outline-none transition-all resize-none"
              rows={3}
              placeholder="Describe tu producto (opcional)"
            />
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 shrink-0">
          <Button variant="outline" onClick={onClose} type="button" className="px-5">
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSubmit(onSubmit)} disabled={isSubmitting} className="px-6">
            {isSubmitting ? (
              <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              product ? "Guardar cambios" : "Crear producto"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
