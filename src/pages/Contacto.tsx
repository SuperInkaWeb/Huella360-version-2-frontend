import { useState } from "react";
import { Mail, MessageSquare, Send, Loader2, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";

export const Contacto = () => {
  const [form, setForm] = useState({ nombre: "", email: "", asunto: "Dueño de Mascota", mensaje: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nombre.trim() || !form.email.trim() || !form.mensaje.trim()) {
      toast.error("Completa todos los campos");
      return;
    }
    setSending(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:8080"}/contacto`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setSent(true);
        toast.success("Mensaje enviado correctamente");
      } else {
        toast.error("Error al enviar el mensaje");
      }
    } catch {
      toast.error("No se pudo conectar al servidor");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-[#f6f8f8] min-h-screen transition-colors duration-300">
      {/* 1. Hero Section de Contacto */}
      <section className="max-w-7xl mx-auto px-4 pt-24 pb-16 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 text-[#2D3E82] tracking-tight">
          Estamos aquí para <span className="text-[#1ea59c]">ayudarte</span>
        </h1>
        <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Ya seas un veterinario buscando optimizar su clínica o un dueño de mascota con dudas, 
          nuestro equipo de Huella360 está listo para escucharte.
        </p>
      </section>

      <section className="max-w-7xl mx-auto px-4 pb-24">
        <div className="grid lg:grid-cols-3 gap-12">
          
          {/* 2. Columna de Información (Izquierda) */}
          <div className="lg:col-span-1 space-y-8">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-[#2D3E82]">Canales directos</h2>
              
              {/* Tarjeta Email */}
              <div className="flex items-start gap-4 p-6 bg-white rounded-xl shadow-soft border border-slate-100">
                <div className="w-12 h-12 bg-[#1ea59c]/10 rounded-lg flex items-center justify-center text-[#1ea59c] shrink-0">
                  <Mail size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-[#0d131b]">Ventas y Soporte</h3>
                  <a href="mailto:hola@huella360.com" className="text-[#1ea59c] hover:underline font-medium">
                    hola@huella360.com
                  </a>
                  <p className="text-sm text-slate-500 mt-1">Respuesta en menos de 24h.</p>
                </div>
              </div>

              {/* Tarjeta WhatsApp/Chat */}
              <div className="flex items-start gap-4 p-6 bg-white rounded-xl shadow-soft border border-slate-100">
                <div className="w-12 h-12 bg-[#2D3E82]/10 rounded-lg flex items-center justify-center text-[#2D3E82] shrink-0">
                  <MessageSquare size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-[#0d131b]">Chat en vivo</h3>
                  <p className="text-slate-600">Lunes a Viernes</p>
                  <p className="text-slate-600 text-sm">9:00 AM - 6:00 PM</p>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Formulario de Contacto (Derecha) */}
          <div className="lg:col-span-2">
            {sent ? (
              <div className="bg-white p-10 rounded-2xl shadow-soft border border-slate-100 text-center space-y-4">
                <CheckCircle2 size={48} className="text-[#1ea59c] mx-auto" />
                <h3 className="text-xl font-bold text-[#2D3E82]">¡Mensaje enviado!</h3>
                <p className="text-slate-600">Nos pondremos en contacto contigo pronto.</p>
                <button
                  onClick={() => { setSent(false); setForm({ nombre: "", email: "", asunto: "Dueño de Mascota", mensaje: "" }); }}
                  className="text-[#1ea59c] hover:underline font-medium"
                >
                  Enviar otro mensaje
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-white p-8 md:p-10 rounded-2xl shadow-soft border border-slate-100 space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-[#2D3E82]">Nombre completo</label>
                    <input 
                      type="text" 
                      name="nombre"
                      value={form.nombre}
                      onChange={handleChange}
                      placeholder="Ej. Juan Pérez"
                      className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-[#1ea59c] outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-[#2D3E82]">Correo electrónico</label>
                    <input 
                      type="email" 
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="juan@ejemplo.com"
                      className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-[#1ea59c] outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[#2D3E82]">¿En qué perfil estás interesado?</label>
                  <select 
                    name="asunto"
                    value={form.asunto}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-[#1ea59c] outline-none transition-all appearance-none"
                  >
                    <option>Dueño de Mascota</option>
                    <option>Veterinario / Clínica</option>
                    <option>Negocio / Proveedor</option>
                    <option>Otro</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[#2D3E82]">Tu mensaje</label>
                  <textarea 
                    name="mensaje"
                    value={form.mensaje}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Cuéntanos cómo podemos ayudarte..."
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-[#1ea59c] outline-none transition-all resize-none"
                  ></textarea>
                </div>

                <button 
                  type="submit"
                  disabled={sending}
                  className="w-full md:w-max px-10 py-4 bg-[#1ea59c] hover:bg-[#198f87] text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2 group shadow-lg shadow-[#1ea59c]/20 disabled:opacity-50"
                >
                  {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />}
                  {sending ? "Enviando..." : "Enviar mensaje"}
                </button>
              </form>
            )}
          </div>

        </div>
      </section>
    </div>
  );
};
