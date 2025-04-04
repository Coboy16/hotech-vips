import { useState } from "react";

/**
 * Hook para gestionar las pestañas de formularios multipestaña
 */
export function useFormTabs<T extends string = string>(initialTab: T) {
  const [activeTab, setActiveTab] = useState<T>(initialTab);

  const changeTab = (tab: T) => {
    setActiveTab(tab);
  };

  const isTabActive = (tab: T): boolean => {
    return activeTab === tab;
  };

  return {
    activeTab,
    setActiveTab: changeTab,
    isTabActive,
  };
}
