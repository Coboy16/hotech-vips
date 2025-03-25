import { 
  BarChart2, 
  Users, 
  Clock, 
  DoorClosed, 
  Settings, 
  Building2, 
  Briefcase, 
  Calendar, 
  Fingerprint, 
  UserCheck, 
  FileText, 
  Mail, 
  Utensils 
} from 'lucide-react';
import { MenuItem } from '../types';

export const menuItems: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'Panel de Monitoreo',
    icon: BarChart2,
    path: '/dashboard'
  },
  {
    id: 'employees',
    label: 'Empleados',
    icon: Users,
    path: '/employees',
    children: [
      {
        id: 'employee-management',
        label: 'Gestión de Empleados',
        icon: UserCheck,
        path: '/employees/management'
      },      
    ],
  },
  {
    id: 'time-control',
    label: 'Control de Tiempo',
    icon: Clock,
    path: '/time-control',
    children: [
      {
        id: 'schedule-assignment',
        label: 'Planificador de horarios',
        icon: Clock,
        path: '/employees/schedule'
      },
      {
        id: 'incidencias',
        label: 'Gestión de Incidencias',
        icon: Fingerprint,
        path: '/employees/incidencias'
      },
      {
        id: 'calendar',
        label: 'Calendario',
        icon: Calendar,
        path: '/employees/calendar'
      },
    ]
  },
  {
    id: 'access-control',
    label: 'Control de Acceso',
    icon: DoorClosed,
    path: '/access',
    children: [
      {
        id: 'visitors',
        label: 'Visitantes',
        icon: Users,
        path: '/access/visitors'
      },
      {
        id: 'access-permissions',
        label: 'Permisos de Acceso',
        icon: UserCheck,
        path: '/access/permissions'
      },
    ]
  },
  {
    id: 'diner',
    label: 'Comedor',
    icon: Utensils,
    path: '/system-config/diner',
  },
  {
    id: 'reports',
    label: 'Reportes',
    icon: BarChart2,
    path: '/reports',
    children: [
      {
        id: 'attendance-reports',
        label: 'Reportes más usados',
        icon: Clock,
        path: '/reports/attendance'
      }
    ]
  },
  {
    id: 'administration',
    label: 'Administración',
    icon: Settings,
    path: '/administration',
    children: [
      {
        id: 'licenses',
        label: 'Gestión de Licencias',
        icon: FileText,
        path: '/administration/licenses'
      },
      {
        id: 'users',
        label: 'Usuarios',
        icon: UserCheck,
        path: '/administration/users'
      },
      {
        id: 'perfil',
        label: 'Perfiles',
        icon: Users,
        path: '/administration/perfil'
      },
    ]
  },
  {
    id: 'system-config',
    label: 'Configuración del Sistema',
    icon: Settings,
    path: '/system-config',
    children: [
      {
        id: 'companies',
        label: 'Compañías',
        icon: Building2,
        path: '/system-config/structure'
      },
      {
        id: 'devices',
        label: 'Dispositivos',
        icon: Fingerprint,
        path: '/system-config/devices'
      },
      {
        id: 'employee-types',
        label: 'Tipos de Empleados',
        icon: UserCheck,
        path: '/system-config/employee-types'
      },
      {
        id: 'positions',
        label: 'Tipos de Acceso',
        icon: Briefcase,
        path: '/system-config/positions'
      },
      {
        id: 'email',
        label: 'Correo electronico',
        icon: Mail,
        path: '/system-config/email'
      },
      {
        id: 'general-config',
        label: 'Configuración General',
        icon: Settings,
        path: '/administration/config'
      },
      {
        id: 'check-profiles',
        label: 'Perfiles de Marcaje',
        icon: Clock,
        path: '/employees/check-profiles'
      },
      {
        id: 'geocerca',
        label: 'Geocerca',
        icon: Clock,
        path: '/employees/geocerca'
      },
      {
        id: 'contracts',
        label: 'Modalidad De Tiempo',
        icon: FileText,
        path: '/system-config/contracts'
      },
      {
        id: 'modality',
        label: 'Turnos de Trabajo',
        icon: FileText,
        path: '/system-config/modality'
      },
    ]
  }
];