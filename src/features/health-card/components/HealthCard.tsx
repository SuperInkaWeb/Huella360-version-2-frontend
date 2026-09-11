import { useState } from "react";
import { healthCardService } from "../services/healthCardService";
import { Button } from "../../../components/ui/Button";
import { Download, FileText, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

interface HealthCardProps {
  mascotaId: number;
  mascotaNombre: string;
}

export const HealthCard = ({ mascotaId, mascotaNombre }: HealthCardProps) => {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const blob = await healthCardService.downloadHealthCard(mascotaId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `carnet-salud-${mascotaNombre.toLowerCase().replace(/\s+/g, "-")}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Carnet de salud descargado correctamente");
    } catch (error) {
      console.error("Error downloading health card:", error);
      toast.error("No se pudo descargar el carnet de salud");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-slate-100">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
          <FileText className="text-primary" size={24} />
        </div>
        <div>
          <h3 className="font-semibold text-slate-800">Carnet Digital de Salud</h3>
          <p className="text-sm text-slate-500">PDF compartible con historial médico</p>
        </div>
      </div>

      <p className="text-sm text-slate-600 mb-4">
        Descarga el carnet de salud de <strong>{mascotaNombre}</strong> con su historial médico reciente.
        Puedes compartirlo con el veterinario de tu confianza.
      </p>

      <Button
        onClick={handleDownload}
        disabled={downloading}
        className="w-full flex items-center justify-center gap-2"
      >
        {downloading ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Generando PDF...
          </>
        ) : (
          <>
            <Download size={16} />
            Descargar Carnet
          </>
        )}
      </Button>
    </div>
  );
};
