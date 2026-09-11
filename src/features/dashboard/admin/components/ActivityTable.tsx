const activities = [
 {
 id: 1,
 name: "Clínica San José",
 role: "Empresa",
 action: "Suscripción Premium",
 date: "Hoy, 10:24 AM",
 status: "Completado",
 iconColor: "text-[#1ea59c]",
 iconBg: "bg-[#1ea59c]/10"
 },
 {
 id: 2,
 name: "Dr. Carlos Ruiz",
 role: "Veterinario",
 action: "Carga de Título",
 date: "Ayer, 18:45 PM",
 status: "Pendiente",
 iconColor: "text-[#2D3E82]",
 iconBg: "bg-[#2D3E82]/10"
 },
 {
 id: 3,
 name: "María Garcia",
 role: "Cliente",
 action: "Registro Nuevo",
 date: "Ayer, 14:20 PM",
 status: "Completado",
 iconColor: "text-[#1ea59c]",
 iconBg: "bg-[#1ea59c]/10"
 }
];

export const ActivityTable = () => {
 return (
 <div className="w-full">
 <table className="min-w-full">
 <thead>
 <tr className="border-b border-gray-100/50 ">
 <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
 Usuario / Entidad
 </th>
 <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
 Acción REALIZADA
 </th>
 <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
 Estado
 </th>
 <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
 Fecha
 </th>
 </tr>
 </thead>
 <tbody className="divide-y divide-gray-100/50 ">
 {activities.map((activity) => (
 <tr key={activity.id} className="group hover:bg-[#1ea59c]/5 :bg-[#1ea59c]/5 transition-colors duration-300">
 <td className="px-6 py-5 whitespace-nowrap">
 <div className="flex items-center">
 <div className={`h-10 w-10 rounded-xl ${activity.iconBg} ${activity.iconColor} flex items-center justify-center font-bold text-sm shadow-sm group-hover:scale-110 transition-transform duration-500`}>
 {activity.name.charAt(0)}
 </div>
 <div className="ml-4">
 <div className="text-sm font-black text-[#2D3E82] ">
 {activity.name}
 </div>
 <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
 {activity.role}
 </div>
 </div>
 </div>
 </td>
 <td className="px-6 py-5 whitespace-nowrap">
 <p className="text-sm font-medium text-gray-600 ">
 {activity.action}
 </p>
 </td>
 <td className="px-6 py-5 whitespace-nowrap">
 <span
 className={`px-3 py-1 inline-flex text-[10px] font-black uppercase tracking-tighter rounded-full ${activity.status === "Completado"
 ? "bg-[#1ea59c]/10 text-[#1ea59c] border border-[#1ea59c]/20"
 : "bg-amber-100/50 text-amber-600 border border-amber-200/50"
 }`}
 >
 {activity.status}
 </span>
 </td>
 <td className="px-6 py-5 whitespace-nowrap text-sm font-medium text-gray-400 group-hover:text-gray-500 transition-colors">
 {activity.date}
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 );
};
