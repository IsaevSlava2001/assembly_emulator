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
    program_counter: number;
    current_command: string;
    flags: {
        zero: boolean;
        carry: boolean;
        overflow: boolean;
    };
    is_halted: boolean;
}

export interface MemoryState {
    ram: number[];
    history: any[];
}

export interface EmulatorState {
    processor: ProcessorState;
    memory: MemoryState;
    source_code: string;
    machine_code: string[];
    current_task: number | null;
}

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

export interface CompileRequest {
    source_code: string;
}

export interface ExecuteRequest {
    task_id?: number;
    step_by_step?: boolean;
}

export interface TaskInfo {
    id: number;
    title: string;
    description: string;
}
