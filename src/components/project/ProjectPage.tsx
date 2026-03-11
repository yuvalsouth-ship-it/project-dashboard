import { useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import Header from '../layout/Header';
import ProjectTabs from './ProjectTabs';
import TasksSection from './tasks/TasksSection';
import MonthlyPlanSection from './monthly-plan/MonthlyPlanSection';
import GanttSection from './gantt/GanttSection';
import InvoicesSection from './invoices/InvoicesSection';
import { PROJECTS } from '../../data/initialData';

export default function ProjectPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const [activeTab, setActiveTab] = useState('tasks');

  const project = PROJECTS.find((p) => p.id === projectId);
  if (!project) return <Navigate to="/" replace />;

  return (
    <div>
      <Header title={project.name} subtitle="ניהול פרויקט" color={project.color} />
      <ProjectTabs activeTab={activeTab} onTabChange={setActiveTab} color={project.color} />

      {activeTab === 'tasks' && <TasksSection projectId={project.id} />}
      {activeTab === 'monthly-plan' && <MonthlyPlanSection projectId={project.id} />}
      {activeTab === 'gantt' && <GanttSection projectId={project.id} color={project.color} />}
      {activeTab === 'invoices' && <InvoicesSection projectId={project.id} />}
    </div>
  );
}
