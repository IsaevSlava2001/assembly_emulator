import { create } from 'zustand';
import type { EmulatorState, TaskInfo } from '../types/emulator';
import { apiService } from '../services/api';

const initialState: EmulatorState = {
    processor: {
        program_counter: 0,
        stack: [],
        flags: {
            zero: false,
            carry: false,
            overflow: false,
        },
        current_command: '',
        is_halted: false,
    },
    memory: {
        ram: [],
        history: [],
    },
    source_code: '',
    machine_code: [],
    current_task: null,
};

export const useEmulatorStore = create<{
    state: EmulatorState;
    tasks: TaskInfo[];
    loading: boolean;
    error: string | null;
    current_task: number | null;
    setSourceCode: (code: string) => void;
    setCurrentTask: (taskId: number | null) => void;
    loadState: () => Promise<void>;
    loadTasks: () => Promise<void>;
    compileCode: (code: string) => Promise<void>;
    executeCode: (taskId?: number) => Promise<void>;
    executeStep: () => Promise<void>;
    executeRemaining: () => Promise<void>;
    reset: () => Promise<void>;
    setState: (newState: EmulatorState) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    loadTask2Data: () => Promise<void>;
}>((set, get) => ({
    state: initialState,
    tasks: [],
    loading: false,
    error: null,
    current_task: null,

    setSourceCode: (code) => set((state) => ({
        state: { ...state.state, source_code: code }
    })),

    setCurrentTask: async (taskId) => {
        set((state) => ({
            state: { ...state.state, current_task: taskId },
            current_task: taskId
        }));

        // Если выбрана задача, загружаем её данные
        if (taskId) {
            try {
                console.log('Загружаем данные задачи', taskId);
                const result = await apiService.loadTask(taskId);
                if (result.success) {
                    set({ state: result.state });
                    console.log('Данные задачи загружены:', result.state);
                }
            } catch (error) {
                console.warn('Не удалось загрузить данные задачи:', error);
            }
        }
    },

    setState: (newState) => set({ state: newState }),
    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error }),

    loadTask2Data: async () => {
        try {
            set({ loading: true, error: null });
            console.log('Загружаем данные для задачи 2');
            const result = await apiService.loadTask(2);
            if (result.success) {
                set({ 
                    state: result.state, 
                    current_task: 2,
                    loading: false 
                });
                console.log('Данные задачи 2 загружены:', result.state);
            } else {
                set({ error: 'Ошибка загрузки данных задачи 2', loading: false });
            }
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : 'Ошибка загрузки данных задачи 2',
                loading: false
            });
        }
    },

    loadState: async () => {
        try {
            set({ loading: true, error: null });
            const state = await apiService.getState();
            set({ state, loading: false });
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : 'Ошибка загрузки состояния',
                loading: false
            });
        }
    },

    loadTasks: async () => {
        try {
            set({ loading: true, error: null });
            const tasks = await apiService.getTasks();
            set({ tasks, loading: false });
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : 'Ошибка загрузки задач',
                loading: false
            });
        }
    },

    compileCode: async (code: string) => {
        try {
            set({ loading: true, error: null });
            const result = await apiService.compileCode(code);
            if (result.success) {
                set((state) => ({
                    state: {
                        ...state.state,
                        source_code: code,
                        machine_code: result.machine_code
                    },
                    loading: false
                }));
            } else {
                set({ error: 'Ошибка компиляции', loading: false });
            }
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : 'Ошибка компиляции',
                loading: false
            });
        }
    },

    executeCode: async (taskId?: number) => {
        try {
            set({ loading: true, error: null });

            // Если taskId не указан, используем текущий исходный код
            const request = taskId
                ? { task_id: taskId, step_by_step: false }
                : { task_id: null, step_by_step: false, source_code: get().state.source_code };

            const result = await apiService.executeCode(request);
            if (result.success) {
                set({ state: result.state, loading: false });
            } else {
                set({ error: 'Ошибка выполнения', loading: false });
            }
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : 'Ошибка выполнения',
                loading: false
            });
        }
    },

    executeStep: async () => {
        try {
            set({ loading: true, error: null });

            // Если выбрана задача, но данные не загружены, загружаем их
            const state = get().state;
            const current_task = get().current_task;
            if (current_task && state.memory.ram.length === 0) {
                console.log('Загружаем данные задачи', current_task);
                const result = await apiService.loadTask(current_task);
                if (result.success) {
                    set({ state: result.state, loading: false });
                    return;
                }
            }

            const result = await apiService.executeStep();
            if (result.success) {
                set({ state: result.state, loading: false });
                console.log('Шаг выполнен:', result.state);
            } else {
                set({ error: 'Ошибка выполнения шага', loading: false });
            }
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : 'Ошибка выполнения шага',
                loading: false
            });
        }
    },

    executeRemaining: async () => {
        try {
            set({ loading: true, error: null });

            // Если выбрана задача, но данные не загружены, загружаем их
            const state = get().state;
            const current_task = get().current_task;
            if (current_task && state.memory.ram.length === 0) {
                console.log('Загружаем данные задачи', current_task);
                const result = await apiService.loadTask(current_task);
                if (result.success) {
                    set({ state: result.state, loading: false });
                    return;
                }
            }

            console.log('Выполняем оставшиеся команды...');

            let stepCount = 0;
            const maxSteps = 1000; // Защита от бесконечного цикла
            let lastState = null;

            while (stepCount < maxSteps) {
                const result = await apiService.executeStep();

                if (!result.success) {
                    set({ error: 'Ошибка выполнения команды', loading: false });
                    return;
                }

                stepCount++;
                lastState = result.state;
                console.log(`Шаг ${stepCount}: Счетчик ${result.state.processor.program_counter}, Стек ${result.state.processor.stack}`);

                // Если программа остановлена, выходим из цикла
                if (result.state.processor.is_halted) {
                    console.log('Программа остановлена');
                    break;
                }

                // Если больше нет команд для выполнения
                if (!result.continues) {
                    console.log('Нет больше команд для выполнения');
                    break;
                }

                // Быстрое выполнение без задержки для лучшей производительности
                // await new Promise(resolve => setTimeout(resolve, 50));
            }

            // Обновляем финальное состояние
            if (lastState) {
                set({ state: lastState, loading: false });
            } else {
                set({ loading: false });
            }

            console.log(`Выполнено ${stepCount} шагов. Финальный результат:`, lastState);

        } catch (error) {
            set({
                error: error instanceof Error ? error.message : 'Ошибка выполнения оставшихся команд',
                loading: false
            });
        }
    },

    reset: async () => {
        try {
            set({ loading: true, error: null });
            const result = await apiService.reset();
            if (result.success) {
                set({
                    state: result.state,
                    loading: false,
                    error: null
                });
                console.log('Процессор сброшен:', result.state);
            } else {
                set({ error: 'Ошибка сброса', loading: false });
            }
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : 'Ошибка сброса',
                loading: false
            });
        }
    },
}));
