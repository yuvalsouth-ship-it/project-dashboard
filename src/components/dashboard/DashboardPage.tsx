import Header from '../layout/Header';
import ProjectSummaryCard from './ProjectSummaryCard';
import { PROJECTS } from '../../data/initialData';

export default function DashboardPage() {
  return (
    <div>
      <Header title="דשבורד" subtitle="סקירה כללית של כל הפרויקטים" />
      <div className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PROJECTS.map((project) => (
            <ProjectSummaryCard key={project.id} project={project} />
          ))}
        </div>
      </div>
    </div>
  );
}
