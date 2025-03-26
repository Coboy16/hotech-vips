import { LucideIcon } from "lucide-react";

export interface MenuItem {
  id: string;
  label: string;
  icon: LucideIcon;
  path: string;
  children?: MenuItem[];
  modulePermission: string;
}
