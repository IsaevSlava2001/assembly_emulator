export interface Task {
    id: number;
    title: string;
    description: string;
}

export interface Command {
    opcode: string;
    description: string;
}

export interface ProcessorState {
    stack: number[];
    programCounter: number;
    currentCommand: string;
    flags: {
        zero: boolean;
        carry: boolean;
        overflow: boolean;
    };
}

export interface MemoryState {
    ram: number[];
    history: {
        timestamp: number;
        stack: number[];
        ram: number[];
        programCounter: number;
        command: string;
    }[];
}

export interface EmulatorState {
    processor: ProcessorState;
    memory: MemoryState;
    sourceCode: string;
    machineCode: string[];
    currentTask: Task | null;
}
