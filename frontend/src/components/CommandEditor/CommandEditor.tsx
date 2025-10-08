// ADD: Command editor component for assembly code input and display
import React, { useState } from 'react';
import { Card, Button, Textarea } from 'flowbite-react';
import { useEmulatorStore } from '../../store/emulatorStore';
import { apiService } from '../../services/api';
import './CommandEditor.css';

export const CommandEditor: React.FC = () => {
  const { state, setSourceCode, compileCode, loading, error, current_task } = useEmulatorStore();
  const [assemblyCode, setAssemblyCode] = useState(state.source_code);
  const [activeTab, setActiveTab] = useState<'editor' | 'examples'>('editor');
  const [exampleCode, setExampleCode] = useState<string>('');
  const [loadingExample, setLoadingExample] = useState(false);

  const handleCodeChange = (code: string) => {
    setAssemblyCode(code);
    setSourceCode(code);
  };

  const handleCompile = async () => {
    await compileCode(assemblyCode);
  };

  const handleLoadExample = async () => {
    if (!current_task) return;
    
    try {
      setLoadingExample(true);
      const result = await apiService.getTaskProgram(current_task);
      setExampleCode(result.program);
      setActiveTab('examples');
    } catch (error) {
      console.error('Ошибка загрузки примера:', error);
    } finally {
      setLoadingExample(false);
    }
  };

  const handleInsertExample = () => {
    setAssemblyCode(exampleCode);
    setSourceCode(exampleCode);
    setActiveTab('editor');
  };

  return (
    <Card className="glass-card p-6">
      <div className="flex items-center justify-between mb-6">
        <h5 className="text-xl font-bold text-white-900 font-heading">Редактор команд</h5>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-600">Редактирование</span>
        </div>
      </div>

      <div className="space-y-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button 
              className={`border-b-2 py-2 px-1 text-sm font-medium ${
                activeTab === 'editor' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('editor')}
            >
              Ассемблер
            </button>
            <button 
              className={`border-b-2 py-2 px-1 text-sm font-medium ${
                activeTab === 'examples' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('examples')}
            >
              Примеры
            </button>
            <button className="border-b-2 border-transparent py-2 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300">
              Справка
            </button>
          </nav>
        </div>

        {activeTab === 'editor' ? (
          <div className="space-y-4">
            <Textarea
              value={assemblyCode}
              onChange={(e) => handleCodeChange(e.target.value)}
              rows={15}
              className="font-mono text-sm"
              placeholder="Введите код на ассемблере..."
            />
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}
            
            <div className="flex space-x-3">
              <Button
                color="info"
                size="sm"
                onClick={handleCompile}
                disabled={loading}
                className="flex items-center space-x-2"
              >
                {loading ? (
                  <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
                {loading ? 'Компиляция...' : 'Компилировать'}
              </Button>
              <Button
                color="light"
                size="sm"
                onClick={() => handleCodeChange('')}
                className="flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Очистить
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-lg font-semibold text-blue-900 font-heading">
                  Пример кода для задачи
                </h4>
                <Button
                  color="info"
                  size="sm"
                  onClick={handleLoadExample}
                  disabled={loadingExample || !current_task}
                  className="flex items-center space-x-2"
                >
                  {loadingExample ? (
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                  )}
                  {loadingExample ? 'Загрузка...' : 'Загрузить пример'}
                </Button>
              </div>
              <p className="text-blue-800 text-sm mb-4 font-body">
                {current_task 
                  ? 'Выберите задачу и нажмите "Загрузить пример" для получения готового кода'
                  : 'Сначала выберите задачу в панели "Задания"'
                }
              </p>
            </div>

            {exampleCode && (
              <div className="space-y-4">
                <Textarea
                  value={exampleCode}
                  readOnly
                  rows={15}
                  className="font-mono text-sm bg-gray-50"
                  placeholder="Код примера появится здесь..."
                />
                <div className="flex space-x-3">
                  <Button
                    color="success"
                    size="sm"
                    onClick={handleInsertExample}
                    className="flex items-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                    </svg>
                    Вставить в редактор
                  </Button>
                  <Button
                    color="light"
                    size="sm"
                    onClick={() => setExampleCode('')}
                    className="flex items-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Очистить
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};
