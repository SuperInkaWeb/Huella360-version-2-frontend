import { useState } from 'react';
import { Star, MessageSquare, Package, Truck, X } from 'lucide-react';

interface RatingModalProps {
 isOpen: boolean;
 onClose: () => void;
 onSubmit: (data: {
 calificacionRepartidor: number;
 comentarioRepartidor: string;
 calificacionProducto: number;
 comentarioProducto: string;
 }) => Promise<void>;
 repartidorNombre?: string;
}

export const RatingModal = ({ isOpen, onClose, onSubmit, repartidorNombre }: RatingModalProps) => {
 const [calRepartidor, setCalRepartidor] = useState(0);
 const [comRepartidor, setComRepartidor] = useState('');
 const [calProducto, setCalProducto] = useState(0);
 const [comProducto, setComProducto] = useState('');
 const [isSubmitting, setIsSubmitting] = useState(false);

 if (!isOpen) return null;

 const handleSubmit = async () => {
 if (calRepartidor === 0 || calProducto === 0) return;
 
 setIsSubmitting(true);
 try {
 await onSubmit({
 calificacionRepartidor: calRepartidor,
 comentarioRepartidor: comRepartidor,
 calificacionProducto: calProducto,
 comentarioProducto: comProducto
 });
 onClose();
 } catch (error) {
 console.error("Error submitting rating:", error);
 } finally {
 setIsSubmitting(false);
 }
 };

 const StarRating = ({ value, onChange, label }: { value: number, onChange: (v: number) => void, label: string }) => (
 <div className="flex flex-col items-center gap-2">
 <p className="text-sm font-medium text-gray-600 ">{label}</p>
 <div className="flex gap-1">
 {[1, 2, 3, 4, 5].map((star) => (
 <button
 key={star}
 onClick={() => onChange(star)}
 className={`transition-all duration-200 transform hover:scale-110 ${
 star <= value ? 'text-amber-400' : 'text-gray-300 '
 }`}
 >
 <Star size={32} fill={star <= value ? 'currentColor' : 'none'} />
 </button>
 ))}
 </div>
 </div>
 );

 return (
 <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
 <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg border border-white/20 overflow-hidden animate-in zoom-in-95 duration-300">
 {/* Header */}
 <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-primary/5 to-transparent">
 <div className="flex items-center gap-3">
 <div className="p-2 bg-primary/10 rounded-xl text-primary">
 <Star className="w-5 h-5" />
 </div>
 <h2 className="text-xl font-bold text-gray-900 ">Califica tu experiencia</h2>
 </div>
 <button onClick={onClose} className="p-2 hover:bg-gray-100 :bg-gray-800 rounded-full transition-colors">
 <X className="w-5 h-5 text-gray-400" />
 </button>
 </div>

 <div className="p-8 space-y-8 overflow-y-auto max-h-[70vh]">
 {/* Seccion Repartidor */}
 <div className="space-y-4">
 <div className="flex items-center gap-2 mb-2">
 <Truck size={18} className="text-primary" />
 <span className="font-bold text-gray-800 ">El Repartidor{repartidorNombre ? `: ${repartidorNombre}` : ''}</span>
 </div>
 <StarRating 
 value={calRepartidor} 
 onChange={setCalRepartidor} 
 label="¿Qué tal fue el trato y la puntualidad?"
 />
 <div className="relative">
 <MessageSquare className="absolute top-3 left-3 w-4 h-4 text-gray-400" />
 <textarea
 value={comRepartidor}
 onChange={(e) => setComRepartidor(e.target.value)}
 placeholder="Cuéntanos un poco más sobre el servicio..."
 className="w-full pl-10 pr-4 py-3 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-primary/20 transition-all min-h-[80px] resize-none"
 />
 </div>
 </div>

 <div className="h-px bg-gray-100 " />

 {/* Seccion Producto */}
 <div className="space-y-4">
 <div className="flex items-center gap-2 mb-2">
 <Package size={18} className="text-indigo-500" />
 <span className="font-bold text-gray-800 ">Tus Productos</span>
 </div>
 <StarRating 
 value={calProducto} 
 onChange={setCalProducto} 
 label="¿Los productos llegaron en buen estado?"
 />
 <div className="relative">
 <MessageSquare className="absolute top-3 left-3 w-4 h-4 text-gray-400" />
 <textarea
 value={comProducto}
 onChange={(e) => setComProducto(e.target.value)}
 placeholder="¿Algún comentario sobre la calidad de lo recibido?"
 className="w-full pl-10 pr-4 py-3 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500/20 transition-all min-h-[80px] resize-none"
 />
 </div>
 </div>
 </div>

 {/* Footer */}
 <div className="p-6 bg-gray-50 flex gap-3">
 <button
 onClick={onClose}
 className="flex-1 px-6 py-4 rounded-2xl font-bold text-gray-500 hover:bg-gray-100 :bg-gray-800 transition-all"
 >
 Omitir por ahora
 </button>
 <button
 onClick={handleSubmit}
 disabled={calRepartidor === 0 || calProducto === 0 || isSubmitting}
 className={`flex-1 px-6 py-4 rounded-2xl font-bold text-white shadow-lg shadow-primary/20 transition-all transform active:scale-95 flex items-center justify-center gap-2
 ${calRepartidor === 0 || calProducto === 0 || isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary hover:bg-primary-dark'}
 `}
 >
 {isSubmitting ? (
 <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
 ) : (
 'Enviar Calificación'
 )}
 </button>
 </div>
 </div>
 </div>
 );
};
