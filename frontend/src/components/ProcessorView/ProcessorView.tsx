import React, { useState, useEffect } from 'react';
import { Card, Badge } from 'flowbite-react';
import { useEmulatorStore } from '../../store/emulatorStore';
import './ProcessorView.css';

export const ProcessorView: React.FC = () => {
  const { state } = useEmulatorStore();
  const { processor } = state;
  const [previousCounter, setPreviousCounter] = useState(processor.program_counter);
  const [animateCounter, setAnimateCounter] = useState(false);

  // Отслеживаем изменения счетчика команд для анимации
  useEffect(() => {
    if (processor.program_counter !== previousCounter) {
      setAnimateCounter(true);
      setPreviousCounter(processor.program_counter);

      // Сбрасываем анимацию через 600ms
      setTimeout(() => setAnimateCounter(false), 600);
    }
  }, [processor.program_counter]);

  return (
    <Card className="glass-card p-6">
      <div className="flex items-center justify-between mb-6">
        <h5 className="text-xl font-bold text-white-900 font-heading">Процессор</h5>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-600">Активен</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2 font-body">
              Счётчик команд
              {animateCounter && (
                <span className="ml-2 text-xs text-blue-600 animate-pulse">↑ увеличивается</span>
              )}
            </label>
            <div className={`text-2xl font-mono font-bold text-primary-600 bg-white rounded-lg p-3 text-center transition-all duration-300 ${animateCounter ? 'animate-counter-increase' : ''
              }`}>
              {processor.program_counter}
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2 font-body">Текущая команда</label>
            <div className="text-lg font-mono text-gray-800 bg-white rounded-lg p-3 text-center min-h-[3rem] flex items-center justify-center">
              {processor.current_command || 'Нет команды'}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <label className="block text-sm font-medium text-gray-700 mb-3 font-body">Флаги состояния</label>
            <div className="flex flex-wrap gap-2">
              <Badge
                color={processor.flags.zero ? "success" : "gray"}
                size="lg"
                className="px-3 py-1"
              >
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Zero
              </Badge>
              <Badge
                color={processor.flags.carry ? "success" : "gray"}
                size="lg"
                className="px-3 py-1"
              >
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Carry
              </Badge>
              <Badge
                color={processor.flags.overflow ? "success" : "gray"}
                size="lg"
                className="px-3 py-1"
              >
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Overflow
              </Badge>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2 font-body">
              Стек
              {processor.stack.length > 0 && (
                <span className="ml-2 text-xs text-green-600 animate-pulse">
                  {processor.stack.length} элементов
                </span>
              )}
            </label>
            <div className="text-lg font-mono text-gray-800 bg-white rounded-lg p-3 min-h-[3rem] flex items-center animate-slide-in-up">
              <span className="text-gray-400">[</span>
              <span className="mx-2">
                {processor.stack.length > 0 ? (
                  processor.stack.map((item, index) => (
                    <span key={index} className="text-green-600 font-bold">
                      {item}{index < processor.stack.length - 1 ? ', ' : ''}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-400">пуст</span>
                )}
              </span>
              <span className="text-gray-400">]</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};