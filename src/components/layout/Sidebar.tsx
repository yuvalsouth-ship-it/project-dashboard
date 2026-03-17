import { NavLink } from 'react-router-dom';
import { LayoutDashboard, X } from 'lucide-react';
import { PROJECTS } from '../../data/initialData';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: () => void;
}

export default function Sidebar({ isOpen, onClose, onNavigate }: SidebarProps) {
  return (
    <aside
      className={`
        w-64 bg-white border-l border-gray-200 h-screen flex flex-col shadow-sm
        fixed top-0 right-0 z-50 transition-transform duration-300
        md:sticky md:top-0 md:z-auto md:translate-x-0
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
      `}
    >
      <div className="p-5 border-b border-gray-200 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-gray-800">ניהול פרויקטים</h1>
          <p className="text-xs text-gray-500 mt-1">קידום תב"עות</p>
        </div>
        {/* Close button - mobile only */}
        <button
          onClick={onClose}
          className="md:hidden p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
          aria-label="סגור תפריט"
        >
          <X size={20} />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-3">
        <NavLink
          to="/"
          end
          onClick={onNavigate}
          className={({ isActive }) =>
            `flex items-center gap-3 px-5 py-2.5 text-sm transition-colors ${
              isActive
                ? 'bg-blue-50 text-blue-700 font-medium border-r-3 border-blue-600'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`
          }
        >
          <LayoutDashboard size={18} />
          <span>דשבורד</span>
        </NavLink>

        <div className="px-5 py-2 mt-3">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">פרויקטים</p>
        </div>

        {PROJECTS.map((project) => (
          <NavLink
            key={project.id}
            to={`/project/${project.id}`}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 px-5 py-2.5 text-sm transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-700 font-medium border-r-3 border-blue-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            <span
              className="w-3 h-3 rounded-full shrink-0"
              style={{ backgroundColor: project.color }}
            />
            <span className="truncate">{project.name}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
