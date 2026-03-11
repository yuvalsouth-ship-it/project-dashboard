import { NavLink } from 'react-router-dom';
import { LayoutDashboard } from 'lucide-react';
import { PROJECTS } from '../../data/initialData';

export default function Sidebar() {
  return (
    <aside className="w-64 bg-white border-l border-gray-200 h-screen sticky top-0 flex flex-col shadow-sm">
      <div className="p-5 border-b border-gray-200">
        <h1 className="text-lg font-bold text-gray-800">ניהול פרויקטים</h1>
        <p className="text-xs text-gray-500 mt-1">קידום תב"עות</p>
      </div>

      <nav className="flex-1 overflow-y-auto py-3">
        <NavLink
          to="/"
          end
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
