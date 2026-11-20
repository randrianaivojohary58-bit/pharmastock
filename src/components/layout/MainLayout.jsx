import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function MainLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Pour mobile
  const [isCollapsed, setIsCollapsed] = useState(false); // Pour desktop (nouveau)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* On passe isCollapsed et setIsCollapsed à la Sidebar */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />
      
      {/* La marge gauche change selon l'état de la sidebar */}
      <div className={`transition-all duration-300 ${isCollapsed ? 'lg:ml-[80px]' : 'lg:ml-[270px]'}`}>
        <Topbar 
          onMenuClick={() => setIsSidebarOpen(true)} 
          title="Tableau de bord" 
          subtitle="Vue générale de votre activité"
        />
        
        <main className="p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}