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
        <h5 className="text-xl font-bold text-gray-900">Стек технологий</h5>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-600">Активен</span>
        </div>
      </div>
      
      <div className="space-y-6">
        {categories.map((category) => (
          <div key={category} className="space-y-3">
            <h4 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
              {category}
            </h4>
            <div className="grid grid-cols-1 gap-3">
              {technologies
                .filter(tech => tech.category === category)
                .map((tech) => (
                  <div key={tech.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                        style={{ backgroundColor: tech.color }}
                      >
                        {tech.name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-gray-900">{tech.name}</span>
                          <Badge color="gray" size="sm">v{tech.version}</Badge>
                        </div>
                        <p className="text-sm text-gray-600">{tech.description}</p>
                      </div>
                    </div>
                    <Badge 
                      color="info"
                      size="sm"
                      className="px-3 py-1"
                      style={{ backgroundColor: tech.color, color: 'white' }}
                    >
                      {tech.name}
                    </Badge>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-600">{technologies.length}</div>
            <div className="text-sm text-blue-800">Технологий</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-600">{categories.length}</div>
            <div className="text-sm text-green-800">Категорий</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-purple-600">2025</div>
            <div className="text-sm text-purple-800">Год разработки</div>
          </div>
        </div>
      </div>
    </Card>
  );
};
