import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, UserPlus, Check, Mail, Briefcase } from "lucide-react";
import { Button } from "../../../../components/ui/Button";
import { staffService } from "../services/staffService";
import Swal from "sweetalert2";

/* ── Validation Schema ─────────────────────────────────────── */

const inviteSchema = z.object({
    emailVeterinario: z
        .string()
        .min(1, "El email es obligatorio")
        .email("Ingresa un email válido"),
    rolInterno: z
        .string()
        .min(2, "El rol debe tener al menos 2 caracteres"),
});

type InviteFormData = z.infer<typeof inviteSchema>;

/* ── Props ──────────────────────────────────────────────────── */

interface InviteStaffModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

/* ── Component ──────────────────────────────────────────────── */

export const InviteStaffModal = ({ isOpen, onClose, onSuccess }: InviteStaffModalProps) => {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<InviteFormData>({
        resolver: zodResolver(inviteSchema),
        defaultValues: { emailVeterinario: "", rolInterno: "" },
    });

    const onSubmit = async (data: InviteFormData) => {
        try {
            await staffService.inviteStaff(data);
            Swal.fire("¡Invitación enviada!", "El veterinario recibirá la invitación para unirse a tu equipo.", "success");
            reset();
            onSuccess();
            onClose();
        } catch (error: any) {
            const msg = error.response?.data?.message || "No se pudo enviar la invitación";
            Swal.fire("Error", msg, "error");
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4">
            <div className="bg-white w-full max-w-lg rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden max-h-[95vh] sm:max-h-[90vh] flex flex-col transition-all duration-300">
                {/* Header */}
                <div className="p-4 sm:p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg text-primary shrink-0">
                            <UserPlus size={22} />
                        </div>
                        <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                            Invitar Veterinario
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="overflow-y-auto p-4 sm:p-6 space-y-5 scrollbar-thin">
                    <p className="text-sm text-slate-500">
                        Ingresa el correo electrónico de un veterinario registrado en la plataforma para invitarlo a tu equipo.
                    </p>

                    {/* Email */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                            <Mail size={14} className="text-slate-400" />
                            Email del Veterinario
                        </label>
                        <input
                            {...register("emailVeterinario")}
                            type="email"
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white transition-all focus:ring-2 focus:ring-primary/20 outline-none"
                            placeholder="veterinario@email.com"
                        />
                        {errors.emailVeterinario && (
                            <p className="text-xs text-red-500">{errors.emailVeterinario.message}</p>
                        )}
                    </div>

                    {/* Rol Interno */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                            <Briefcase size={14} className="text-slate-400" />
                            Rol Interno
                        </label>
                        <input
                            {...register("rolInterno")}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white transition-all focus:ring-2 focus:ring-primary/20 outline-none"
                            placeholder="Ej: Cirujano, Dermatólogo, Consultor General"
                        />
                        {errors.rolInterno && (
                            <p className="text-xs text-red-500">{errors.rolInterno.message}</p>
                        )}
                    </div>
                </form>

                {/* Footer */}
                <div className="p-4 sm:p-6 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row justify-end gap-3">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        type="button"
                        className="w-full sm:w-auto order-2 sm:order-1"
                    >
                        Cancelar
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleSubmit(onSubmit)}
                        disabled={isSubmitting}
                        className="w-full sm:w-auto gap-2 order-1 sm:order-2 rounded-xl py-2.5"
                    >
                        {isSubmitting ? (
                            <span className="flex items-center gap-2">
                                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Enviando...
                            </span>
                        ) : (
                            <>
                                <Check size={20} />
                                <span>Enviar Invitación</span>
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
};
