import { useState, useMemo, useRef } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  FileText,
  Upload,
  Send,
  ChevronDown,
  AlertCircle,
  CheckCircle2,
  User,
  ShieldCheck,
  Info,
  ShoppingBag,
  ClipboardList,
  Loader2,
  X,
} from "lucide-react";
import Swal from "sweetalert2";
import { DEPARTAMENTOS_PERU, TIPOS_DOCUMENTO } from "../shared/data/peru-locations";
import { api } from "../shared/http/api";

/* ─────────────────────── ZOD SCHEMA ─────────────────────── */

const reclamoSchema = z
  .object({
    // Datos del reclamante
    tipoDocumento: z.string().min(1, "Seleccione un tipo de documento"),
    numeroDocumento: z.string().min(1, "Ingrese su número de documento"),
    primerNombre: z.string().min(1, "Ingrese su primer nombre"),
    segundoNombre: z.string().optional(),
    primerApellido: z.string().min(1, "Ingrese su primer apellido"),
    segundoApellido: z.string().optional(),
    direccion: z.string().min(1, "Ingrese su dirección"),
    departamento: z.string().min(1, "Seleccione un departamento"),
    provincia: z.string().min(1, "Seleccione una provincia"),
    distrito: z.string().min(1, "Seleccione un distrito"),
    correo: z.string().email("Ingrese un correo válido"),
    confirmacionCorreo: z.string().email("Confirme su correo"),
    telefono: z.string().min(6, "Ingrese un teléfono válido"),
    esMenor: z.boolean(),

    // Datos del apoderado (condicional)
    apoderadoTipoDocumento: z.string().optional(),
    apoderadoNumeroDocumento: z.string().optional(),
    apoderadoPrimerNombre: z.string().optional(),
    apoderadoSegundoNombre: z.string().optional(),
    apoderadoPrimerApellido: z.string().optional(),
    apoderadoSegundoApellido: z.string().optional(),
    apoderadoCorreo: z.string().optional(),
    apoderadoConfirmacionCorreo: z.string().optional(),
    apoderadoTelefono: z.string().optional(),

    // Información general
    numeroOrden: z.string().optional(),
    montoReclamado: z.string().optional(),
    nombreProducto: z.string().optional(),

    // Detalle del reclamo
    tipoReclamo: z.enum(["RECLAMO", "QUEJA"], {
      message: "Seleccione el tipo",
    }),
    resumen: z.string().min(1, "Ingrese un resumen"),
    detallePedido: z.string().min(10, "Detalle su pedido (mínimo 10 caracteres)"),
  })
  .refine((data) => data.correo === data.confirmacionCorreo, {
    message: "Los correos electrónicos no coinciden",
    path: ["confirmacionCorreo"],
  })
  .refine(
    (data) => {
      if (data.esMenor) {
        return !!data.apoderadoTipoDocumento && data.apoderadoTipoDocumento.length > 0;
      }
      return true;
    },
    { message: "Seleccione tipo de documento del apoderado", path: ["apoderadoTipoDocumento"] }
  )
  .refine(
    (data) => {
      if (data.esMenor) {
        return !!data.apoderadoNumeroDocumento && data.apoderadoNumeroDocumento.length > 0;
      }
      return true;
    },
    { message: "Ingrese número de documento del apoderado", path: ["apoderadoNumeroDocumento"] }
  )
  .refine(
    (data) => {
      if (data.esMenor) {
        return !!data.apoderadoPrimerNombre && data.apoderadoPrimerNombre.length > 0;
      }
      return true;
    },
    { message: "Ingrese primer nombre del apoderado", path: ["apoderadoPrimerNombre"] }
  )
  .refine(
    (data) => {
      if (data.esMenor) {
        return !!data.apoderadoPrimerApellido && data.apoderadoPrimerApellido.length > 0;
      }
      return true;
    },
    { message: "Ingrese primer apellido del apoderado", path: ["apoderadoPrimerApellido"] }
  )
  .refine(
    (data) => {
      if (data.esMenor) {
        return !!data.apoderadoCorreo && z.string().email().safeParse(data.apoderadoCorreo).success;
      }
      return true;
    },
    { message: "Ingrese un correo válido para el apoderado", path: ["apoderadoCorreo"] }
  )
  .refine(
    (data) => {
      if (data.esMenor) {
        return data.apoderadoCorreo === data.apoderadoConfirmacionCorreo;
      }
      return true;
    },
    { message: "Los correos del apoderado no coinciden", path: ["apoderadoConfirmacionCorreo"] }
  )
  .refine(
    (data) => {
      if (data.esMenor) {
        return !!data.apoderadoTelefono && data.apoderadoTelefono.length >= 6;
      }
      return true;
    },
    { message: "Ingrese un teléfono válido del apoderado", path: ["apoderadoTelefono"] }
  );

