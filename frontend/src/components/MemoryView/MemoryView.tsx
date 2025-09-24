import React from 'react';
import { Card } from 'primereact/card';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { useEmulatorStore } from '../../store/emulatorStore';
import './MemoryView.css';

export const MemoryView: React.FC = () => {
  const { state } = useEmulatorStore();
  const { memory } = state;

  const historyData = memory.history.map((entry, index) => ({
    step: index + 1,
    command: entry.command,
    stack: `[${entry.stack.join(', ')}]`,
    programCounter: entry.programCounter,
  }));

  const ramData = memory.ram.map((value, index) => ({
    address: index.toString(16).padStart(4, '0'),
    value: value,
  }));

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
        </div>
      </div>
    </Card>
  );
};