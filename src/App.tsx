import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import AppLayout from './components/layout/AppLayout';
import DashboardPage from './components/dashboard/DashboardPage';
import ProjectPage from './components/project/ProjectPage';
import { useStore } from './store/useStore';
import { isSupabaseConfigured } from './lib/supabase';

function App() {
  const loadFromSupabase = useStore((s) => s.loadFromSupabase);

  useEffect(() => {
    if (isSupabaseConfigured()) {
      loadFromSupabase();
    }
  }, [loadFromSupabase]);

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="project/:projectId" element={<ProjectPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
