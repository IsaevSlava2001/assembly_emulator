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
    setCurrentTask: (taskId: number) => void;
    loadState: () => Promise<void>;
    loadTasks: () => Promise<void>;
    compileCode: (code: string) => Promise<void>;
    executeCode: (taskId?: number) => Promise<void>;
    executeStep: () => Promise<void>;
    reset: () => Promise<void>;
    setState: (newState: EmulatorState) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
}>((set, get) => ({
    state: initialState,
    tasks: [],
    loading: false,
    error: null,
    current_task: null,

    setSourceCode: (code) => set((state) => ({
        state: { ...state.state, source_code: code }
    })),

    setCurrentTask: (taskId) => set((state) => ({
        state: { ...state.state, current_task: taskId },
        current_task: taskId
    })),

    setState: (newState) => set({ state: newState }),
    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error }),

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
            const result = await apiService.executeCode({ task_id: taskId });
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

    reset: async () => {
        try {
            set({ loading: true, error: null });
            const result = await apiService.reset();
            if (result.success) {
                set({ state: result.state, loading: false });
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
