import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { User, Phone, Truck, Camera, X, Check } from "lucide-react";
import { WizardLayout } from "../../../../components/ui/WizardLayout";
import { profileService } from "../../services/profileService";
import { useAuth } from "../../../auth/context/useAuth";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const repartidorSchema = z.object({
  nombres: z.string().min(2, "Los nombres deben tener al menos 2 caracteres"),
  apellidos: z.string().min(2, "Los apellidos deben tener al menos 2 caracteres"),
  telefono: z
    .string()
    .min(6, "El teléfono debe tener al menos 6 dígitos")
    .regex(/^\d+$/, "Solo debe contener números"),
  tipoVehiculo: z.string().min(2, "Selecciona un tipo de vehículo"),
  placaVehiculo: z.string().optional(),
});

const REQUIEREN_PLACA = ["MOTO", "AUTO"];

type RepartidorFormData = z.infer<typeof repartidorSchema>;

const VEHICULOS = [
  { value: "MOTO", label: "Motocicleta" },
  { value: "BICICLETA", label: "Bicicleta" },
  { value: "AUTO", label: "Automóvil" },
  { value: "A_PIE", label: "A pie" },
];

const STEPS = [
  { label: "Datos personales", icon: User },
  { label: "Vehículo", icon: Truck },
  { label: "Listo", icon: Check },
];

