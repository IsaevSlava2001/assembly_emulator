// ADD: Technology stack component showing all used technologies
import React from 'react';
import { Card } from 'primereact/card';
import { Chip } from 'primereact/chip';
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
    <Card title="Стек технологий" className="tech-stack-card">
      <div className="tech-categories">
        {categories.map((category) => (
          <div key={category} className="tech-category">
            <h4 className="category-title">{category}</h4>
            <div className="tech-items">
              {technologies
                .filter(tech => tech.category === category)
                .map((tech) => (
                  <div key={tech.name} className="tech-item">
                    <div 
                      className="tech-icon"
                      style={{ backgroundColor: tech.color }}
                    >
                      {tech.name.charAt(0)}
                    </div>
                    <div className="tech-info">
                      <div className="tech-name">
                        {tech.name}
                        <span className="tech-version">v{tech.version}</span>
                      </div>
                      <div className="tech-description">{tech.description}</div>
                    </div>
                    <Chip 
                      label={tech.name}
                      className="tech-chip"
                      style={{ backgroundColor: tech.color, color: 'white' }}
                    />
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
      
      <div className="tech-summary">
        <div className="summary-stats">
          <div className="stat-item">
            <span className="stat-number">{technologies.length}</span>
            <span className="stat-label">Технологий</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{categories.length}</span>
            <span className="stat-label">Категорий</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">2025</span>
            <span className="stat-label">Год разработки</span>
          </div>
        </div>
      </div>
    </Card>
  );
};
