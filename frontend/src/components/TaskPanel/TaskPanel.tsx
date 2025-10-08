import React, { useState, useEffect } from 'react';
import { Card, Button, Spinner } from 'flowbite-react';
import { useEmulatorStore } from '../../store/emulatorStore';
import './TaskPanel.css';

export const TaskPanel: React.FC = () => {
  const { tasks, loading, error, loadTasks, setCurrentTask, executeCode } = useEmulatorStore();
  const [activeTask, setActiveTask] = useState<number | null>(null);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const handleTaskSelect = (taskId: number) => {
    // Toggle behavior: if same task is clicked, close it; otherwise open new task
    if (activeTask === taskId) {
      setActiveTask(null);
      setCurrentTask(0);
    } else {
      setActiveTask(taskId);
      setCurrentTask(taskId);
    }
  };

  const handleExecuteTask = async (taskId: number) => {
    await executeCode(taskId);
  };

  return (
    <Card className="glass-card p-6">
      <div className="flex items-center justify-between mb-6">
        <h5 className="text-xl font-bold text-white-900 font-heading">Задания</h5>
        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-8">
          <Spinner size="lg" />
          <span className="ml-2 text-gray-600">Загрузка задач...</span>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      ) : (
        <div className="space-y-3 mb-6">
          {tasks.map((task) => (
            <div key={task.id} className="space-y-2">
              <Button
                color={activeTask === task.id ? "success" : "light"}
                size="sm"
                className={`w-full justify-start transition-all duration-300 ${activeTask === task.id
                  ? 'ring-2 ring-green-500 transform scale-105'
                  : 'hover:scale-102'
                  }`}
                onClick={() => handleTaskSelect(task.id)}
              >
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                {task.title}
              </Button>
              {activeTask === task.id && (
                <Button
                  color="info"
                  size="sm"
                  className="w-full"
                  onClick={() => handleExecuteTask(task.id)}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Выполнить задачу
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      {activeTask && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 animate-fadeInUp">
          <h4 className="text-lg font-semibold text-blue-900 mb-2 font-heading">
            {tasks.find(t => t.id === activeTask)?.title}
          </h4>
          <p className="text-blue-800 text-sm leading-relaxed font-body">
            {tasks.find(t => t.id === activeTask)?.description}
          </p>
          <div className="mt-3 flex items-center">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-1.5 animate-pulse"></div>
              Активно
            </span>
          </div>
        </div>
      )}

      <div className="space-y-3">
        <Button
          color="light"
          size="sm"
          className="w-full justify-start"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Загрузить пример
        </Button>
        <Button
          color="light"
          size="sm"
          className="w-full justify-start"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
          </svg>
          Сохранить код
        </Button>
        <Button
          color="failure"
          size="sm"
          className="w-full justify-start"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Очистить всё
        </Button>
      </div>
    </Card>
  );
};