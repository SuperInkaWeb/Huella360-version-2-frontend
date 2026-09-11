import { useState, useEffect } from "react";
import { PawPrint, User, Search, Filter, Eye, Calendar } from "lucide-react";
import { Button } from "../../../../components/ui/Button";
import { patientService, type Patient } from "../services/patientService";
import { MedicalRecordModal } from "../../veterinario/components/MedicalRecordModal";

export const PacientesPage = () => {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const [selectedPatient, setSelectedPatient] = useState<{ id: number; nombre: string } | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchPatients = async () => {
        setIsLoading(true);
        try {
            const data = await patientService.getMyPatients();
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
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-500 text-slate-900 custom-scrollbar">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-xl">
                            <PawPrint className="text-primary" size={28} />
                        </div>
                        Base de Datos de Pacientes
                    </h1>
                    <p className="text-slate-500 font-medium">
                        Historial completo de mascotas atendidas en tu establecimiento.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative group flex-1 md:flex-none">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar por nombre o especie..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-semibold focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none w-full md:w-80 shadow-sm transition-all"
                        />
                    </div>
                    <Button variant="outline" className="h-[46px] w-[46px] p-0 rounded-2xl border-slate-200">
                        <Filter size={20} className="text-slate-500" />
                    </Button>
                </div>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="h-64 bg-white rounded-[2.5rem] border border-slate-100 animate-pulse shadow-sm" />
                    ))}
                </div>
            ) : filteredPatients.length === 0 ? (
                <div className="bg-white rounded-[3rem] p-16 text-center border border-slate-100 shadow-xl shadow-slate-200/50">
                    <div className="w-24 h-24 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-slate-300">
                        <PawPrint size={48} />
                    </div>
                    <h3 className="text-2xl font-black text-slate-900">No se encontraron pacientes</h3>
                    <p className="text-slate-500 mt-2 font-medium max-w-sm mx-auto">
                        Aún no hay registros de mascotas atendidas en tu clínica.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-10">
                    {filteredPatients.map((patient: Patient) => (
                        <div
                            key={patient.id}
                            className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm hover:shadow-2xl hover:shadow-primary/5 hover:border-primary/20 transition-all duration-300 group relative overflow-hidden"
                        >
                            {/* Decorative Background Icon */}
                            <PawPrint className="absolute -right-6 -bottom-6 text-slate-50 group-hover:text-primary/5 transition-colors duration-500" size={160} />

                            <div className="relative z-10">
                                <div className="flex items-start justify-between mb-6">
                                    <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-orange-500 flex items-center justify-center text-white shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform duration-300">
                                        <PawPrint size={32} />
                                    </div>
                                    <div className="text-right">
                                        <span className="text-[10px] font-black px-3 py-1 rounded-full bg-slate-100 text-slate-500 uppercase tracking-widest border border-slate-200">
                                            Paciente #{patient.id}
                                        </span>
                                    </div>
                                </div>

                                <h3 className="text-2xl font-black text-slate-900 group-hover:text-primary transition-colors">
                                    {patient.nombre}
                                </h3>

                                <div className="mt-2 flex items-center gap-3">
                                    <span className="text-sm font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-lg">
                                        {patient.especie || "Desconocido"}
                                    </span>
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary/30"></span>
                                    <span className="text-sm font-medium text-slate-500">
                                        {patient.raza || "Mestizo"}
                                    </span>
                                </div>

                                <div className="mt-8 pt-6 border-t border-slate-100 space-y-3">
                                    <div className="flex items-center gap-3 text-sm text-slate-600 font-semibold">
                                        <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500">
                                            <User size={16} />
                                        </div>
                                        <span>Edad: <span className="text-slate-900 font-black">{calculateAge(patient.fechaNacimiento)} años</span></span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-slate-600 font-semibold">
                                        <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center text-purple-500">
                                            <Calendar size={16} />
                                        </div>
                                        <span>Registrado: <span className="text-slate-900 font-black">{new Date(patient.createdAt).toLocaleDateString()}</span></span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleOpenMedicalRecord(patient)}
                                    className="mt-8 w-full h-14 rounded-2xl bg-slate-900 text-white font-black text-xs uppercase tracking-widest hover:bg-primary transition-all duration-300 flex items-center justify-center gap-3 shadow-xl shadow-slate-900/10 hover:shadow-primary/30 active:scale-[0.98]"
                                >
                                    <Eye size={18} /> Ver Historia Clínica
                                </button>
                            </div>
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
