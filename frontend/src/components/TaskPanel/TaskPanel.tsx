import React from 'react';
import { Card, Button } from 'flowbite-react';
import { useEmulatorStore } from '../../store/emulatorStore';
import './TaskPanel.css';

export const TaskPanel: React.FC = () => {
  const { state, setCurrentTask } = useEmulatorStore();

  const tasks = [
    {
      id: 1,
      title: "Сумма элементов массива",
      description: "Вычислить сумму всех элементов массива из 6-15 элементов. Массив хранится в памяти начиная с адреса 0x1000, где первый элемент - размер массива."
    },
    {
      id: 2,
      title: "Свертка двух массивов",
      description: "Вычислить свертку двух массивов по 10 элементов каждый. Результат сохранить в память по адресу 0x1100."
    }
  ];

  const handleTaskSelect = (taskId: number) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      setCurrentTask(taskId);
    }
  };

  return (
    <Card className="glass-card p-6">
      <div className="flex items-center justify-between mb-6">
        <h5 className="text-xl font-bold text-gray-900 font-heading">Задания</h5>
        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
      </div>
      
      <div className="space-y-3 mb-6">
        {tasks.map((task) => (
          <Button
            key={task.id}
            color={state.currentTask?.id === task.id ? "success" : "light"}
            size="sm"
            className={`w-full justify-start ${state.currentTask?.id === task.id ? 'ring-2 ring-green-500' : ''}`}
            onClick={() => handleTaskSelect(task.id)}
          >
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            {task.title}
          </Button>
        ))}
      </div>

      {state.currentTask && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h4 className="text-lg font-semibold text-blue-900 mb-2 font-heading">{state.currentTask.title}</h4>
          <p className="text-blue-800 text-sm leading-relaxed font-body">{state.currentTask.description}</p>
          <div className="mt-3 flex items-center">
            <span className="chip-success">Активно</span>
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