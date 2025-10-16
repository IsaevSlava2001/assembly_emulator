"""
FastAPI приложение для эмулятора стекового процессора
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from typing import List, Dict, Any

from .models import (
    EmulatorState, CompileRequest, LoadTaskRequest, ExecuteRequest, ResetRequest, 
    TaskInfo, TaskData
)
from .processor import StackProcessor
from .assembler import Assembler
from .tasks import TaskManager

# Глобальные объекты
processor = None
assembler = None
task_manager = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Инициализация при запуске приложения"""
    global processor, assembler, task_manager
    
    processor = StackProcessor()
    assembler = Assembler()
    task_manager = TaskManager()
    
    yield
    
    # Очистка при завершении
    processor = None
    assembler = None
    task_manager = None

app = FastAPI(
    title="Эмулятор стекового процессора",
    description="Backend для эмулятора стекового процессора с Гарвардской архитектурой",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    """Корневой endpoint"""
    return {"message": "Эмулятор стекового процессора API"}

@app.get("/api/state", response_model=EmulatorState)
async def get_state():
    """Получить текущее состояние эмулятора"""
    if not processor:
        raise HTTPException(status_code=500, detail="Processor not initialized")
    
    state = processor.get_state()
    return EmulatorState(**state)

@app.post("/api/compile")
async def compile_code(request: CompileRequest):
    """Скомпилировать исходный код"""
    if not assembler or not processor:
        raise HTTPException(status_code=500, detail="Assembler or Processor not initialized")
    
    try:
        print(request.source_code)
        machine_code, labels = assembler.assemble(request.source_code)
        
        # Загружаем программу в процессор для пошагового выполнения
        processor.load_program(machine_code, request.source_code)
        
        print(machine_code)
        return {
            "success": True,
            "machine_code": machine_code,
            "labels": labels,
            "message": "Код успешно скомпилирован"
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Ошибка компиляции: {str(e)}")

@app.post("/api/load-task")
async def load_task(request: LoadTaskRequest):
    """Загрузить данные задачи без выполнения программы"""
    if not processor or not assembler:
        raise HTTPException(status_code=500, detail="Processor not initialized")
    
    try:
        task = task_manager.get_task(request.task_id)
        if not task:
            raise HTTPException(status_code=404, detail=f"Задача {request.task_id} не найдена")
        
        print(f"Loading task {request.task_id}")
        print(f"Memory before setup: {processor.memory.ram[0x100:0x120]}")
        
        # Настраиваем данные для задачи
        print(f"Calling setup_task_data for task {request.task_id}")
        task_manager.setup_task_data(processor, request.task_id)
        print(f"setup_task_data completed")
        
        print(f"Memory after setup: {processor.memory.ram[0x100:0x120]}")
        
        # Компилируем и загружаем программу (но не выполняем)
        machine_code, _ = assembler.assemble(task["program"])
        processor.load_program(machine_code, task["program"])
        
        print(f"Memory after load_program: {processor.memory.ram[0x100:0x120]}")
        
        # Проверяем, что данные все еще в памяти
        print(f"Final memory check: {processor.memory.ram[0x100:0x120]}")
        
        # Устанавливаем current_task в состоянии процессора
        processor.processor.current_task = request.task_id
        
        return {
            "success": True,
            "state": processor.get_state(),
            "message": f"Данные задачи {request.task_id} загружены"
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Ошибка загрузки задачи: {str(e)}")

@app.post("/api/execute")
async def execute_code(request: ExecuteRequest):
    """Выполнить код"""
    if not processor or not assembler:
        raise HTTPException(status_code=500, detail="Processor not initialized")
    
    try:
        if request.task_id and request.task_id > 0:
            # Выполнение предустановленной задачи
            task = task_manager.get_task(request.task_id)
            if not task:
                raise HTTPException(status_code=404, detail=f"Задача {request.task_id} не найдена")
            
            # Настраиваем данные для задачи
            task_manager.setup_task_data(processor, request.task_id)
            
            # Компилируем и загружаем программу
            machine_code, _ = assembler.assemble(task["program"])
            processor.load_program(machine_code, task["program"])
            
            # Выполняем инструкции пошагово для сохранения истории
            while not processor.processor.is_halted:
                success = processor.step()
                if not success:
                    break
            
            # Проверяем результат
            result = task_manager.verify_task_result(processor, request.task_id)
            
            return {
                "success": True,
                "task_id": request.task_id,
                "result": result,
                "state": processor.get_state()
            }
        else:
            # Выполнение пользовательского кода
            if not request.source_code:
                raise HTTPException(status_code=400, detail="Не указан исходный код для выполнения")
            
            machine_code, _ = assembler.assemble(request.source_code)
            processor.load_program(machine_code, request.source_code)
            
            # Выполняем инструкции пошагово для сохранения истории
            while not processor.processor.is_halted:
                success = processor.step()
                if not success:
                    break
            
            return {
                "success": True,
                "state": processor.get_state()
            }
    
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Ошибка выполнения: {str(e)}")

@app.post("/api/step")
async def execute_step():
    """Выполнить один шаг"""
    if not processor:
        raise HTTPException(status_code=500, detail="Processor not initialized")
    
    try:
        # Выполняем один шаг программы
        success = processor.step()
        
        return {
            "success": True,
            "state": processor.get_state(),
            "continues": success
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Ошибка выполнения шага: {str(e)}")

@app.post("/api/reset")
async def reset_processor():
    """Сбросить процессор"""
    if not processor:
        raise HTTPException(status_code=500, detail="Processor not initialized")
    
    processor.reset()
    return {
        "success": True,
        "message": "Процессор сброшен",
        "state": processor.get_state()
    }

@app.get("/api/tasks", response_model=List[TaskInfo])
async def get_tasks():
    """Получить список задач"""
    if not task_manager:
        raise HTTPException(status_code=500, detail="Task manager not initialized")
    
    tasks = task_manager.get_all_tasks()
    return [TaskInfo(**task) for task in tasks]

@app.get("/api/tasks/{task_id}", response_model=TaskInfo)
async def get_task(task_id: int):
    """Получить информацию о задаче"""
    if not task_manager:
        raise HTTPException(status_code=500, detail="Task manager not initialized")
    
    task = task_manager.get_task(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Задача не найдена")
    
    return TaskInfo(**task)

@app.get("/api/tasks/{task_id}/program")
async def get_task_program(task_id: int):
    """Получить программу задачи"""
    if not task_manager:
        raise HTTPException(status_code=500, detail="Task manager not initialized")
    
    task = task_manager.get_task(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Задача не найдена")
    
    return {
        "task_id": task_id,
        "program": task.get("program", ""),
        "test_data": task.get("test_data", [])
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)