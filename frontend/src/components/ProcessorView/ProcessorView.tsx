import React from 'react';
import { Card } from 'primereact/card';
import { Chip } from 'primereact/chip';
import { useEmulatorStore } from '../../store/emulatorStore';
import './ProcessorView.css';

export const ProcessorView: React.FC = () => {
  const { state } = useEmulatorStore();
  const { processor } = state;

  return (
    <Card title="Процессор" className="processor-card">
      <div className="processor-grid">
        <div className="processor-item">
          <label>Счётчик команд</label>
          <div className="value-display">
            {processor.programCounter}
          </div>
        </div>

        <div className="processor-item">
          <label>Текущая команда</label>
          <div className="value-display">
            {processor.currentCommand || 'Нет команды'}
          </div>
        </div>

        <div className="processor-item">
          <label>Флаги</label>
          <div className="flags-container">
            <Chip
              label="Zero"
              className={processor.flags.zero ? "p-chip-success" : "p-chip-secondary"}
            />
            <Chip
              label="Carry"
              className={processor.flags.carry ? "p-chip-success" : "p-chip-secondary"}
            />
            <Chip
              label="Overflow"
              className={processor.flags.overflow ? "p-chip-success" : "p-chip-secondary"}
            />
          </div>
        </div>

        <div className="processor-item">
          <label>Стек</label>
          <div className="value-display">
            [{processor.stack.join(', ')}]
          </div>
        </div>
      </div>
    </Card>
  );
};