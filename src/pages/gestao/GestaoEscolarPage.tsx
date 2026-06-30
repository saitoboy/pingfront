import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { BookOpen, GraduationCap, Users, Calendar, CalendarClock, CalendarOff } from 'lucide-react';
import SeriesTab from './tabs/SeriesTab';
import TurmasTab from './tabs/TurmasTab';
import DisciplinasTab from './tabs/DisciplinasTab';
import AnosLetivosTab from './tabs/AnosLetivosTab';
import GradeHorarioTab from './tabs/GradeHorarioTab';
import FeriadosTab from './tabs/FeriadosTab';

type TabType = 'series' | 'turmas' | 'disciplinas' | 'anos-letivos' | 'grade-horario' | 'feriados';

// Valida se a tab é válida
const VALID_TABS: TabType[] = ['series', 'turmas', 'disciplinas', 'anos-letivos', 'grade-horario', 'feriados'];
const isValidTab = (tab: string | null): tab is TabType => {
  return tab !== null && VALID_TABS.includes(tab as TabType);
};

export default function GestaoEscolarPage() {
  const [searchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab');

  // Valida se a tab da URL é válida, caso contrário usa 'anos-letivos' como padrão
  const initialTab = isValidTab(tabFromUrl) ? tabFromUrl : 'anos-letivos';

  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  const tabsContainerRef = useRef<HTMLDivElement>(null);

  // Atualiza a tab quando a URL mudar
  useEffect(() => {
    if (isValidTab(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl]);

  // Scroll automático para a tab ativa em mobile
  useEffect(() => {
    if (tabsContainerRef.current) {
      const activeTabElement = tabsContainerRef.current.querySelector(`[data-tab-id="${activeTab}"]`) as HTMLElement;
      if (activeTabElement) {
        const container = tabsContainerRef.current;
        const tabLeft = activeTabElement.offsetLeft;
        const tabWidth = activeTabElement.offsetWidth;
        const containerWidth = container.offsetWidth;
        const scrollLeft = tabLeft - (containerWidth / 2) + (tabWidth / 2);

        container.scrollTo({
          left: scrollLeft,
          behavior: 'smooth'
        });
      }
    }
  }, [activeTab]);

  const tabs = [
    { id: 'anos-letivos' as TabType, label: 'Anos Letivos', icon: Calendar, color: 'blue' },
    { id: 'series' as TabType, label: 'Séries', icon: GraduationCap, color: 'blue' },
    { id: 'turmas' as TabType, label: 'Turmas', icon: Users, color: 'blue' },
    { id: 'disciplinas' as TabType, label: 'Disciplinas', icon: BookOpen, color: 'blue' },
    { id: 'grade-horario' as TabType, label: 'Grade Horária', icon: CalendarClock, color: 'blue' },
    { id: 'feriados' as TabType, label: 'Feriados', icon: CalendarOff, color: 'blue' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Tab Navigation */}
          <div
            ref={tabsContainerRef}
            className="
              tabs-scroll-container
              flex border-b border-gray-200
              overflow-x-auto overflow-y-visible
              scroll-smooth
            "
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: '#cbd5e1 #f1f5f9',
              WebkitOverflowScrolling: 'touch'
            }}
          >
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  data-tab-id={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center gap-2 px-4 sm:px-6 py-3 sm:py-4 font-medium transition-all
                    flex-shrink-0 whitespace-nowrap
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
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                  <span className="text-sm sm:text-base">{tab.label}</span>
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
            {activeTab === 'grade-horario' && <GradeHorarioTab />}
            {activeTab === 'feriados' && <FeriadosTab />}
          </div>
        </div>
      </div>
    </div>
  );
}
