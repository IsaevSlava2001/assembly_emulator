import React from 'react';
import { PrimeReactProvider } from 'primereact/api';
import { TaskPanel } from './components/TaskPanel/TaskPanel';
import { ProcessorView } from './components/ProcessorView/ProcessorView';
import { MemoryView } from './components/MemoryView/MemoryView';
import { ControlPanel } from './components/ControlPanel/ControlPanel';
import { CommandEditor } from './components/CommandEditor/CommandEditor';
import { TechStack } from './components/TechStack/TechStack';
import 'primereact/resources/themes/lara-light-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import './App.css';
import './styles/animations.css';

const App: React.FC = () => {
  return (
    <PrimeReactProvider>
      <div className="app-container">
        <div className="app-grid">
          <div className="left-panel">
            <div className="fade-in-up">
              <TaskPanel />
            </div>
            <div className="fade-in-up" style={{ animationDelay: '0.1s' }}>
              <TechStack />
            </div>
          </div>

          <div className="main-content">
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
    </PrimeReactProvider>
  );
};

export default App;