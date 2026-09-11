import { Loader2, Check, ChevronRight } from "lucide-react";

interface WizardStep {
  label: string;
  icon: React.ElementType;
}

interface WizardLayoutProps {
  steps: WizardStep[];
  currentStep: number;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  onBack?: () => void;
  onNext?: () => void;
  onSubmit?: () => void;
  isSubmitting?: boolean;
  isLastStep?: boolean;
  nextLabel?: string;
  loadingMessage?: string;
  isLoading?: boolean;
}

export const WizardLayout = ({
  steps,
  currentStep,
  title,
  subtitle,
  children,
  onBack,
  onNext,
  onSubmit,
  isSubmitting = false,
  isLastStep = false,
  nextLabel,
  loadingMessage = "Verificando perfil...",
  isLoading = false,
}: WizardLayoutProps) => {
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex flex-col items-center justify-center p-6">
        <Loader2 size={36} className="animate-spin text-[#1ea59c] mb-4" />
        <p className="text-slate-500 text-sm font-medium">{loadingMessage}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex flex-col">
      {/* Header */}
      <div className="pt-10 pb-6 text-center">
        <img
          src="/LOGO HUELLA360_logo primario.png"
          alt="Huella360"
          className="h-9 w-auto object-contain mx-auto mb-4"
        />
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-1">{title}</h1>
        {subtitle && <p className="text-slate-500 text-sm">{subtitle}</p>}
      </div>

      {/* Step Indicator */}
      <div className="max-w-lg mx-auto w-full px-6 mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const StepIcon = step.icon;
            const isCompleted = index < currentStep;
            const isCurrent = index === currentStep;

            return (
              <div key={index} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isCompleted
                        ? "bg-[#1ea59c] text-white"
                        : isCurrent
                          ? "bg-[#1ea59c] text-white ring-4 ring-[#1ea59c]/20"
                          : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    {isCompleted ? <Check size={18} strokeWidth={3} /> : <StepIcon size={18} />}
                  </div>
                  <span
                    className={`text-[11px] mt-1.5 font-medium hidden sm:block ${
                      isCurrent ? "text-[#1ea59c]" : isCompleted ? "text-slate-600" : "text-slate-400"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className="flex-1 mx-2 sm:mx-3">
                    <div
                      className={`h-0.5 rounded-full transition-all duration-500 ${
                        isCompleted ? "bg-[#1ea59c]" : "bg-slate-200"
                      }`}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Content Card */}
      <div className="flex-1 flex items-start justify-center px-4 pb-10">
        <div className="w-full max-w-lg">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 sm:p-8">{children}</div>

            {/* Footer */}
            <div className="px-6 sm:px-8 pb-6 sm:pb-8 flex items-center justify-between gap-3">
              {onBack ? (
                <button
                  type="button"
                  onClick={onBack}
                  className="px-5 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-colors"
                >
                  Atrás
                </button>
              ) : (
                <div />
              )}

              {isLastStep ? (
                <button
                  type="button"
                  onClick={onSubmit}
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-[#1ea59c] hover:bg-[#198f87] text-white text-sm font-bold rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-[#1ea59c]/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Check size={16} />
                  )}
                  {isSubmitting ? "Guardando..." : nextLabel || "Finalizar"}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onNext}
                  className="px-6 py-2.5 bg-[#1ea59c] hover:bg-[#198f87] text-white text-sm font-bold rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-[#1ea59c]/20"
                >
                  Siguiente
                  <ChevronRight size={16} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
