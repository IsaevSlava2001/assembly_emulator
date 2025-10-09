import React, { useState, useEffect, useRef } from 'react';
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
  const [previousHistoryLength, setPreviousHistoryLength] = useState(0);
  const [previousRamLength, setPreviousRamLength] = useState(0);
  const [previousRamValues, setPreviousRamValues] = useState<number[]>([]);
  const [changedAddresses, setChangedAddresses] = useState<Set<number>>(new Set());
  const [highlightedAddresses, setHighlightedAddresses] = useState<Set<number>>(new Set());

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

  // Сбрасываем отслеживание изменений при сбросе процессора
  useEffect(() => {
    if (memory.ram.every(value => value === 0)) {
      setChangedAddresses(new Set());
      setHighlightedAddresses(new Set());
      setPreviousRamValues([]);
    }
  }, [memory.ram]);

  // Отслеживаем изменения в истории для анимации
  useEffect(() => {
    if (memory.history.length > previousHistoryLength) {
      // Новая запись в истории - можно добавить анимацию
      setPreviousHistoryLength(memory.history.length);
    }
  }, [memory.history.length, previousHistoryLength]);

  // Отслеживаем изменения в RAM для анимации
  useEffect(() => {
    if (memory.ram.length > previousRamLength) {
      // Новая запись в RAM - можно добавить анимацию
      setPreviousRamLength(memory.ram.length);
    }
  }, [memory.ram.length, previousRamLength]);

  // Отслеживаем изменения значений в памяти
  useEffect(() => {
    if (previousRamValues.length > 0 && memory.ram.length > 0) {
      const changed = new Set<number>();
      const highlighted = new Set<number>();

      // Сравниваем текущие значения с предыдущими
      for (let i = 0; i < Math.min(previousRamValues.length, memory.ram.length); i++) {
        if (previousRamValues[i] !== memory.ram[i]) {
          changed.add(i);
          highlighted.add(i);

          // Убираем подсветку через 2 секунды
          setTimeout(() => {
            setHighlightedAddresses(prev => {
              const newSet = new Set(prev);
              newSet.delete(i);
              return newSet;
            });
          }, 2000);
        }
      }

      if (changed.size > 0) {
        setChangedAddresses(changed);
        setHighlightedAddresses(highlighted);
      }
    }

    // Обновляем предыдущие значения
    setPreviousRamValues([...memory.ram]);
  }, [memory.ram, previousRamValues]);

  return (
    <Card title="Память" className="memory-card">
      <div className="memory-sections">
        <div className="memory-section">
          <h4 className="flex items-center">
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded mr-2">ВРЕМЯ</span>
            Память по времени
            {memory.history.length > 0 && (
              <span className="ml-2 bg-green-100 text-green-800 text-xs font-medium px-2 py-0.5 rounded animate-pulse">
                Активна
              </span>
            )}
          </h4>
          <DataTable
            value={historyData}
            size="small"
            className={`history-table ${memory.history.length > previousHistoryLength ? 'animate-slide-in-up' : ''}`}
            emptyMessage="Нет данных"
          >
            <Column
              field="step"
              header="Шаг"
              style={{ width: '60px' }}
              body={(rowData) => (
                <span className="font-mono text-blue-600 font-bold">{rowData.step}</span>
              )}
            />
            <Column
              field="command"
              header="Команда"
              body={(rowData) => (
                <span className="font-mono text-gray-800">{rowData.command}</span>
              )}
            />
            <Column
              field="stack"
              header="Стек"
              body={(rowData) => (
                <span className="font-mono text-green-600">{rowData.stack}</span>
              )}
            />
            <Column
              field="programCounter"
              header="Счётчик"
              style={{ width: '80px' }}
              body={(rowData) => (
                <span className="font-mono text-purple-600 font-bold">{rowData.programCounter}</span>
              )}
            />
          </DataTable>
        </div>

        <div className="memory-section">
          <h4 className="flex items-center">
            <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded mr-2">ПАМЯТЬ</span>
            Состояние памяти
            {memory.ram.length > 0 && (
              <span className="ml-2 bg-orange-100 text-orange-800 text-xs font-medium px-2 py-0.5 rounded animate-pulse">
                {memory.ram.length} ячеек
              </span>
            )}
            {changedAddresses.size > 0 && (
              <span className="ml-2 bg-red-100 text-red-800 text-xs font-medium px-2 py-0.5 rounded animate-pulse">
                {changedAddresses.size} изменений
              </span>
            )}
          </h4>
          <DataTable
            value={ramData}
            size="small"
            className={`ram-table ${memory.ram.length > previousRamLength ? 'animate-slide-in-up' : ''}`}
            emptyMessage="Память пуста"
          >
            <Column
              field="address"
              header="Адрес"
              style={{ width: '80px' }}
              body={(rowData) => {
                const addressIndex = parseInt(rowData.address, 16);
                const isChanged = changedAddresses.has(addressIndex);
                const isHighlighted = highlightedAddresses.has(addressIndex);

                return (
                  <span className={`font-mono font-bold transition-all duration-300 ${isHighlighted
                      ? 'text-yellow-600 bg-yellow-100 px-2 py-1 rounded animate-pulse'
                      : isChanged
                        ? 'text-orange-600 bg-orange-50 px-1 py-0.5 rounded'
                        : 'text-blue-600'
                    }`}>
                    0x{rowData.address}
                  </span>
                );
              }}
            />
            <Column
              field="value"
              header="Значение"
              body={(rowData) => {
                const addressIndex = parseInt(rowData.address, 16);
                const isChanged = changedAddresses.has(addressIndex);
                const isHighlighted = highlightedAddresses.has(addressIndex);
                const hasValue = rowData.value !== 0;

                return (
                  <div className="flex items-center space-x-2">
                    <span className={`font-mono font-bold transition-all duration-300 ${isHighlighted
                        ? 'text-yellow-600 bg-yellow-100 px-2 py-1 rounded animate-pulse'
                        : isChanged
                          ? 'text-orange-600 bg-orange-50 px-1 py-0.5 rounded'
                          : hasValue
                            ? 'text-green-600'
                            : 'text-gray-400'
                      }`}>
                      {rowData.value}
                    </span>
                    {isChanged && (
                      <span className="text-xs text-orange-500 animate-bounce">
                        ↑ изменилось
                      </span>
                    )}
                  </div>
                );
              }}
            />
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