import React from 'react';
import { TaskPanel } from './components/TaskPanel/TaskPanel';
import { ProcessorView } from './components/ProcessorView/ProcessorView';
import { MemoryView } from './components/MemoryView/MemoryView';
import { ControlPanel } from './components/ControlPanel/ControlPanel';
import { CommandEditor } from './components/CommandEditor/CommandEditor';
import { TechStack } from './components/TechStack/TechStack';
import './App.css';
import './styles/animations.css';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-primary-600 p-6 font-sans">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[350px_1fr] gap-6 min-h-[calc(100vh-3rem)]">
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
  );
};

export default App;