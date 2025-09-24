import React from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
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
    <Card title="Задания" className="task-card">
      <div className="task-buttons">
        {tasks.map((task) => (
          <Button
            key={task.id}
            label={task.title}
            className={`p-button-raised p-button-sm ${state.currentTask?.id === task.id ? 'p-button-success' : ''}`}
            onClick={() => handleTaskSelect(task.id)}
          />
        ))}
      </div>

      {state.currentTask && (
        <div className="task-description">
          <h4>{state.currentTask.title}</h4>
          <p>{state.currentTask.description}</p>
          <div className="task-status">
            <span className="status-indicator">Активно</span>
          </div>
        </div>
      )}

      <div className="code-actions">
        <Button
          label="Загрузить пример"
          icon="pi pi-download"
          className="p-button-outlined p-button-sm"
          style={{ width: '100%', marginBottom: '10px' }}
        />
        <Button
          label="Сохранить код"
          icon="pi pi-save"
          className="p-button-outlined p-button-sm"
          style={{ width: '100%', marginBottom: '10px' }}
        />
        <Button
          label="Очистить всё"
          icon="pi pi-trash"
          className="p-button-outlined p-button-sm p-button-danger"
          style={{ width: '100%' }}
        />
      </div>
    </Card>
  );
};