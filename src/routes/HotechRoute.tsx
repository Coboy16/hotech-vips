// // src/routes/HotechRoute.tsx
// import React from "react";
// import { Navigate } from "react-router-dom";
// import { useAuth } from "../features/auth/contexts/AuthContext";

// interface HotechRouteProps {
//   children: React.ReactNode;
// }

// export const HotechRoute: React.FC<HotechRouteProps> = ({ children }) => {
//   const { user, isLoading, isAuthenticated } = useAuth();

//   // Mientras se verifica la autenticación, mostrar indicador de carga
//   if (isLoading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen bg-gray-100">
//         <div className="p-4 bg-white rounded shadow-md">
//           <div className="flex items-center space-x-2">
//             <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
//             <span>Cargando...</span>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // Si no está autenticado, redirigir al login
//   if (!isAuthenticated) {
//     return <Navigate to="/login" replace />;
//   }

//   // Verificar si es admin de HoTech
//   if (!user?.is_admin_hotech) {
//     // Si no es admin de HoTech, redirigir al dashboard
//     return <Navigate to="/dashboard" replace />;
//   }

//   // Si es admin de HoTech, mostrar la vista
//   return <>{children}</>;
// };

// export default HotechRoute;
