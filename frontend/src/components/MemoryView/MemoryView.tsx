import React, { useState, useEffect } from 'react';
import { Card } from 'primereact/card';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'flowbite-react';
import { useEmulatorStore } from '../../store/emulatorStore';
import './MemoryView.css';

export const MemoryView: React.FC = () => {
  const { state } = useEmulatorStore();
  const { memory } = state;
  const [visibleMemoryItems, setVisibleMemoryItems] = useState(5);

  const historyData = memory.history.map((entry, index) => ({
    step: index + 1,
    command: entry.command || 'N/A',
    stack: `[${entry.stack ? entry.stack.join(', ') : ''}]`,
    programCounter: entry.programCounter || 0,
  }));

  const allRamData = memory.ram.map((value, index) => ({
    address: index.toString(16).padStart(4, '0'),
    value: value,
  }));

  // Показываем только видимые элементы памяти
  const ramData = allRamData.slice(0, visibleMemoryItems);

  const handleLoadMore = () => {
    setVisibleMemoryItems(prev => Math.min(prev + 5, allRamData.length));
  };

  const handleReset = () => {
    setVisibleMemoryItems(5);
  };

  const hasMoreItems = visibleMemoryItems < allRamData.length;

  // Сбрасываем видимые элементы при изменении состояния памяти
  useEffect(() => {
    setVisibleMemoryItems(5);
  }, [memory.ram]);

  return (
    <Card title="Память" className="memory-card">
      <div className="memory-sections">
        <div className="memory-section">
          <h4>Память по времени</h4>
          <DataTable
            value={historyData}
            size="small"
            className="history-table"
            emptyMessage="Нет данных"
          >
            <Column field="step" header="Шаг" style={{ width: '60px' }} />
            <Column field="command" header="Команда" />
            <Column field="stack" header="Стек" />
            <Column field="programCounter" header="Счётчик" style={{ width: '80px' }} />
          </DataTable>
        </div>

        <div className="memory-section">
          <h4>Состояние памяти</h4>
          <DataTable
            value={ramData}
            size="small"
            className="ram-table"
            emptyMessage="Память пуста"
          >
            <Column field="address" header="Адрес" style={{ width: '80px' }} />
            <Column field="value" header="Значение" />
          </DataTable>
          <div className="mt-3 flex justify-center space-x-2">
            {hasMoreItems && (
              <Button
                color="light"
                size="sm"
                onClick={handleLoadMore}
                className="flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
                Показать еще 5 позиций
              </Button>
            )}
            {visibleMemoryItems > 5 && (
              <Button
                color="gray"
                size="sm"
                onClick={handleReset}
                className="flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Свернуть
              </Button>
            )}
          </div>
          {allRamData.length > 0 && (
            <div className="mt-2 text-center text-sm text-gray-500">
              Показано {visibleMemoryItems} из {allRamData.length} позиций
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};