export const RepartidorProfilePage = () => {
  const { setPerfilCompleto } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RepartidorFormData>({
    resolver: zodResolver(repartidorSchema),
  });

  const tipoVehiculo = watch("tipoVehiculo");

  useEffect(() => {
    profileService
      .getRepartidorProfile()
      .then(() => {
        setPerfilCompleto(true);
        navigate("/portal/repartidor", { replace: true });
      })
      .catch(() => setIsLoading(false));
  }, [navigate, setPerfilCompleto]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      Swal.fire("Archivo muy grande", "La foto no debe superar 2MB", "warning");
      return;
    }
    setFotoFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setFotoFile(null);
    setPreviewUrl(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleNext = async () => {
    let valid = false;
    if (step === 0) {
      valid = await trigger(["nombres", "apellidos", "telefono"]);
    } else if (step === 1) {
      if (REQUIEREN_PLACA.includes(tipoVehiculo)) {
        valid = await trigger(["tipoVehiculo", "placaVehiculo"]);
      } else {
        setValue("placaVehiculo", "N/A");
        valid = await trigger(["tipoVehiculo"]);
      }
    }
    if (valid) setStep((s) => s + 1);
  };

  const handleBack = () => setStep((s) => s - 1);

  const onSubmit = async (data: RepartidorFormData) => {
    setIsSubmitting(true);
    try {
      await profileService.createRepartidorProfile(data, fotoFile || undefined);
      setPerfilCompleto(true);
      Swal.fire({
        icon: "success",
        title: "¡Registro completado!",
        text: "Tu cuenta será verificada por el equipo administrativo.",
        timer: 2500,
        showConfirmButton: false,
        position: "top-end",
        toast: true,
      });
      setTimeout(() => navigate("/portal/repartidor", { replace: true }), 2000);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || "Error al guardar el perfil. Inténtalo de nuevo.";
      Swal.fire({
        icon: "error",
        title: "Error",
        html: `<p class="text-sm text-slate-600">${msg}</p>`,
        confirmButtonColor: "#1ea59c",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <WizardLayout
      steps={STEPS}
      currentStep={step}
      title="Únete como repartidor"
      subtitle="Configura tu cuenta para comenzar a recibir entregas"
      onBack={step > 0 ? handleBack : undefined}
      onNext={step < 2 ? handleNext : undefined}
      onSubmit={step === 2 ? handleSubmit(onSubmit) : undefined}
      isSubmitting={isSubmitting}
      isLastStep={step === 2}
      nextLabel="Crear mi cuenta"
      isLoading={isLoading}
    >
      {/* Step 0: Datos Personales */}
      {step === 0 && (
        <div className="space-y-5">
          <div>
            <h2 className="text-lg font-bold text-slate-900 mb-1">Datos personales</h2>
            <p className="text-sm text-slate-500">Tu nombre y teléfono de contacto.</p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nombres</label>
                <div className="relative">
                  <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    {...register("nombres")}
                    placeholder="Tus nombres"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:ring-2 focus:ring-[#1ea59c]/20 focus:border-[#1ea59c] outline-none transition-all"
                  />
                </div>
                {errors.nombres && <p className="text-xs text-red-500 mt-1">{errors.nombres.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Apellidos</label>
                <div className="relative">
                  <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    {...register("apellidos")}
                    placeholder="Tus apellidos"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:ring-2 focus:ring-[#1ea59c]/20 focus:border-[#1ea59c] outline-none transition-all"
                  />
                </div>
                {errors.apellidos && <p className="text-xs text-red-500 mt-1">{errors.apellidos.message}</p>}
              </div>
            </div>

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
          </div>
        </div>
      )}

      {/* Step 1: Vehículo */}
      {step === 1 && (
        <div className="space-y-5">
          <div>
            <h2 className="text-lg font-bold text-slate-900 mb-1">Datos del vehículo</h2>
            <p className="text-sm text-slate-500">Selecciona tu medio de transporte.</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Tipo de Vehículo</label>
              <div className="grid grid-cols-2 gap-2">
                {VEHICULOS.map((v) => (
                  <label
                    key={v.value}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer hover:border-[#1ea59c] transition-all has-[:checked]:border-[#1ea59c] has-[:checked]:bg-[#1ea59c]/5 has-[:checked]:text-[#1ea59c]"
                  >
                    <input
                      type="radio"
                      value={v.value}
                      {...register("tipoVehiculo")}
                      className="w-4 h-4 text-[#1ea59c] focus:ring-[#1ea59c]"
                    />
                    <span className="text-sm font-medium">{v.label}</span>
                  </label>
                ))}
              </div>
              {errors.tipoVehiculo && <p className="text-xs text-red-500 mt-1">{errors.tipoVehiculo.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Placa del Vehículo
                {!REQUIEREN_PLACA.includes(tipoVehiculo) && tipoVehiculo && (
                  <span className="text-slate-400 font-normal">(no aplica)</span>
                )}
              </label>
              {REQUIEREN_PLACA.includes(tipoVehiculo) ? (
                <div className="relative">
                  <Truck size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    {...register("placaVehiculo")}
                    placeholder="Ej: ABC-123"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:ring-2 focus:ring-[#1ea59c]/20 focus:border-[#1ea59c] outline-none transition-all"
                  />
                </div>
              ) : (
                <input
                  type="text"
                  disabled
                  value="N/A"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-sm text-slate-400 cursor-not-allowed"
                />
              )}
              {errors.placaVehiculo && <p className="text-xs text-red-500 mt-1">{errors.placaVehiculo.message}</p>}
            </div>

            {/* Foto de perfil */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Foto de perfil <span className="text-slate-400 font-normal">(opcional)</span>
              </label>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
              {previewUrl ? (
                <div className="relative inline-block">
                  <img
                    src={previewUrl}
                    alt="Foto"
                    className="w-24 h-24 object-cover rounded-full border-2 border-slate-200"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-0 right-0 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                  >
                    <X size={12} />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="w-24 h-24 rounded-full border-2 border-dashed border-slate-200 flex flex-col items-center justify-center hover:border-[#1ea59c] hover:bg-[#1ea59c]/5 transition-all"
                >
                  <Camera size={20} className="text-slate-400" />
                  <span className="text-[10px] text-slate-400 mt-1">Subir foto</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Listo */}
      {step === 2 && (
        <div className="text-center py-6">
          <div className="w-16 h-16 bg-[#1ea59c]/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check size={32} className="text-[#1ea59c]" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">¡Casi listo!</h2>
          <p className="text-sm text-slate-500 max-w-xs mx-auto mb-4">
            Haz clic en "Crear mi cuenta" para completar tu registro.
          </p>
          <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2">
            Tu cuenta será verificada por el equipo administrativo antes de recibir solicitudes.
          </p>
        </div>
      )}
    </WizardLayout>
  );
};
