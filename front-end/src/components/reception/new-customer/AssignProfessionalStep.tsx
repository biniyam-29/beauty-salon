// import React from "react";
// import { Loader2, User, Stethoscope, Mail, Phone, Users, Clock } from "lucide-react";
// import type { StepProps } from "../../../lib/types/patientRegistrationTypes";
// import { cn } from "./patientRegistrationComponents";

// export const AssignProfessionalStep: React.FC<StepProps> = ({
//   formData,
//   updateFormData,
//   professionals,
//   isLoading,
// }) => (
//   <div className="space-y-4">
//     <h3 className="text-lg font-bold text-gray-800">Assign a Doctor / Professional</h3>
//     <p className="text-gray-600 text-sm">
//       Select a professional who will be primarily responsible for this client's care.
//     </p>
    
//     {isLoading ? (
//       <div className="flex items-center justify-center py-8">
//         <div className="flex items-center gap-2 text-gray-500">
//           <Loader2 size={20} className="animate-spin" />
//           Loading professionals...
//         </div>
//       </div>
//     ) : (
//       <div className="grid grid-cols-1 gap-4">
//         {professionals.map((prof) => (
//           <label
//             key={prof.id}
//             className={cn(
//               "flex items-start gap-4 border-2 rounded-xl p-5 cursor-pointer transition-all duration-200 hover:border-rose-300 hover:shadow-md",
//               formData.assignedProfessionalId === String(prof.id)
//                 ? "border-rose-500 bg-rose-50 shadow-sm"
//                 : "border-gray-200 bg-white"
//             )}
//           >
//             <input
//               type="radio"
//               name="professional"
//               value={String(prof.id)}
//               checked={formData.assignedProfessionalId === String(prof.id)}
//               onChange={() =>
//                 updateFormData({ assignedProfessionalId: String(prof.id) })
//               }
//               className="mt-1 text-rose-600 focus:ring-rose-500"
//             />
//             <div className="flex-1">
//               <div className="flex items-start justify-between">
//                 <div className="flex items-center gap-3 mb-3">
//                   <div className="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center">
//                     <User size={20} className="text-rose-600" />
//                   </div>
//                   <div>
//                     <div className="font-bold text-lg text-gray-800">{prof.name}</div>
//                     <div className="text-sm text-gray-600 flex items-center gap-1">
//                       <Stethoscope size={14} />
//                       {prof.role || "Doctor"}
//                     </div>
//                   </div>
//                 </div>
//                 {formData.assignedProfessionalId === String(prof.id) && (
//                   <div className="bg-rose-500 text-white px-3 py-1 rounded-full text-xs font-medium">
//                     Selected
//                   </div>
//                 )}
//               </div>
              
//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
//                 <div className="flex items-center gap-2 text-sm">
//                   <Mail size={16} className="text-gray-400" />
//                   <span className="text-gray-700">{prof.email}</span>
//                 </div>
//                 <div className="flex items-center gap-2 text-sm">
//                   <Phone size={16} className="text-gray-400" />
//                   <span className="text-gray-700">{prof.phone || "Not provided"}</span>
//                 </div>
//                 <div className="flex items-center gap-2 text-sm">
//                   <Users size={16} className="text-gray-400" />
//                   <span className="text-gray-700">
//                     {prof.assigned_patients_count} total patients
//                   </span>
//                 </div>
//                 <div className="flex items-center gap-2 text-sm">
//                   <Clock size={16} className="text-gray-400" />
//                   <span className="text-gray-700">
//                     {prof.todays_followups_count} today's follow-ups
//                   </span>
//                 </div>
//               </div>
              
//               <div className="flex flex-wrap gap-2 mt-3">
//                 <div className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs">
//                   {prof.untreated_assigned_patients_count} untreated patients
//                 </div>
//                 {prof.skills && prof.skills.length > 0 && (
//                   <div className="bg-green-50 text-green-700 px-2 py-1 rounded text-xs">
//                     {prof.skills.length} specialties
//                   </div>
//                 )}
//               </div>
//             </div>
//           </label>
//         ))}
//       </div>
//     )}
//   </div>
// );