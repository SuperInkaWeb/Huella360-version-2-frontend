import { useState, useEffect } from "react";
import { Share2, Copy, Users, Gift, Check, AlertCircle, Sparkles, UserPlus, Info } from "lucide-react";
import { Button } from "../../../../components/ui/Button";
import { referralService } from "../services/referralService";
import type { ReferralCountResponse } from "../types/referral.types";
import Swal from "sweetalert2";

export const ReferralsPage = () => {
  const [code, setCode] = useState("");
  const [stats, setStats] = useState<ReferralCountResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [referralCode, count] = await Promise.allSettled([
        referralService.getMyCode(),
        referralService.getMyCount(),
      ]);
      if (referralCode.status === "fulfilled") setCode(referralCode.value);
      if (count.status === "fulfilled") setStats(count.value);
      if (referralCode.status === "rejected") {
        setError("No se pudo cargar tu código de referido");
        return;
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || "No se pudieron cargar los datos de referidos";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const referralUrl = code ? `${window.location.origin}/register?ref=${code}` : "";

  const handleCopy = async () => {
    if (!referralUrl) return;
    try {
      await navigator.clipboard.writeText(referralUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      Swal.fire("Error", "No se pudo copiar", "error");
    }
  };

  const handleShare = async () => {
    if (!referralUrl) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Huella360",
          text: "Únete a Huella360 con mi código de referido y obtén beneficios:",
          url: referralUrl,
        });
      } catch {}
    } else {
      handleCopy();
    }
  };

  if (loading) {
    return (
      <div className="flex-1 p-8">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="h-8 bg-slate-100 rounded-lg w-48 animate-pulse" />
          <div className="h-4 bg-slate-100 rounded w-64 animate-pulse" />
          <div className="h-44 bg-slate-100 rounded-2xl animate-pulse" />
          <div className="grid grid-cols-2 gap-4">
            <div className="h-28 bg-slate-100 rounded-2xl animate-pulse" />
            <div className="h-28 bg-slate-100 rounded-2xl animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 p-8">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center max-w-md mx-auto">
          <AlertCircle size={40} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-red-800">Error al cargar referidos</h2>
          <p className="text-red-600 mt-2">{error}</p>
          <Button onClick={loadData} className="mt-4 bg-red-600 text-white hover:bg-red-700">
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  const isUnlocked = stats?.desbloqueo2daMascota ?? false;

  return (
    <div className="flex-1 p-8 animate-in fade-in duration-500">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <div
            className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 ${
              isUnlocked ? "bg-green-100" : "bg-primary/10"
            }`}
          >
            {isUnlocked ? (
              <Sparkles className="text-green-600" size={32} />
            ) : (
              <Gift className="text-primary" size={32} />
            )}
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            {isUnlocked ? "Beneficio desbloqueado" : "Invita amigos y gana beneficios"}
          </h1>
          <p className="text-slate-500 mt-2">
            {isUnlocked
              ? "Ya tienes una 2da mascota gratis por referir a 10 amigos."
              : "Comparte tu codigo, que tus amigos se registren y gana una 2da mascota gratis."}
          </p>
        </div>

        {/* Code Card */}
        <div
          className={`rounded-2xl p-8 text-white text-center ${
            isUnlocked
              ? "bg-gradient-to-br from-green-500 to-emerald-600"
              : "bg-gradient-to-br from-primary to-teal-600"
          }`}
        >
          <p className="text-sm font-medium text-white/70 mb-2">Tu codigo de referido</p>
          <p className="text-3xl font-mono font-bold tracking-wider mb-6">{code}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={handleCopy}
              disabled={!code}
              className="flex items-center gap-2 rounded-lg px-4 py-2.5 font-bold transition-all bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm border border-white/25 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? "Copiado" : "Copiar enlace"}
            </button>
            <button
              onClick={handleShare}
              disabled={!code}
              className="flex items-center gap-2 rounded-lg px-4 py-2.5 font-bold transition-all bg-white text-primary hover:bg-slate-50 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Share2 size={16} /> Compartir
            </button>
          </div>
        </div>

        {/* How it works */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6">
          <h3 className="text-sm font-bold text-slate-900 mb-4">¿Como funciona?</h3>
          <div className="grid grid-cols-3 gap-4">
            {[
              { step: "1", icon: Copy, title: "Comparte", desc: "Envia tu enlace a tus amigos" },
              { step: "2", icon: UserPlus, title: "Se registran", desc: "Tus amigos crean su cuenta" },
              { step: "3", icon: Gift, title: "Gana", desc: "Obten una 2da mascota gratis" },
            ].map(({ step, icon: Icon, title, desc }) => (
              <div key={step} className="text-center">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                  <Icon size={18} className="text-primary" />
                </div>
                <p className="text-xs font-bold text-slate-900">{title}</p>
                <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white border border-slate-100 rounded-2xl p-6 text-center">
              <Users className="mx-auto text-primary mb-2" size={24} />
              <p className="text-3xl font-extrabold text-slate-900">{stats.totalReferidos}</p>
              <p className="text-sm text-slate-500">Amigos referidos</p>
            </div>
            <div
              className={`rounded-2xl p-6 text-center ${
                isUnlocked ? "bg-green-50 border border-green-200" : "bg-white border border-slate-100"
              }`}
            >
              <Gift
                className={`mx-auto mb-2 ${isUnlocked ? "text-green-600" : "text-amber-500"}`}
                size={24}
              />
              <p
                className={`text-3xl font-extrabold ${
                  isUnlocked ? "text-green-700" : "text-slate-900"
                }`}
              >
                {isUnlocked ? "1" : stats.referidosRestantes}
              </p>
              <p className="text-sm text-slate-500">
                {isUnlocked ? "Mascota extra ganada" : "Faltan para la 2da"}
              </p>
            </div>
          </div>
        )}

        {/* Progress */}
        {stats && !isUnlocked && (
          <div className="bg-white border border-slate-100 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-slate-600">Progreso</span>
              <span className="text-sm font-bold text-primary">
                {stats.totalReferidos}/{stats.referidosNecesarios}
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-3">
              <div
                className="bg-primary rounded-full h-3 transition-all duration-500"
                style={{
                  width: `${Math.min(
                    (stats.totalReferidos / stats.referidosNecesarios) * 100,
                    100
                  )}%`,
                }}
              />
            </div>
            <p className="text-sm text-slate-400 mt-3">
              Refiere {stats.referidosRestantes}{" "}
              {stats.referidosRestantes === 1 ? "amigo mas" : "amigos mas"} para desbloquear una
              2da mascota gratis.
            </p>
          </div>
        )}

        {/* Unlocked celebration */}
        {stats && isUnlocked && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
            <Sparkles size={24} className="text-green-600 mx-auto mb-2" />
            <p className="text-sm font-bold text-green-800">
              ¡Ya desbloqueaste tu 2da mascota gratis!
            </p>
            <p className="text-sm text-green-600 mt-1">
              Puedes registrar una mascota adicional en tu portal.
            </p>
          </div>
        )}

        {/* Direct link */}
        <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
          <p className="text-xs text-slate-500 text-center">
            Enlace directo:{" "}
            <span className="font-mono text-xs text-slate-700">
              {window.location.origin}/register?ref={code}
            </span>
          </p>
        </div>

        {/* Info */}
        <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-xl p-4">
          <Info size={16} className="text-blue-500 mt-0.5 shrink-0" />
          <p className="text-xs text-blue-700">
            El referido solo se registra cuando tu amigo crea una cuenta de <strong>cliente</strong>. Si se registra como veterinario o empresa, el código no se contará.
          </p>
        </div>
      </div>
    </div>
  );
};
