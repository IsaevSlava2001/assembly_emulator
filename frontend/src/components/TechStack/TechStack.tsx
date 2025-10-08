// ADD: Technology stack component showing all used technologies
import React from 'react';
import { Card, Badge } from 'flowbite-react';
import './TechStack.css';

export const TechStack: React.FC = () => {
  const technologies = [
    {
      name: 'React',
      version: '19.1.1',
      category: 'Frontend Framework',
      color: '#61dafb',
      description: 'Библиотека для создания пользовательских интерфейсов'
    },
    {
      name: 'TypeScript',
      version: '5.8.3',
      category: 'Language',
      color: '#3178c6',
      description: 'Типизированный JavaScript для масштабируемых приложений'
    },
    {
      name: 'Vite',
      version: '5.0.0',
      category: 'Build Tool',
      color: '#646cff',
      description: 'Быстрый инструмент сборки для современного фронтенда'
    },
    {
      name: 'PrimeReact',
      version: '10.9.7',
      category: 'UI Library',
      color: '#6366f1',
      description: 'Богатая библиотека компонентов для React'
    },
    {
      name: 'Zustand',
      version: '5.0.8',
      category: 'State Management',
      color: '#ff6b6b',
      description: 'Легковесное управление состоянием'
    },
    {
      name: 'CSS3',
      version: 'Modern',
      category: 'Styling',
      color: '#1572b6',
      description: 'Современные стили с градиентами и анимациями'
    }
  ];

  const categories = [...new Set(technologies.map(tech => tech.category))];

  return (
    <Card className="glass-card p-6">
      <div className="flex items-center justify-between mb-6">
        <h5 className="text-xl font-bold text-white-900 font-heading">Стек технологий</h5>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-600">Активен</span>
        </div>
      </div>

      <div className="space-y-6">
        {categories.map((category) => (
          <div key={category} className="space-y-3">
            <h4 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2 font-heading">
              {category}
            </h4>
            <div className="grid grid-cols-1 gap-3">
              {technologies
                .filter(tech => tech.category === category)
                .map((tech) => (
                  <div key={tech.name} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-all hover:shadow-md">
                    <div className="flex items-center justify-between mb-3">
                      <Badge
                        color="info"
                        size="sm"
                        className="px-3 py-1.5 font-body"
                        style={{ backgroundColor: tech.color, color: 'white', border: 'none' }}
                      >
                        {tech.name}
                      </Badge>
                      <span className="text-xs text-gray-500 font-body">v{tech.version}</span>
                    </div>
                    <p className="text-sm text-gray-700 font-body leading-relaxed">{tech.description}</p>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>


    </Card>
  );
};
