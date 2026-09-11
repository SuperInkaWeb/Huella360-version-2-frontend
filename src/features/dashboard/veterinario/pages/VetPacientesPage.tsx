import { useState, useEffect } from "react";
import { PawPrint, User, Search, Filter, Eye, Calendar } from "lucide-react";
import { Button } from "../../../../components/ui/Button";
import { vetService } from "../services/vetService";
import { MedicalRecordModal } from "../components/MedicalRecordModal";

interface Patient {
 id: number;
 nombre: string;
 especie: string;
 raza: string;
 sexo?: string;
 fechaNacimiento: string;
 pesoKg: number;
 fotoUrl?: string;
 esterilizado: boolean;
 observacionesMedicas?: string;
 createdAt: string;
}

export const VetPacientesPage = () => {
 const [patients, setPatients] = useState<Patient[]>([]);
 const [isLoading, setIsLoading] = useState(true);
 const [searchTerm, setSearchTerm] = useState("");

 const [selectedPatient, setSelectedPatient] = useState<{ id: number; nombre: string } | null>(null);
 const [isModalOpen, setIsModalOpen] = useState(false);

 const fetchPatients = async () => {
 setIsLoading(true);
 try {
 const data = await vetService.getMyPatients();
 setPatients(data);
 } catch (error) {
 console.error("Error fetching patients:", error);
 } finally {
 setIsLoading(false);
 }
 };

 useEffect(() => {
 fetchPatients();
 }, []);

 const handleOpenMedicalRecord = (patient: Patient) => {
 setSelectedPatient({ id: patient.id, nombre: patient.nombre });
 setIsModalOpen(true);
 };

 const filteredPatients = patients.filter((p: Patient) =>
 p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
 (p.especie && p.especie.toLowerCase().includes(searchTerm.toLowerCase()))
 );

 const calculateAge = (dob: string) => {
 if (!dob) return "N/A";
 const birthDate = new Date(dob);
 const today = new Date();
 let age = today.getFullYear() - birthDate.getFullYear();
 const m = today.getMonth() - birthDate.getMonth();
 if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
 age--;
 }
 return age;
 };

 return (
 <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 custom-scrollbar text-slate-900 ">
 <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
 <div>
 <h1 className="text-2xl font-bold flex items-center gap-2">
 <PawPrint className="text-teal-500" /> Mis Pacientes
 </h1>
 <p className="text-sm text-slate-500 mt-1">Base de datos de mascotas atendidas.</p>
 </div>
 <div className="flex gap-2">
 <div className="relative">
 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
 <input
 type="text"
 placeholder="Buscar paciente, mascota..."
 value={searchTerm}
 onChange={(e) => setSearchTerm(e.target.value)}
 className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 outline-none w-full md:w-64"
 />
 </div>
 <Button variant="outline" className="h-10 px-3">
 <Filter size={18} />
 </Button>
 </div>
 </div>

 {isLoading ? (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
 {[1, 2, 3].map(i => (
 <div key={i} className="h-48 bg-white rounded-2xl border border-slate-100 animate-pulse" />
 ))}
 </div>
 ) : filteredPatients.length === 0 ? (
 <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm">
 <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-300">
 <PawPrint size={32} />
 </div>
 <h3 className="text-lg font-bold">No se encontraron pacientes</h3>
 <p className="text-sm text-slate-500 mt-1">Intenta con otro término de búsqueda.</p>
 </div>
 ) : (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
 {filteredPatients.map((patient: Patient) => (
 <div
 key={patient.id}
 className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:border-teal-500/30 transition-all group"
 >
 <div className="flex items-start justify-between mb-4">
 <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white shadow-lg shadow-teal-500/20">
 <PawPrint size={28} />
 </div>
 <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-slate-100 text-slate-500 uppercase tracking-wider">
 ID: {patient.id}
 </span>
 </div>

 <h3 className="text-lg font-bold group-hover:text-teal-600 transition-colors">
 {patient.nombre}
 </h3>
 <div className="mt-1 flex items-center gap-2 text-sm text-slate-500 ">
 <span className="font-medium text-slate-700 ">{patient.especie || "Desconocido"}</span>
 <span className="w-1 h-1 rounded-full bg-slate-300"></span>
 <span>{patient.raza || "Mestizo"}</span>
 </div>

 <div className="mt-4 pt-4 border-t border-slate-50 space-y-2">
 <div className="flex items-center gap-2 text-xs text-slate-500">
 <User size={14} className="text-teal-500" />
 <span className="font-medium text-slate-700 ">Edad:</span> {calculateAge(patient.fechaNacimiento)} años
 </div>
 <div className="flex items-center gap-2 text-xs text-slate-500">
 <Calendar size={14} className="text-teal-500" />
 <span className="font-medium text-slate-700 ">Registrado el:</span> {new Date(patient.createdAt).toLocaleDateString()}
 </div>
 </div>

 <button
 onClick={() => handleOpenMedicalRecord(patient)}
 className="mt-5 w-full h-10 rounded-xl bg-slate-50 hover:bg-teal-500 hover:text-white text-slate-600 text-xs font-bold transition-all flex items-center justify-center gap-2"
 >
 <Eye size={14} /> Ver Historia Clínica
 </button>
 </div>
 ))}
 </div>
 )}

 {selectedPatient && (
 <MedicalRecordModal
 isOpen={isModalOpen}
 onClose={() => setIsModalOpen(false)}
 patientId={selectedPatient.id}
 patientName={selectedPatient.nombre}
 />
 )}
 </div>
 );
};
