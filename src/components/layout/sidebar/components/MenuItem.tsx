import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useSidebarStore } from '../store/sidebarStore';
import { MenuItem } from '../types';

interface MenuItemProps {
  item: MenuItem;
  currentView: string;
  setCurrentView: (view: string) => void;
  level?: number;
}

export const MenuItemComponent: React.FC<MenuItemProps> = ({ 
  item, 
  currentView, 
  setCurrentView, 
  level = 0 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasChildren = item.children && item.children.length > 0;
  const isActive = currentView === item.path;
  const { isExpanded: isSidebarExpanded, toggleExpanded } = useSidebarStore();

  const handleClick = () => {
    if (!isSidebarExpanded) {
      toggleExpanded();
      return;
    }

    if (hasChildren) {
      setIsExpanded(!isExpanded);
    } else {
      setCurrentView(item.path);
    }
  };

  return (
    <div className="w-full">
      <button
        onClick={handleClick}
        className={`
          flex items-center w-full px-3 py-2 rounded-lg text-sm
          ${isActive ? 'bg-white bg-opacity-10' : 'hover:bg-white hover:bg-opacity-10'}
          transition-all
          ${level > 0 ? 'pl-8' : ''}
        `}
        aria-expanded={hasChildren ? isExpanded : undefined}
      >
        <item.icon className="w-5 h-5 flex-shrink-0" />
        {isSidebarExpanded && (
          <>
            <span className="ml-3 flex-1 text-left">{item.label}</span>
            {hasChildren && (
              <ChevronDown
                className={`w-4 h-4 transition-transform ${isExpanded ? 'transform rotate-180' : ''}`}
                aria-hidden="true"
              />
            )}
          </>
        )}
      </button>
      {hasChildren && isExpanded && isSidebarExpanded && (
        <div className="mt-1">
          {item.children?.map((child) => (
            <MenuItemComponent
              key={child.id}
              item={child}
              currentView={currentView}
              setCurrentView={setCurrentView}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};