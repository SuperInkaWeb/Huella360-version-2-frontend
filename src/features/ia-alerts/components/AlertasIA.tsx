import { useState } from "react";
import { iaAlertsService } from "../services/iaAlertsService";
import type { HealthAlert } from "../types/ia-alerts.types";
import { Button } from "../../../components/ui/Button";
import { AlertTriangle, Info, CheckCircle, Loader2, Sparkles } from "lucide-react";
import toast from "react-hot-toast";

interface AlertasIAProps {
  mascotaId: number;
  mascotaNombre: string;
}

const getSeverityIcon = (severidad: string) => {
  switch (severidad) {
    case "ALTA":
      return <AlertTriangle className="text-red-500" size={20} />;
    case "MEDIA":
      return <Info className="text-yellow-500" size={20} />;
    default:
      return <CheckCircle className="text-green-500" size={20} />;
  }
};

const getSeverityColor = (severidad: string) => {
  switch (severidad) {
    case "ALTA":
      return "border-red-200 bg-red-50";
    case "MEDIA":
      return "border-yellow-200 bg-yellow-50";
    default:
      return "border-green-200 bg-green-50";
  }
};

export const AlertasIA = ({ mascotaId, mascotaNombre }: AlertasIAProps) => {
  const [alertas, setAlertas] = useState<HealthAlert[]>([]);
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);

  const handleGenerateAlerts = async () => {
    setLoading(true);
    try {
      const response = await iaAlertsService.generateHealthAlerts(mascotaId);
      setAlertas(response.alertas);
      setGenerated(true);
      toast.success(`Se generaron ${response.alertasGeneradas} alertas de salud`);
    } catch (error) {
      console.error("Error generating alerts:", error);
      toast.error("No se pudieron generar las alertas de IA");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-slate-100">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
          <Sparkles className="text-purple-600" size={24} />
        </div>
        <div>
          <h3 className="font-semibold text-slate-800">Alertas de Salud IA</h3>
          <p className="text-sm text-slate-500">Análisis predictivo con inteligencia artificial</p>
        </div>
      </div>

      <p className="text-sm text-slate-600 mb-4">
        La IA analizará el historial médico de <strong>{mascotaNombre}</strong> y generará alertas preventivas
        sobre vacunas, desparasitaciones, peso y seguimiento.
      </p>

      {!generated ? (
        <Button
          onClick={handleGenerateAlerts}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Analizando historial...
            </>
          ) : (
            <>
              <Sparkles size={16} />
              Generar Alertas IA
            </>
          )}
        </Button>
      ) : (
        <div className="space-y-3">
          {alertas.length === 0 ? (
            <p className="text-center text-slate-500 py-4">
              No se encontraron alertas en este momento
            </p>
          ) : (
            alertas.map((alerta, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-lg border ${getSeverityColor(alerta.severidad)}`}
              >
                <div className="flex items-start gap-3">
                  {getSeverityIcon(alerta.severidad)}
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-800">{alerta.titulo}</h4>
                    <p className="text-sm text-slate-600 mt-1">{alerta.descripcion}</p>
                    <p className="text-sm text-primary mt-2 font-medium">
                      Recomendación: {alerta.recomendacion}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}

          <Button
            variant="outline"
            onClick={handleGenerateAlerts}
            disabled={loading}
            className="w-full mt-4"
          >
            Regenerar Alertas
          </Button>
        </div>
      )}
    </div>
  );
};
