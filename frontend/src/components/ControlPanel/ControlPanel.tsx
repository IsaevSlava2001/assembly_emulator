import React from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { useEmulatorStore } from '../../store/emulatorStore';
import './ControlPanel.css';

export const ControlPanel: React.FC = () => {
  const { executeStep, executeAll, reset } = useEmulatorStore();

  return (
    <Card title="Управление" className="control-card">
      <div className="control-buttons">
        <Button
          label="Следующий шаг"
          icon="pi pi-step-forward"
          className="p-button-raised"
          onClick={executeStep}
        />

        <Button
          label="Выполнить целиком"
          icon="pi pi-play"
          className="p-button-raised p-button-success"
          onClick={executeAll}
        />

        <Button
          label="Компилировать"
          icon="pi pi-cog"
          className="p-button-raised p-button-info"
        />

        <Button
          label="Выход"
          icon="pi pi-times"
          className="p-button-raised p-button-danger"
          onClick={reset}
        />
      </div>
    </Card>
  );
};