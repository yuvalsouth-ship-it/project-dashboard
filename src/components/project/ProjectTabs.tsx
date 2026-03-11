import { ListTodo, Calendar, BarChart3, Receipt } from 'lucide-react';

const TABS = [
  { id: 'tasks', label: 'משימות', icon: ListTodo },
  { id: 'monthly-plan', label: 'תוכנית חודשית', icon: Calendar },
  { id: 'gantt', label: 'אבני דרך', icon: BarChart3 },
  { id: 'invoices', label: 'חשבונות', icon: Receipt },
] as const;

interface Props {
  activeTab: string;
  onTabChange: (tab: string) => void;
  color: string;
}

export default function ProjectTabs({ activeTab, onTabChange, color }: Props) {
  return (
    <div className="flex border-b border-gray-200 bg-white px-8">
      {TABS.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
              isActive
                ? 'text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            style={isActive ? { borderBottomColor: color } : undefined}
          >
            <Icon size={16} />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
