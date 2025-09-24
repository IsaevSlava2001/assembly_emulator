import { create } from 'zustand';
import type { EmulatorState } from '../types/emulator';

const initialState: EmulatorState = {
    processor: {
        stack: [],
        programCounter: 0,
        currentCommand: '',
        flags: {
            zero: false,
            carry: false,
            overflow: false,
        },
    },
    memory: {
        ram: [],
        history: [],
    },
    sourceCode: '',
    machineCode: [],
    currentTask: null,
};

export const useEmulatorStore = create<{
    state: EmulatorState;
    setSourceCode: (code: string) => void;
    setCurrentTask: (taskId: number) => void;
    executeStep: () => void;
    executeAll: () => void;
    reset: () => void;
}>((set) => ({
    state: initialState,
    setSourceCode: (code) => set((state) => ({ state: { ...state.state, sourceCode: code } })),
    setCurrentTask: (taskId) => {
        const tasks = [
            {
                id: 1,
                title: "Сумма элементов массива",
                description: "Вычислить сумму всех элементов массива из 6-15 элементов. Массив хранится в памяти начиная с адреса 0x1000, где первый элемент - размер массива."
            },
            {
                id: 2,
                title: "Свертка двух массивов",
                description: "Вычислить свертку двух массивов по 10 элементов каждый. Результат сохранить в память по адресу 0x1100."
            }
        ];

        const task = tasks.find(t => t.id === taskId);
        if (task) {
            set((state) => ({ state: { ...state.state, currentTask: task } }));
        }
    },
    executeStep: () => {
        // TODO: Implement single step execution
    },
    executeAll: () => {
        // TODO: Implement full program execution
    },
    reset: () => set({ state: initialState }),
}));
