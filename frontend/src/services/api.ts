import type { EmulatorState, ExecuteRequest, TaskInfo } from '../types/emulator';

const API_BASE_URL = 'http://localhost:8000';

class ApiService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('HTTP Error:', response.status, errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      return response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Не удается подключиться к серверу. Убедитесь, что backend запущен на http://localhost:8000');
      }
      throw error;
    }
  }

  // Получить состояние эмулятора
  async getState(): Promise<EmulatorState> {
    return this.request<EmulatorState>('/api/state');
  }

  // Компилировать код
  async compileCode(sourceCode: string): Promise<{ success: boolean; machine_code: string[]; labels: any }> {
    console.log('Отправляем запрос на компиляцию:', { source_code: sourceCode });
    return this.request('/api/compile', {
      method: 'POST',
      body: JSON.stringify({ source_code: sourceCode }),
    });
  }

  // Загрузить данные задачи
  async loadTask(taskId: number): Promise<{ success: boolean; state: EmulatorState; message?: string }> {
    return this.request('/api/load-task', {
      method: 'POST',
      body: JSON.stringify({ task_id: taskId }),
    });
  }

  // Выполнить код
  async executeCode(request: ExecuteRequest): Promise<{ success: boolean; state: EmulatorState; result?: any }> {
    return this.request('/api/execute', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // Выполнить один шаг
  async executeStep(): Promise<{ success: boolean; state: EmulatorState; continues?: boolean }> {
    return this.request('/api/step', {
      method: 'POST',
    });
  }

  // Сбросить процессор
  async reset(): Promise<{ success: boolean; state: EmulatorState }> {
    return this.request('/api/reset', {
      method: 'POST',
      body: JSON.stringify({}),
    });
  }

  // Получить список задач
  async getTasks(): Promise<TaskInfo[]> {
    return this.request<TaskInfo[]>('/api/tasks');
  }

  // Получить информацию о задаче
  async getTask(taskId: number): Promise<TaskInfo> {
    return this.request<TaskInfo>(`/api/tasks/${taskId}`);
  }

  // Получить программу задачи
  async getTaskProgram(taskId: number): Promise<{ task_id: number; program: string; test_data: number[] }> {
    return this.request(`/api/tasks/${taskId}/program`);
  }
}

export const apiService = new ApiService();
