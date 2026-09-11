import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Building2,
  Phone,
  Mail,
  MapPin,
  UploadCloud,
  X,
  Check,
  FileText,
  Globe,
  ImageIcon,
} from "lucide-react";
import { WizardLayout } from "../../../../components/ui/WizardLayout";
import { profileService } from "../../services/profileService";
import { useAuth } from "../../../auth/context/useAuth";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const MAX_FILE_SIZE = 1 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

const empresaSchema = z.object({
  nombreComercial: z.string().min(2, "El nombre comercial es requerido"),
  razonSocial: z.string().min(2, "La razón social es requerida"),
  ruc: z
    .string()
    .length(11, "El RUC debe tener exactamente 11 dígitos")
    .regex(/^\d+$/, "El RUC solo debe contener números"),
  tipoServicio: z.string().min(2, "Selecciona un tipo de servicio"),
  tipoServicioOtro: z.string().optional(),
  telefono: z
    .string()
    .min(6, "El teléfono debe tener al menos 6 dígitos")
    .regex(/^\d+$/, "Solo debe contener números"),
  emailContacto: z.string().email("Correo inválido"),
  direccion: z.string().min(5, "La dirección es requerida"),
  ciudad: z.string().min(2, "La ciudad es requerida"),
  descripcion: z.string().optional(),
});

type EmpresaFormData = z.infer<typeof empresaSchema>;

const TIPOS_SERVICIO = ["VETERINARIA", "PETSHOP", "GROOMING", "HIBRIDO", "OTRO"];

const STEPS = [
  { label: "Datos legales", icon: FileText },
  { label: "Perfil público", icon: Building2 },
  { label: "Imágenes", icon: ImageIcon },
  { label: "Listo", icon: Check },
];