type ReclamoFormData = z.infer<typeof reclamoSchema>;

/* ─────────────────────── REUSABLE SELECT ─────────────────────── */

interface SelectFieldProps {
  label: string;
  id: string;
  value: string;
  onChange: (val: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  error?: string;
  required?: boolean;
}

const SelectField = ({
  label,
  id,
  value,
  onChange,
  options,
  placeholder = "Seleccione...",
  error,
  required,
}: SelectFieldProps) => (
  <div className="space-y-1.5">
    <label htmlFor={id} className="text-sm font-semibold text-slate-700">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-4 py-2.5 rounded-xl border transition-all outline-none text-sm appearance-none cursor-pointer
          bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 focus:border-primary
         
          ${error ? "border-red-500 focus:ring-red-500/20 focus:border-red-500" : ""}
        `}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown
        size={16}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
      />
    </div>
    {error && (
      <p className="text-xs font-medium text-red-500 flex items-center gap-1">
        <AlertCircle size={12} /> {error}
      </p>
    )}
  </div>
);

/* ─────────────────────── INPUT FIELD ─────────────────────── */

interface FormInputProps {
  label: string;
  id: string;
  type?: string;
  placeholder?: string;
  error?: string;
  required?: boolean;
  registration: ReturnType<ReturnType<typeof useForm>["register"]>;
}

const FormInput = ({ label, id, type = "text", placeholder, error, required, registration }: FormInputProps) => (
  <div className="space-y-1.5">
    <label htmlFor={id} className="text-sm font-semibold text-slate-700">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      id={id}
      type={type}
      placeholder={placeholder}
      {...registration}
      className={`w-full px-4 py-2.5 rounded-xl border transition-all outline-none text-sm
        bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 focus:border-primary
       
        ${error ? "border-red-500 focus:ring-red-500/20 focus:border-red-500" : ""}
      `}
    />
    {error && (
      <p className="text-xs font-medium text-red-500 flex items-center gap-1">
        <AlertCircle size={12} /> {error}
      </p>
    )}
  </div>
);

/* ─────────────────────── SECTION HEADER ─────────────────────── */

interface SectionHeaderProps {
  icon: React.ReactNode;
  title: string;
  step: number;
}

const SectionHeader = ({ icon, title, step }: SectionHeaderProps) => (
  <div className="flex items-center gap-3 mb-6">
    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary shrink-0">
      {icon}
    </div>
    <div>
      <span className="text-xs font-bold text-primary/60 uppercase tracking-wider">Paso {step}</span>
      <h2 className="text-lg font-bold text-slate-800">{title}</h2>
    </div>
  </div>
);

/* ─────────────────────── MAIN COMPONENT ─────────────────────── */

export const LibroReclamaciones = () => {
  const [archivoAdjunto, setArchivoAdjunto] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ReclamoFormData>({
    resolver: zodResolver(reclamoSchema),
    defaultValues: {
      tipoDocumento: "",
      numeroDocumento: "",
      primerNombre: "",
      segundoNombre: "",
      primerApellido: "",
      segundoApellido: "",
      direccion: "",
      departamento: "",
      provincia: "",
      distrito: "",
      correo: "",
      confirmacionCorreo: "",
      telefono: "",
      esMenor: false,
      apoderadoTipoDocumento: "",
      apoderadoNumeroDocumento: "",
      apoderadoPrimerNombre: "",
      apoderadoSegundoNombre: "",
      apoderadoPrimerApellido: "",
      apoderadoSegundoApellido: "",
      apoderadoCorreo: "",
      apoderadoConfirmacionCorreo: "",
      apoderadoTelefono: "",
      numeroOrden: "",
      montoReclamado: "",
      nombreProducto: "",
      tipoReclamo: undefined,
      resumen: "",
      detallePedido: "",
    },
  });

  const esMenor = watch("esMenor");
  const departamentoSeleccionado = watch("departamento");
  const provinciaSeleccionada = watch("provincia");
  const tipoReclamo = watch("tipoReclamo");

  // Cascading select logic
  const provinciasDisponibles = useMemo(() => {
    const dep = DEPARTAMENTOS_PERU.find((d) => d.nombre === departamentoSeleccionado);
    return dep?.provincias ?? [];
  }, [departamentoSeleccionado]);

  const distritosDisponibles = useMemo(() => {
    const prov = provinciasDisponibles.find((p) => p.nombre === provinciaSeleccionada);
    return prov?.distritos ?? [];
  }, [provinciasDisponibles, provinciaSeleccionada]);

  // Reset cascading when parent changes
  const handleDepartamentoChange = (val: string) => {
    setValue("departamento", val);
    setValue("provincia", "");
    setValue("distrito", "");
  };

  const handleProvinciaChange = (val: string) => {
    setValue("provincia", val);
    setValue("distrito", "");
  };

  // File handling
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        Swal.fire({
          icon: "warning",
          title: "Archivo muy grande",
          text: "El archivo no debe superar los 5 MB.",
          confirmButtonColor: "#1ea59c",
        });
        return;
      }
      setArchivoAdjunto(file);
    }
  };

  const removeFile = () => {
    setArchivoAdjunto(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Fecha actual formateada
  const fechaActual = new Date().toLocaleDateString("es-PE", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Submit handler
  const onSubmit: SubmitHandler<ReclamoFormData> = async (data) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();

      // Append all form fields as a JSON blob
      const payload = {
        ...data,
        fechaRegistro: new Date().toISOString(),
      };
      formData.append("reclamo", new Blob([JSON.stringify(payload)], { type: "application/json" }));

      // Append file if exists
      if (archivoAdjunto) {
        formData.append("archivo", archivoAdjunto);
      }

      const response = await api.post("/reclamos", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const pdfUrl = response.data?.pdfReclamoUrl;

      await Swal.fire({
        icon: "success",
        title: "¡Reclamo registrado!",
        html: `
          <p class="text-slate-600 mb-2">Su ${data.tipoReclamo === "RECLAMO" ? "reclamo" : "queja"} ha sido registrado exitosamente.</p>
          <p class="text-sm text-slate-500 mb-4">Se ha enviado una copia a su correo: <strong>${data.correo}</strong></p>
          ${pdfUrl ? `
            <div class="mt-4 pt-4 border-t border-slate-100">
              <a href="${pdfUrl}" target="_blank" rel="noopener noreferrer" class="inline-block bg-[#1ea59c] text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-[#198f87] transition-colors" style="text-decoration: none;">
                Ver y Descargar Hoja de Reclamación
              </a>
            </div>
          ` : ""}
        `,
        confirmButtonColor: "#64748b",
        confirmButtonText: "Cerrar",
      });

      reset();
      setArchivoAdjunto(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.error(error);
      await Swal.fire({
        icon: "error",
        title: "Error al enviar",
        text: "No se pudo registrar su reclamo. Por favor intente nuevamente o comuníquese con nosotros.",
        confirmButtonColor: "#1ea59c",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#f6f8f8] min-h-screen transition-colors duration-300">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 via-transparent to-primary/5" />
        <div className="max-w-5xl mx-auto px-4 pt-28 pb-12 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-6">
            <FileText size={16} />
            Libro de Reclamaciones Virtual
          </div>
          <h1 className="text-3xl md:text-5xl font-bold mb-4 text-secondary tracking-tight">
            Libro de <span className="text-primary">Reclamaciones</span>
          </h1>
          <p className="text-base md:text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
            Conforme al Código de Protección y Defensa del Consumidor del Perú.
            Complete el formulario a continuación para registrar su reclamo o queja.
          </p>

          {/* Fecha actual */}
          <div className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white shadow-soft border border-slate-100">
            <Info size={16} className="text-primary" />
            <span className="text-sm font-medium text-slate-600">
              Fecha de registro:{" "}
              <span className="text-slate-800 font-bold capitalize">{fechaActual}</span>
            </span>
          </div>
        </div>
      </section>

      {/* Form */}
      <section className="max-w-5xl mx-auto px-4 pb-20">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* ═══════ SECCIÓN 1: DATOS DEL RECLAMANTE ═══════ */}
          <div className="bg-white rounded-2xl shadow-soft border border-slate-100 p-6 md:p-8">
            <SectionHeader icon={<User size={20} />} title="Datos de la persona que presenta el reclamo" step={1} />

            <div className="grid md:grid-cols-2 gap-5">
              <SelectField
                label="Tipo de documento"
                id="tipo-documento"
                value={watch("tipoDocumento")}
                onChange={(val) => setValue("tipoDocumento", val, { shouldValidate: true })}
                options={TIPOS_DOCUMENTO.map((t) => ({ value: t.value, label: t.label }))}
                placeholder="Seleccione tipo..."
                error={errors.tipoDocumento?.message}
                required
              />

              <FormInput
                label="Número de documento"
                id="numero-documento"
                placeholder="Ej. 12345678"
                error={errors.numeroDocumento?.message}
                required
                registration={register("numeroDocumento")}
              />

              <FormInput
                label="Primer nombre"
                id="primer-nombre"
                placeholder="Ej. Juan"
                error={errors.primerNombre?.message}
                required
                registration={register("primerNombre")}
              />

              <FormInput
                label="Segundo nombre"
                id="segundo-nombre"
                placeholder="Ej. Carlos"
                registration={register("segundoNombre")}
              />

              <FormInput
                label="Primer apellido"
                id="primer-apellido"
                placeholder="Ej. Pérez"
                error={errors.primerApellido?.message}
                required
                registration={register("primerApellido")}
              />

              <FormInput
                label="Segundo apellido"
                id="segundo-apellido"
                placeholder="Ej. García"
                registration={register("segundoApellido")}
              />

              <div className="md:col-span-2">
                <FormInput
                  label="Dirección"
                  id="direccion"
                  placeholder="Ej. Av. Principal 123, Dpto. 4B"
                  error={errors.direccion?.message}
                  required
                  registration={register("direccion")}
                />
              </div>

              <SelectField
                label="Departamento"
                id="departamento"
                value={departamentoSeleccionado}
                onChange={handleDepartamentoChange}
                options={DEPARTAMENTOS_PERU.map((d) => ({ value: d.nombre, label: d.nombre }))}
                placeholder="Seleccione departamento..."
                error={errors.departamento?.message}
                required
              />

              <SelectField
                label="Provincia"
                id="provincia"
                value={provinciaSeleccionada}
                onChange={handleProvinciaChange}
                options={provinciasDisponibles.map((p) => ({ value: p.nombre, label: p.nombre }))}
                placeholder={departamentoSeleccionado ? "Seleccione provincia..." : "Seleccione departamento primero"}
                error={errors.provincia?.message}
                required
              />

              <SelectField
                label="Distrito"
                id="distrito"
                value={watch("distrito")}
                onChange={(val) => setValue("distrito", val, { shouldValidate: true })}
                options={distritosDisponibles.map((d) => ({ value: d.nombre, label: d.nombre }))}
                placeholder={provinciaSeleccionada ? "Seleccione distrito..." : "Seleccione provincia primero"}
                error={errors.distrito?.message}
                required
              />

              <FormInput
                label="Correo electrónico"
                id="correo"
                type="email"
                placeholder="correo@ejemplo.com"
                error={errors.correo?.message}
                required
                registration={register("correo")}
              />

              <FormInput
                label="Confirmación de correo"
                id="confirmacion-correo"
                type="email"
                placeholder="Repita su correo"
                error={errors.confirmacionCorreo?.message}
                required
                registration={register("confirmacionCorreo")}
              />

              <FormInput
                label="Teléfono"
                id="telefono"
                type="tel"
                placeholder="Ej. 987654321"
                error={errors.telefono?.message}
                required
                registration={register("telefono")}
              />
            </div>

            {/* Checkbox menor de edad */}
            <div className="mt-6 flex items-center gap-3">
              <input
                id="es-menor"
                type="checkbox"
                {...register("esMenor")}
                className="w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary/30 cursor-pointer accent-primary"
              />
              <label htmlFor="es-menor" className="text-sm font-medium text-slate-700 cursor-pointer select-none">
                Soy menor de edad
              </label>
            </div>
          </div>

          {/* ═══════ SECCIÓN 2: DATOS DEL APODERADO (CONDICIONAL) ═══════ */}
          {esMenor && (
            <div className="bg-white rounded-2xl shadow-soft border border-amber-200 p-6 md:p-8 animate-in fade-in slide-in-from-top-2 duration-300">
              <SectionHeader icon={<ShieldCheck size={20} />} title="Datos del apoderado" step={2} />

              <div className="bg-amber-50 rounded-xl p-4 mb-6 flex items-start gap-3">
                <AlertCircle size={18} className="text-amber-500 mt-0.5 shrink-0" />
                <p className="text-sm text-amber-700">
                  Al ser menor de edad, es obligatorio proporcionar los datos de su apoderado o representante legal.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                <SelectField
                  label="Tipo de documento"
                  id="apoderado-tipo-documento"
                  value={watch("apoderadoTipoDocumento") || ""}
                  onChange={(val) => setValue("apoderadoTipoDocumento", val, { shouldValidate: true })}
                  options={TIPOS_DOCUMENTO.map((t) => ({ value: t.value, label: t.label }))}
                  placeholder="Seleccione tipo..."
                  error={errors.apoderadoTipoDocumento?.message}
                  required
                />

                <FormInput
                  label="Número de documento"
                  id="apoderado-numero-documento"
                  placeholder="Ej. 12345678"
                  error={errors.apoderadoNumeroDocumento?.message}
                  required
                  registration={register("apoderadoNumeroDocumento")}
                />

                <FormInput
                  label="Primer nombre"
                  id="apoderado-primer-nombre"
                  placeholder="Ej. María"
                  error={errors.apoderadoPrimerNombre?.message}
                  required
                  registration={register("apoderadoPrimerNombre")}
                />

                <FormInput
                  label="Segundo nombre"
                  id="apoderado-segundo-nombre"
                  placeholder="Ej. Elena"
                  registration={register("apoderadoSegundoNombre")}
                />

                <FormInput
                  label="Primer apellido"
                  id="apoderado-primer-apellido"
                  placeholder="Ej. López"
                  error={errors.apoderadoPrimerApellido?.message}
                  required
                  registration={register("apoderadoPrimerApellido")}
                />

                <FormInput
                  label="Segundo apellido"
                  id="apoderado-segundo-apellido"
                  placeholder="Ej. Torres"
                  registration={register("apoderadoSegundoApellido")}
                />

                <FormInput
                  label="Correo electrónico"
                  id="apoderado-correo"
                  type="email"
                  placeholder="correo@ejemplo.com"
                  error={errors.apoderadoCorreo?.message}
                  required
                  registration={register("apoderadoCorreo")}
                />

                <FormInput
                  label="Confirmación de correo"
                  id="apoderado-confirmacion-correo"
                  type="email"
                  placeholder="Repita el correo"
                  error={errors.apoderadoConfirmacionCorreo?.message}
                  required
                  registration={register("apoderadoConfirmacionCorreo")}
                />

                <FormInput
                  label="Teléfono"
                  id="apoderado-telefono"
                  type="tel"
                  placeholder="Ej. 987654321"
                  error={errors.apoderadoTelefono?.message}
                  required
                  registration={register("apoderadoTelefono")}
                />
              </div>
            </div>
          )}

          {/* ═══════ SECCIÓN 3: INFORMACIÓN GENERAL ═══════ */}
          <div className="bg-white rounded-2xl shadow-soft border border-slate-100 p-6 md:p-8">
            <SectionHeader icon={<ShoppingBag size={20} />} title="Información general" step={esMenor ? 3 : 2} />

            <div className="grid md:grid-cols-3 gap-5">
              <FormInput
                label="N° de orden de compra"
                id="numero-orden"
                placeholder="Ej. ORD-0001"
                registration={register("numeroOrden")}
              />

              <FormInput
                label="Monto reclamado (S/)"
                id="monto-reclamado"
                type="number"
                placeholder="Ej. 150.00"
                registration={register("montoReclamado")}
              />

              <FormInput
                label="Nombre del producto"
                id="nombre-producto"
                placeholder="Ej. Consulta veterinaria"
                registration={register("nombreProducto")}
              />
            </div>
          </div>

          {/* ═══════ SECCIÓN 4: DETALLE DEL RECLAMO ═══════ */}
          <div className="bg-white rounded-2xl shadow-soft border border-slate-100 p-6 md:p-8">
            <SectionHeader
              icon={<ClipboardList size={20} />}
              title="Detalle del reclamo"
              step={esMenor ? 4 : 3}
            />

            {/* Tipo: Reclamo o Queja */}
            <div className="mb-6">
              <label className="text-sm font-semibold text-slate-700 mb-3 block">
                Tipo <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-col sm:flex-row gap-4">
                <label
                  htmlFor="tipo-reclamo"
                  className={`flex-1 flex items-center gap-3 px-5 py-4 rounded-xl border-2 cursor-pointer transition-all select-none
                    ${tipoReclamo === "RECLAMO"
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-slate-200 hover:border-slate-300"
                    }
                  `}
                >
                  <input
                    type="radio"
                    id="tipo-reclamo"
                    value="RECLAMO"
                    {...register("tipoReclamo")}
                    className="w-5 h-5 text-primary accent-primary"
                  />
                  <div>
                    <span className="font-bold text-slate-800">Reclamo</span>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Disconformidad con los productos o servicios adquiridos.
                    </p>
                  </div>
                </label>

                <label
                  htmlFor="tipo-queja"
                  className={`flex-1 flex items-center gap-3 px-5 py-4 rounded-xl border-2 cursor-pointer transition-all select-none
                    ${tipoReclamo === "QUEJA"
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-slate-200 hover:border-slate-300"
                    }
                  `}
                >
                  <input
                    type="radio"
                    id="tipo-queja"
                    value="QUEJA"
                    {...register("tipoReclamo")}
                    className="w-5 h-5 text-primary accent-primary"
                  />
                  <div>
                    <span className="font-bold text-slate-800">Queja</span>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Malestar o descontento respecto a la atención recibida.
                    </p>
                  </div>
                </label>
              </div>
              {errors.tipoReclamo && (
                <p className="text-xs font-medium text-red-500 mt-2 flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.tipoReclamo.message}
                </p>
              )}
            </div>

            {/* Resumen */}
            <div className="space-y-1.5 mb-5">
              <label htmlFor="resumen" className="text-sm font-semibold text-slate-700">
                Resumen del reclamo o queja <span className="text-red-500">*</span>
              </label>
              <input
                id="resumen"
                type="text"
                placeholder="Breve descripción del motivo de su reclamo o queja"
                {...register("resumen")}
                className={`w-full px-4 py-2.5 rounded-xl border transition-all outline-none text-sm
                  bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 focus:border-primary
                 
                  ${errors.resumen ? "border-red-500" : ""}
                `}
              />
              {errors.resumen && (
                <p className="text-xs font-medium text-red-500 flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.resumen.message}
                </p>
              )}
            </div>

            {/* Detalle */}
            <div className="space-y-1.5 mb-6">
              <label htmlFor="detalle-pedido" className="text-sm font-semibold text-slate-700">
                Detalle del pedido <span className="text-red-500">*</span>
              </label>
              <textarea
                id="detalle-pedido"
                rows={5}
                placeholder="Describa detalladamente su reclamo o queja, incluyendo fechas, montos, y cualquier información relevante..."
                {...register("detallePedido")}
                className={`w-full px-4 py-3 rounded-xl border transition-all outline-none text-sm resize-none
                  bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 focus:border-primary
                 
                  ${errors.detallePedido ? "border-red-500" : ""}
                `}
              />
              {errors.detallePedido && (
                <p className="text-xs font-medium text-red-500 flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.detallePedido.message}
                </p>
              )}
            </div>

            {/* Archivo adjunto */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">
                Adjuntar archivo (opcional)
              </label>
              <div
                className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer
                  hover:border-primary/40 hover:bg-primary/5
                  ${archivoAdjunto ? "border-primary/30 bg-primary/5" : "border-slate-200"}
                `}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  onChange={handleFileChange}
                />
                {archivoAdjunto ? (
                  <div className="flex items-center justify-center gap-3">
                    <CheckCircle2 size={20} className="text-primary" />
                    <span className="text-sm font-medium text-slate-700">
                      {archivoAdjunto.name}
                    </span>
                    <span className="text-xs text-slate-400">
                      ({(archivoAdjunto.size / 1024).toFixed(0)} KB)
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile();
                      }}
                      className="ml-2 p-1 rounded-full hover:bg-red-100 text-red-500 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Upload size={28} className="text-slate-400" />
                    <p className="text-sm text-slate-500">
                      Haga clic para seleccionar un archivo
                    </p>
                    <p className="text-xs text-slate-400">PDF, JPG, PNG, DOC (máx. 5 MB)</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ═══════ BOTÓN ENVIAR ═══════ */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-10 py-4 bg-primary hover:bg-[#198f87] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all flex items-center gap-3 shadow-lg shadow-primary/20 cursor-pointer group"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-0.5 transition-transform" />
                  Enviar reclamo
                </>
              )}
            </button>
          </div>
        </form>

        {/* ═══════ DISCLAIMER LEGAL ═══════ */}
        <div className="mt-12 px-6 py-5 bg-slate-50/50 rounded-xl border border-slate-100">
          <p className="text-[11px] leading-relaxed text-slate-400">
            SUPERINKA.COM E.I.R.L., con RUC N.° 20606677074, con domicilio en Calle Ramón Zavala N.° 790, Urb. Las Moreras, distrito de La Perla, provincia y departamento del Callao, es el titular del banco de datos personales de Quejas y Reclamos. SUPERINKA.COM E.I.R.L. declara que el tratamiento de sus datos personales en este portal tiene por finalidad gestionar de manera adecuada su reclamo o queja conforme a las disposiciones legales vigentes, así como llevar un registro histórico de los casos presentados con el objetivo de mejorar la calidad de atención. La formulación del reclamo no impide acudir a otras vías de solución de controversias ni constituye requisito previo para interponer una denuncia ante el INDECOPI. El proveedor deberá brindar respuesta al reclamo en un plazo no mayor de quince (15) días hábiles improrrogables. Esta cuenta de correo es utilizada únicamente para el envío de constancias de recepción de reclamos, no siendo un medio para la recepción de los mismos; por lo que se solicita no remitir mensajes a dicha cuenta.
          </p>
        </div>
      </section>
    </div>
  );
};

export default LibroReclamaciones;
