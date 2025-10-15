import { useState } from 'react';
import { BookOpen, GraduationCap, Users, Calendar } from 'lucide-react';
import SeriesTab from './tabs/SeriesTab';
import TurmasTab from './tabs/TurmasTab';
import DisciplinasTab from './tabs/DisciplinasTab';
import AnosLetivosTab from './tabs/AnosLetivosTab';

type TabType = 'series' | 'turmas' | 'disciplinas' | 'anos-letivos';

export default function GestaoEscolarPage() {
  const [activeTab, setActiveTab] = useState<TabType>('anos-letivos');

  const tabs = [
    { id: 'anos-letivos' as TabType, label: 'Anos Letivos', icon: Calendar, color: 'blue' },
    { id: 'series' as TabType, label: 'Séries', icon: GraduationCap, color: 'blue' },
    { id: 'turmas' as TabType, label: 'Turmas', icon: Users, color: 'blue' },
    { id: 'disciplinas' as TabType, label: 'Disciplinas', icon: BookOpen, color: 'blue' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center gap-2 px-6 py-4 font-medium transition-all
                    ${isActive 
                      ? `bg-${tab.color}-50 text-${tab.color}-600 border-b-2 border-${tab.color}-600` 
                      : 'text-gray-600 hover:bg-gray-50'
                    }
                  `}
                  style={{
                    ...(isActive && {
                      backgroundColor: tab.color === 'blue' ? '#eff6ff' : tab.color === 'purple' ? '#faf5ff' : '#f0fdf4',
                      color: tab.color === 'blue' ? '#2563eb' : tab.color === 'purple' ? '#9333ea' : '#16a34a',
                      borderBottomColor: tab.color === 'blue' ? '#2563eb' : tab.color === 'purple' ? '#9333ea' : '#16a34a',
                    })
                  }}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'anos-letivos' && <AnosLetivosTab />}
            {activeTab === 'series' && <SeriesTab />}
            {activeTab === 'turmas' && <TurmasTab />}
            {activeTab === 'disciplinas' && <DisciplinasTab />}
          </div>
        </div>
      </div>
    </div>
  );
}