export const EmpresaProfilePage = () => {
  const { setPerfilCompleto, setEmpresaId } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const logoRef = useRef<HTMLInputElement>(null);
  const bannerRef = useRef<HTMLInputElement>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    formState: { errors },
  } = useForm<EmpresaFormData>({
    resolver: zodResolver(empresaSchema),
  });

  const tipoServicio = watch("tipoServicio");

  useEffect(() => {
    profileService
      .getEmpresaProfile()
      .then(() => {
        setPerfilCompleto(true);
        navigate("/portal/empresa", { replace: true });
      })
      .catch(() => setIsLoading(false));
  }, [navigate, setPerfilCompleto]);

  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "logo" | "banner"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!ACCEPTED_TYPES.includes(file.type)) {
      Swal.fire("Formato no soportado", "Usa JPG, PNG o WEBP", "warning");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      Swal.fire("Archivo muy grande", "El archivo no debe superar 1MB", "warning");
      return;
    }
    const preview = URL.createObjectURL(file);
    if (type === "logo") {
      setLogoFile(file);
      setLogoPreview(preview);
    } else {
      setBannerFile(file);
      setBannerPreview(preview);
    }
  };

  const removeImage = (type: "logo" | "banner") => {
    if (type === "logo") {
      setLogoFile(null);
      setLogoPreview(null);
      if (logoRef.current) logoRef.current.value = "";
    } else {
      setBannerFile(null);
      setBannerPreview(null);
      if (bannerRef.current) bannerRef.current.value = "";
    }
  };

  const handleNext = async () => {
    let valid = false;
    if (step === 0) {
      valid = await trigger(["razonSocial", "ruc"]);
    } else if (step === 1) {
      valid = await trigger([
        "nombreComercial",
        "tipoServicio",
        "telefono",
        "emailContacto",
        "direccion",
        "ciudad",
      ]);
    } else if (step === 2) {
      valid = true;
    }
    if (valid) setStep((s) => s + 1);
  };

  const handleBack = () => setStep((s) => s - 1);

  const onSubmit = async (data: EmpresaFormData) => {
    setIsSubmitting(true);
    try {
      const finalData = {
        ...data,
        tipoServicioOtro:
          data.tipoServicio === "OTRO" ? data.tipoServicioOtro : undefined,
      };
      const response = await profileService.createEmpresaProfile(finalData, logoFile || undefined, bannerFile || undefined);
      const empresaId = response.data?.id;
      if (empresaId) {
        setEmpresaId(empresaId);
      }
      setPerfilCompleto(true);
      Swal.fire({
        icon: "success",
        title: "¡Empresa activada!",
        text: "Tu negocio ya está en Huella360.",
        timer: 2000,
        showConfirmButton: false,
        position: "top-end",
        toast: true,
      });
      setTimeout(() => navigate("/portal/empresa", { replace: true }), 1500);
    } catch (err: any) {
      const validationErrors = err?.response?.data?.validationErrors;
      if (validationErrors && Object.keys(validationErrors).length > 0) {
        const html = Object.entries(validationErrors)
          .map(([field, msg]) => `<p class="text-sm text-slate-600">• <strong>${field}:</strong> ${msg}</p>`)
          .join("");
        Swal.fire({
          icon: "error",
          title: "Revisa los campos",
          html,
          confirmButtonColor: "#1ea59c",
        });
      } else {
        const msg =
          err?.response?.data?.message || "Error al guardar el perfil. Inténtalo de nuevo.";
        Swal.fire({
          icon: "error",
          title: "Error",
          html: `<p class="text-sm text-slate-600">${msg}</p>`,
          confirmButtonColor: "#1ea59c",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <WizardLayout
      steps={STEPS}
      currentStep={step}
      title="Activa tu empresa"
      subtitle="Configura el perfil de tu negocio en la plataforma"
      onBack={step > 0 ? handleBack : undefined}
      onNext={step < 3 ? handleNext : undefined}
      onSubmit={step === 3 ? handleSubmit(onSubmit) : undefined}
      isSubmitting={isSubmitting}
      isLastStep={step === 3}
      nextLabel="Activar Empresa"
      isLoading={isLoading}
    >
      {/* Step 0: Datos Legales */}
      {step === 0 && (
        <div className="space-y-5">
          <div>
            <h2 className="text-lg font-bold text-slate-900 mb-1">Información legal</h2>
            <p className="text-sm text-slate-500">Datos fiscal y razón social de tu empresa.</p>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Razón Social</label>
              <input
                {...register("razonSocial")}
                placeholder="Ej: Mi Empresa S.A.C."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:ring-2 focus:ring-[#1ea59c]/20 focus:border-[#1ea59c] outline-none transition-all"
              />
              {errors.razonSocial && <p className="text-xs text-red-500 mt-1">{errors.razonSocial.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">RUC / NIT</label>
              <input
                {...register("ruc")}
                placeholder="Ej: 20606677074"
                maxLength={11}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:ring-2 focus:ring-[#1ea59c]/20 focus:border-[#1ea59c] outline-none transition-all"
              />
              {errors.ruc && <p className="text-xs text-red-500 mt-1">{errors.ruc.message}</p>}
            </div>
          </div>
        </div>
      )}

      {/* Step 1: Perfil Público */}
      {step === 1 && (
        <div className="space-y-5">
          <div>
            <h2 className="text-lg font-bold text-slate-900 mb-1">Perfil público</h2>
            <p className="text-sm text-slate-500">Información que verán los clientes.</p>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nombre Comercial</label>
              <div className="relative">
                <Building2 size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  {...register("nombreComercial")}
                  placeholder="Nombre que ven los clientes"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:ring-2 focus:ring-[#1ea59c]/20 focus:border-[#1ea59c] outline-none transition-all"
                />
              </div>
              {errors.nombreComercial && <p className="text-xs text-red-500 mt-1">{errors.nombreComercial.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Tipo de Servicio</label>
              <select
                {...register("tipoServicio")}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:ring-2 focus:ring-[#1ea59c]/20 focus:border-[#1ea59c] outline-none transition-all appearance-none"
              >
                <option value="">Seleccionar...</option>
                {TIPOS_SERVICIO.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              {errors.tipoServicio && <p className="text-xs text-red-500 mt-1">{errors.tipoServicio.message}</p>}
            </div>

            {tipoServicio === "OTRO" && (
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Especifique</label>
                <input
                  {...register("tipoServicioOtro")}
                  placeholder="Describa su tipo de servicio"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:ring-2 focus:ring-[#1ea59c]/20 focus:border-[#1ea59c] outline-none transition-all"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Teléfono</label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    {...register("telefono")}
                    type="tel"
                    placeholder="Ej: 999888777"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:ring-2 focus:ring-[#1ea59c]/20 focus:border-[#1ea59c] outline-none transition-all"
                  />
                </div>
                {errors.telefono && <p className="text-xs text-red-500 mt-1">{errors.telefono.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email de Contacto</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    {...register("emailContacto")}
                    type="email"
                    placeholder="contacto@empresa.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:ring-2 focus:ring-[#1ea59c]/20 focus:border-[#1ea59c] outline-none transition-all"
                  />
                </div>
                {errors.emailContacto && <p className="text-xs text-red-500 mt-1">{errors.emailContacto.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Ciudad</label>
                <div className="relative">
                  <Globe size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    {...register("ciudad")}
                    placeholder="Ej: Lima"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:ring-2 focus:ring-[#1ea59c]/20 focus:border-[#1ea59c] outline-none transition-all"
                  />
                </div>
                {errors.ciudad && <p className="text-xs text-red-500 mt-1">{errors.ciudad.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Dirección</label>
                <div className="relative">
                  <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    {...register("direccion")}
                    placeholder="Calle, número"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:ring-2 focus:ring-[#1ea59c]/20 focus:border-[#1ea59c] outline-none transition-all"
                  />
                </div>
                {errors.direccion && <p className="text-xs text-red-500 mt-1">{errors.direccion.message}</p>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Imágenes */}
      {step === 2 && (
        <div className="space-y-5">
          <div>
            <h2 className="text-lg font-bold text-slate-900 mb-1">Imágenes de marca</h2>
            <p className="text-sm text-slate-500">Sube el logo y portada de tu negocio.</p>
          </div>

          {/* Logo */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Logo</label>
            <input
              ref={logoRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => handleImageChange(e, "logo")}
            />
            {logoPreview ? (
              <div className="relative inline-block">
                <img src={logoPreview} alt="Logo" className="w-24 h-24 object-cover rounded-xl border border-slate-200" />
                <button
                  type="button"
                  onClick={() => removeImage("logo")}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                >
                  <X size={12} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => logoRef.current?.click()}
                className="w-full border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-[#1ea59c] hover:bg-[#1ea59c]/5 transition-all"
              >
                <UploadCloud size={24} className="mx-auto text-slate-400 mb-2" />
                <p className="text-sm text-slate-500">Click para subir logo</p>
                <p className="text-xs text-slate-400">JPG, PNG o WEBP, máximo 1MB</p>
              </button>
            )}
          </div>

          {/* Banner */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Banner / Portada</label>
            <input
              ref={bannerRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => handleImageChange(e, "banner")}
            />
            {bannerPreview ? (
              <div className="relative inline-block">
                <img src={bannerPreview} alt="Banner" className="w-full h-32 object-cover rounded-xl border border-slate-200" />
                <button
                  type="button"
                  onClick={() => removeImage("banner")}
                  className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                >
                  <X size={12} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => bannerRef.current?.click()}
                className="w-full border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:border-[#1ea59c] hover:bg-[#1ea59c]/5 transition-all"
              >
                <UploadCloud size={24} className="mx-auto text-slate-400 mb-2" />
                <p className="text-sm text-slate-500">Click para subir portada</p>
                <p className="text-xs text-slate-400">JPG, PNG o WEBP, máximo 1MB</p>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Step 3: Listo */}
      {step === 3 && (
        <div className="text-center py-6">
          <div className="w-16 h-16 bg-[#1ea59c]/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check size={32} className="text-[#1ea59c]" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">¡Empresa lista!</h2>
          <p className="text-sm text-slate-500 max-w-xs mx-auto">
            Todo está configurado. Haz clic en "Activar Empresa" para que tu negocio aparezca en Huella360.
          </p>
        </div>
      )}
    </WizardLayout>
  );
};
