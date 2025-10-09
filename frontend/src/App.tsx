import React, { useEffect } from 'react';
import { TaskPanel } from './components/TaskPanel/TaskPanel';
import { ProcessorView } from './components/ProcessorView/ProcessorView';
import { MemoryView } from './components/MemoryView/MemoryView';
import { ControlPanel } from './components/ControlPanel/ControlPanel';
import { CommandEditor } from './components/CommandEditor/CommandEditor';
import { TechStack } from './components/TechStack/TechStack';
import { ErrorDisplay } from './components/ErrorDisplay/ErrorDisplay';
import { useEmulatorStore } from './store/emulatorStore';
import './App.css';
import './styles/animations.css';

const App: React.FC = () => {
  const { loadState, error, setError } = useEmulatorStore();

  useEffect(() => {
    // Загружаем начальное состояние при запуске приложения
    // Не показываем ошибки при первом запуске, если backend не готов
    loadState().catch((error) => {
      console.warn('Не удалось загрузить начальное состояние:', error);
      // Игнорируем ошибки при первом запуске
    });
  }, [loadState]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-primary-600 p-6 font-body">
      <div className="max-w-7xl mx-auto">
        <ErrorDisplay error={error} onClose={() => setError(null)} />
        <div className="grid grid-cols-1 lg:grid-cols-[350px_1fr] gap-6 min-h-[calc(100vh-3rem)]">
          <div className="flex flex-col gap-6">
            <div className="fade-in-up">
              <TaskPanel />
            </div>
            <div className="fade-in-up" style={{ animationDelay: '0.1s' }}>
              <TechStack />
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="fade-in-up" style={{ animationDelay: '0.2s' }}>
              <CommandEditor />
            </div>
            <div className="fade-in-up" style={{ animationDelay: '0.3s' }}>
              <ProcessorView />
            </div>
            <div className="fade-in-up" style={{ animationDelay: '0.4s' }}>
              <MemoryView />
            </div>
            <div className="fade-in-up" style={{ animationDelay: '0.5s' }}>
              <ControlPanel />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;