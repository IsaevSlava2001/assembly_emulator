// ADD: Command editor component for assembly code input and display
import React, { useState } from 'react';
import { Card } from 'primereact/card';
import { InputTextarea } from 'primereact/inputtextarea';
import { Button } from 'primereact/button';
import { TabView, TabPanel } from 'primereact/tabview';
import { useEmulatorStore } from '../../store/emulatorStore';
import './CommandEditor.css';

export const CommandEditor: React.FC = () => {
  const { state, setSourceCode } = useEmulatorStore();
  const [assemblyCode, setAssemblyCode] = useState(state.sourceCode);

  const handleCodeChange = (code: string) => {
    setAssemblyCode(code);
    setSourceCode(code);
  };

  const handleCompile = () => {
    // TODO: Implement compilation logic
    console.log('Compiling assembly code:', assemblyCode);
  };

  const samplePrograms = {
    sumArray: `; Сумма элементов массива
PUSH [0x1000]    ; Загружаем размер массива
PUSH 0           ; Инициализируем аккумулятор

LOOP:
  DUP            ; Дублируем счетчик
  JZ EXIT        ; Если счетчик = 0, выходим
  DEC            ; Уменьшаем счетчик
  SWAP           ; Меняем счетчик и аккумулятор местами
  
  ; Загружаем следующий элемент массива
  PUSH [0x1001]  ; Базовый адрес массива
  ADD            ; Добавляем смещение
  LOAD           ; Загружаем значение элемента
  
  ADD            ; Добавляем к аккумулятору
  SWAP           ; Возвращаем счетчик на вершину
  JMP LOOP       ; Повторяем цикл

EXIT:
  POP            ; Убираем счетчик со стека
  PUSH [0x1100]  ; Адрес для результата
  STORE          ; Сохраняем результат
  HALT           ; Завершаем выполнение`,

    convolution: `; Свертка двух массивов
PUSH [0x1000]    ; Размер массива A
PUSH [0x1010]    ; Размер массива B
PUSH 0           ; Инициализируем результат

CONV_LOOP:
  DUP            ; Дублируем счетчик
  JZ CONV_EXIT   ; Если счетчик = 0, выходим
  DEC            ; Уменьшаем счетчик
  
  ; Загружаем элементы массивов
  PUSH [0x1001]  ; Базовый адрес A
  ADD            ; Добавляем смещение
  LOAD           ; Загружаем A[i]
  
  PUSH [0x1011]  ; Базовый адрес B
  ADD            ; Добавляем смещение
  LOAD           ; Загружаем B[i]
  
  MUL            ; Умножаем A[i] * B[i]
  ADD            ; Добавляем к результату
  JMP CONV_LOOP  ; Повторяем цикл

CONV_EXIT:
  POP            ; Убираем счетчик со стека
  PUSH [0x1100]  ; Адрес для результата
  STORE          ; Сохраняем результат
  HALT           ; Завершаем выполнение`
  };

  return (
    <Card title="Редактор команд" className="command-editor-card">
      <TabView className="command-tabs">
        <TabPanel header="Ассемблер" leftIcon="pi pi-code">
          <div className="code-editor">
            <InputTextarea
              value={assemblyCode}
              onChange={(e) => handleCodeChange(e.target.value)}
              rows={15}
              className="assembly-input"
              placeholder="Введите код на ассемблере..."
            />
            <div className="editor-actions">
              <Button
                label="Компилировать"
                icon="pi pi-cog"
                className="p-button-raised p-button-info"
                onClick={handleCompile}
              />
              <Button
                label="Очистить"
                icon="pi pi-trash"
                className="p-button-raised p-button-secondary"
                onClick={() => handleCodeChange('')}
              />
            </div>
          </div>
        </TabPanel>
        
        <TabPanel header="Примеры" leftIcon="pi pi-file">
          <div className="sample-programs">
            <div className="program-section">
              <h4>Сумма элементов массива</h4>
              <Button
                label="Загрузить пример"
                icon="pi pi-download"
                className="p-button-outlined p-button-sm"
                onClick={() => handleCodeChange(samplePrograms.sumArray)}
              />
            </div>
            <div className="program-section">
              <h4>Свертка двух массивов</h4>
              <Button
                label="Загрузить пример"
                icon="pi pi-download"
                className="p-button-outlined p-button-sm"
                onClick={() => handleCodeChange(samplePrograms.convolution)}
              />
            </div>
          </div>
        </TabPanel>
        
        <TabPanel header="Справка" leftIcon="pi pi-question-circle">
          <div className="help-content">
            <h4>Доступные команды:</h4>
            <div className="command-list">
              <div className="command-group">
                <h5>Пересылка данных</h5>
                <ul>
                  <li><code>PUSH &lt;value&gt;</code> - поместить значение на стек</li>
                  <li><code>POP</code> - извлечь значение со стека</li>
                  <li><code>DUP</code> - дублировать верхний элемент стека</li>
                  <li><code>SWAP</code> - поменять местами два верхних элемента</li>
                </ul>
              </div>
              <div className="command-group">
                <h5>Арифметические операции</h5>
                <ul>
                  <li><code>ADD</code> - сложение</li>
                  <li><code>SUB</code> - вычитание</li>
                  <li><code>MUL</code> - умножение</li>
                  <li><code>DIV</code> - деление</li>
                  <li><code>INC</code> - инкремент</li>
                  <li><code>DEC</code> - декремент</li>
                </ul>
              </div>
              <div className="command-group">
                <h5>Управление выполнением</h5>
                <ul>
                  <li><code>JMP &lt;label&gt;</code> - безусловный переход</li>
                  <li><code>JZ &lt;label&gt;</code> - переход если ноль</li>
                  <li><code>JNZ &lt;label&gt;</code> - переход если не ноль</li>
                  <li><code>HALT</code> - остановка выполнения</li>
                </ul>
              </div>
            </div>
          </div>
        </TabPanel>
      </TabView>
    </Card>
  );
};
