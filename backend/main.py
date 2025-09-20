"""
FastAPI сервис для эмулятора безадресной стековой архитектуры
"""
from fastapi import FastAPI, HTTPException, UploadFile, File, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any
import json
import io
from emulator import StackEmulator, OpCode

# Модели данных для API
class ProgramRequest(BaseModel):
    """Модель запроса для загрузки программы"""
    instructions: List[int] = Field(...,
        description="Список инструкций в виде 32-битных чисел",
        example=[1296, 784, 1, 153])
    instruction_preview: Optional[List[int]] = Field(default=[],
                                      description="Список инструкций в виде 0x...",
                                      example=[0xf10, 0x1, 0x2])
    data: Optional[List[int]] = Field(default=[],
        description="Начальные данные для памяти данных",
        example=[10, 20, 30, 40, 50])
    data_start_addr: Optional[int] = Field(default=0,
        description="Начальный адрес для размещения данных",
        example=0)

class InstructionRequest(BaseModel):
    """Модель запроса для добавления одной инструкции"""
    instruction: int = Field(...,
        description="32-битная инструкция (код операции + операнд)",
        example=1296)

class ExecutionRequest(BaseModel):
    """Модель запроса для выполнения программы"""
    max_cycles: Optional[int] = Field(default=10000,
        description="Максимальное количество циклов выполнения",
        example=10000)

class BinaryConversionRequest(BaseModel):
    """Модель запроса для преобразования ассемблерного кода"""
    assembly_code: str = Field(...,
        description="Ассемблерный код (одна команда на строку)",
        example="PUSH 5\nPUSH 3\nADD\nHALT")

class StateResponse(BaseModel):
    """Модель ответа с состоянием эмулятора"""
    stack: List[int] = Field(..., description="Содержимое стека данных")
    data_memory: List[int] = Field(..., description="Память данных (первые 50 ячеек)")
    instruction_memory: List[int] = Field(..., description="Память команд")
    instruction_preview: List[str] = Field(..., description="Память команд в формате hex")
    pc: int = Field(..., description="Счетчик команд (Program Counter)")
    sp: int = Field(..., description="Указатель стека (Stack Pointer)")
    flags: Dict[str, bool] = Field(..., description="Флаги процессора")
    halted: bool = Field(..., description="Флаг остановки выполнения")
    error: Optional[str] = Field(..., description="Сообщение об ошибке (если есть)")
    cycles: int = Field(..., description="Количество выполненных циклов")

class MemoryValueRequest(BaseModel):
    """Модель для установки значения в памяти"""
    value: int = Field(..., description="Значение для записи в ячейку памяти", example=42)

# Определяем теги для группировки endpoints
tags_metadata = [
    {
        "name": "Управление эмулятором",
        "description": "Основные операции управления состоянием эмулятора",
    },
    {
        "name": "Загрузка программ",
        "description": "Загрузка программ из различных источников",
    },
    {
        "name": "Выполнение программ",
        "description": "Запуск и пошаговое выполнение программ",
    },
    {
        "name": "Ассемблер и команды",
        "description": "Работа с ассемблером и информация о командах",
    },
    {
        "name": "Память и отладка",
        "description": "Инструменты для отладки и работы с памятью",
    },
    {
        "name": "Ручное управление",
        "description": "Ручное добавление инструкций и управление",
    }
]


def parse_text_program(content_str):
    """Парсинг программы из текстового формата с поддержкой команда[TAB]значение"""
    lines = content_str.strip().split('\n')
    instructions = []

    for line_num, line in enumerate(lines, 1):
        line = line.strip()

        # Пропускаем пустые строки и комментарии
        if not line or line.startswith('#'):
            continue

        try:
            # Проверяем формат "команда[tab]значение"
            if '\t' in line:
                parts = line.split('\t')
                cmd = parts[0].strip().upper()
                value = parts[1].strip() if len(parts) > 1 and parts[1].strip() else None

                # Трансляция команд с операндами
                if cmd == "PUSH" and value is not None:
                    val = int(value)
                    instructions.append(OpCode.PUSH.value | (val << 8))
                elif cmd in ["JMP", "JZ", "JNZ", "JL", "JG", "JLE", "JGE"] and value is not None:
                    addr = int(value)
                    opcode_map = {
                        "JMP": OpCode.JMP, "JZ": OpCode.JZ, "JNZ": OpCode.JNZ,
                        "JL": OpCode.JL, "JG": OpCode.JG, "JLE": OpCode.JLE, "JGE": OpCode.JGE
                    }
                    instructions.append(opcode_map[cmd].value | (addr << 8))
                else:
                    # Команды без операндов
                    opcode_map = {
                        "ADD": OpCode.ADD, "SUB": OpCode.SUB, "MUL": OpCode.MUL, "DIV": OpCode.DIV,
                        "AND": OpCode.AND, "OR": OpCode.OR, "XOR": OpCode.XOR, "NOT": OpCode.NOT,
                        "CMP": OpCode.CMP, "POP": OpCode.POP, "DUP": OpCode.DUP, "SWAP": OpCode.SWAP,
                        "LOAD": OpCode.LOAD, "STORE": OpCode.STORE, "HALT": OpCode.HALT, "NOP": OpCode.NOP
                    }
                    if cmd in opcode_map:
                        instructions.append(opcode_map[cmd].value)
                    else:
                        raise ValueError(f"Неизвестная команда: {cmd}")
            else:
                # Старый формат - только числа или команды без табуляции
                if line.startswith('0x'):
                    instructions.append(int(line, 16))
                elif line.isdigit() or (line.startswith('-') and line[1:].isdigit()):
                    instructions.append(int(line))
                else:
                    # Попробуем как команду без операнда
                    cmd = line.upper()
                    opcode_map = {
                        "ADD": OpCode.ADD, "SUB": OpCode.SUB, "MUL": OpCode.MUL, "DIV": OpCode.DIV,
                        "AND": OpCode.AND, "OR": OpCode.OR, "XOR": OpCode.XOR, "NOT": OpCode.NOT,
                        "CMP": OpCode.CMP, "POP": OpCode.POP, "DUP": OpCode.DUP, "SWAP": OpCode.SWAP,
                        "LOAD": OpCode.LOAD, "STORE": OpCode.STORE, "HALT": OpCode.HALT, "NOP": OpCode.NOP
                    }
                    if cmd in opcode_map:
                        instructions.append(opcode_map[cmd].value)
                    else:
                        raise ValueError(f"Неизвестная команда или неверный формат: {line}")

        except ValueError as e:
            raise ValueError(f"Ошибка в строке {line_num} ('{line}'): {e}")

    return instructions

# Создаем FastAPI приложение
app = FastAPI(
    title="🖥️ API эмулятора безадресной стековой архитектуры",
    description="""
## Описание
Полнофункциональный эмулятор безадресной стековой архитектуры с раздельной памятью данных и команд.

## Возможности
- 🔄 Пошаговое выполнение программ
- 🚀 Автоматическое выполнение до остановки
- 💾 Работа с памятью данных и команд
- 🔧 Встроенный ассемблер
- 📊 Полная отладочная информация
- 📁 Загрузка программ из файлов
- 🎯 Предзагруженные примеры программ

## Архитектура
- **24 команды**: арифметика, логика, переходы, работа с памятью
- **Стек данных**: основное хранилище операндов
- **Память данных**: 30 ячеек для данных программы
- **Память команд**: 30 ячеек для инструкций
- **Флаги**: zero, negative, overflow, carry

## Формат инструкций
Каждая инструкция - 32-битное число:
- Биты 0-7: код операции
- Биты 8-31: операнд (если нужен)

Пример: `0x510` = `PUSH 5` (0x10 - PUSH, 0x5 - значение)
    """,
    version="2.0.0",
    openapi_tags=tags_metadata,
    contact={
        "name": "Разработчик эмулятора",
        "email": "IsaevSlava.2001@yandex.ru",
    },
    license_info={
        "name": "MIT License",
    }
)

# Добавляем CORS middleware для поддержки фронтенда
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # В продакшене ограничить конкретными доменами
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Глобальный экземпляр эмулятора
emulator = StackEmulator()

# Предзагруженные программы
PRELOADED_PROGRAMS = {
    "simple_math": {
        "name": "Простая математика: (5 + 3) * 2",
        "description": "Демонстрация базовых арифметических операций",
        "instructions": [
            (OpCode.PUSH.value | (5 << 8)),     # PUSH 5
            (OpCode.PUSH.value | (3 << 8)),     # PUSH 3
            OpCode.ADD.value,                    # ADD (результат: 8)
            (OpCode.PUSH.value | (2 << 8)),     # PUSH 2
            OpCode.MUL.value,                    # MUL (результат: 16)
            OpCode.HALT.value                    # HALT
        ]
    },
    "factorial": {
        "name": "Вычисление факториала 5",
        "description": "Программа для вычисления факториала числа 5",
        "instructions": [
            OpCode.PUSH.value | (5 << 8),
            OpCode.PUSH.value | (0 << 8),
            OpCode.CMP.value,
            OpCode.JZ.value | (8 << 8),
            OpCode.DUP.value,
            OpCode.PUSH.value | (1 << 8),
            OpCode.SUB.value,
            OpCode.JMP.value | (1 << 8),
            OpCode.POP.value,
            OpCode.MUL.value,
            OpCode.MUL.value,
            OpCode.MUL.value,
            OpCode.MUL.value,
            OpCode.HALT.value                   # HALT
        ]
    },
    "task1": {
        "name": "Задание1",
        "description": "Поиск максимума в массиве",
        "instructions": [
        ]
    },
    "task2": {
        "name": "Задание 2",
        "description": "Свёртка двух массивов",
        "instructions": [
        ]
    },
}

@app.get("/",
    tags=["Управление эмулятором"],
    summary="Информация о сервисе",
    description="Получение основной информации об эмуляторе и его возможностях"
)
async def root():
    """
    ## Корневой endpoint

    Возвращает основную информацию о сервисе эмулятора, включая:
    - Название и версию API
    - Краткое описание возможностей
    - Ссылки на документацию
    """
    return {
        "message": "🖥️ API эмулятора безадресной стековой архитектуры",
        "version": "2.0.0",
        "description": "Эмулятор с раздельной памятью команд и данных",
        "features": [
            "24 команды процессора",
            "Пошаговое выполнение",
            "Встроенный ассемблер",
            "Работа с памятью",
            "Полная отладочная информация"
        ],
        "documentation": "/docs",
        "status": "✅ Готов к работе"
    }

@app.post("/reset",
    response_model=StateResponse,
    tags=["Управление эмулятором"],
    summary="Сброс эмулятора",
    description="Сброс эмулятора в начальное состояние с очисткой всех данных",
    status_code=status.HTTP_200_OK
)
async def reset_emulator():
    """
    ## Сброс эмулятора в начальное состояние

    Выполняет полный сброс эмулятора:
    - Очищает стек данных
    - Обнуляет память данных
    - Очищает память команд
    - Сбрасывает счетчики (PC, SP)
    - Очищает флаги процессора
    - Сбрасывает счетчик циклов

    **Результат:** Эмулятор готов к загрузке новой программы
    """
    emulator.reset()
    return StateResponse(**emulator.get_state())

@app.post("/load_program",
    response_model=StateResponse,
    tags=["Загрузка программ"],
    summary="Загрузка программы",
    description="Загрузка программы и начальных данных в эмулятор"
)
async def load_program(request: ProgramRequest):
    """
    ## Загрузка программы и данных в эмулятор

    Загружает программу в память команд и опционально данные в память данных.

    **Параметры:**
    - `instructions`: Массив 32-битных инструкций
    - `data`: Начальные данные для памяти данных (опционально)
    - `data_start_addr`: Начальный адрес размещения данных (по умолчанию 0)

    **Формат инструкции:**
    ```
    31    8 7     0
    [операнд][опкод]
    ```

    **Пример:** `0x510` = PUSH 5 (0x10 = PUSH, 0x5 = операнд)
    """
    try:
        emulator.reset()
        emulator.load_program(request.instructions)
        if request.data:
            emulator.load_data(request.data, request.data_start_addr)
        return StateResponse(**emulator.get_state())
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Ошибка загрузки программы: {str(e)}"
        )

@app.post("/load_from_file",
    tags=["Загрузка программ"],
    summary="Загрузка программы из файла",
    description="Загрузка программы из JSON или текстового файла с поддержкой различных форматов"
)
async def load_program_from_file(file: UploadFile = File(..., description="Файл с программой (JSON, текстовый или с табуляцией)")):
    """
    ## Загрузка программы из файла

    Поддерживаемые форматы:

    ### JSON формат
    ```json
    {
      "instructions": [1296, 784, 1, 153],
      "data": [10, 20, 30],
      "data_start_addr": 0
    }
    ```

    ### Текстовый формат (числа)
    Одна инструкция на строку (десятичное или hex число):
    ```
    # Комментарий (игнорируется)
    1296
    0x310
    1
    153
    ```

    ### ⭐ Текстовый формат (команды с табуляцией) - НОВИНКА!
    **Удобный формат:** команда[TAB]значение(если есть)
    ```
    # Программа для вычисления (5 + 3) * 2
    PUSH	5
    PUSH	3
    ADD
    PUSH	2
    MUL
    HALT
    ```

    ### Команды с операндами (требуют TAB + значение):
    - `PUSH[TAB]значение` - поместить значение на стек
    - `JMP[TAB]адрес` - безусловный переход на адрес
    - `JZ[TAB]адрес` - перейти если zero flag
    - `JNZ[TAB]адрес` - перейти если НЕ zero flag
    - `JL[TAB]адрес` - перейти если less flag
    - `JG[TAB]адрес` - перейти если greater flag
    - `JLE[TAB]адрес` - перейти если less or equal
    - `JGE[TAB]адрес` - перейти если greater or equal

    ### Команды без операндов (только название):
    `ADD`, `SUB`, `MUL`, `DIV`, `AND`, `OR`, `XOR`, `NOT`, `CMP`,
    `POP`, `DUP`, `SWAP`, `LOAD`, `STORE`, `HALT`, `NOP`

    **⚠️ Важно:** Между командой и значением должна быть табуляция (TAB), не пробелы!

    **Поддерживаемые расширения:** `.json`, `.txt`, `.asm`
    """
    try:
        content = await file.read()

        # Поддерживаем разные форматы файлов
        if file.filename.endswith('.json'):
            data = json.loads(content.decode('utf-8'))
            instructions = data.get('instructions', [])
            program_data = data.get('data', [])
            data_start_addr = data.get('data_start_addr', 0)
            format_used = "JSON"
        else:
            # Текстовый формат (с поддержкой табуляции)
            content_str = content.decode('utf-8')[1:]
            instructions = parse_text_program(content_str)
            program_data = []
            data_start_addr = 0

            # Определяем какой именно текстовый формат использовался
            if '\t' in content_str:
                format_used = "Текстовый (команды с табуляцией)"
            else:
                format_used = "Текстовый (числовой)"

        emulator.reset()
        emulator.load_program(instructions)
        if program_data:
            emulator.load_data(program_data, data_start_addr)

        return {
            "success": True,
            "message": f"✅ Программа загружена из файла {file.filename}",
            "format": format_used,
            "instructions_count": len(instructions),
            "data_count": len(program_data),
            "instructions_preview": [hex(x) for x in instructions[:5]] if instructions else [],
            "state": emulator.get_state()
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Ошибка загрузки файла: {str(e)}"
        )

@app.post("/step",
    response_model=StateResponse,
    tags=["Выполнение программ"],
    summary="Выполнение одного шага",
    description="Выполнение одной инструкции программы"
)
async def step_execution():
    """
    ## Выполнение одного шага программы

    Выполняет одну инструкцию и возвращает обновленное состояние.

    **Что происходит:**
    1. Считывается инструкция по адресу PC
    2. Декодируется опкод и операнд
    3. Выполняется соответствующая операция
    4. Обновляется PC и другие регистры
    5. Увеличивается счетчик циклов

    **Состояния выполнения:**
    - Продолжается: PC указывает на следующую инструкцию
    - Остановлено: выполнена команда HALT или произошла ошибка

    **Использование:** Идеально для отладки и изучения работы программы
    """
    try:
        emulator.step()
        return StateResponse(**emulator.get_state())
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка выполнения шага: {str(e)}"
        )

@app.post("/run",
    response_model=StateResponse,
    tags=["Выполнение программ"],
    summary="Выполнение программы до остановки",
    description="Автоматическое выполнение программы до команды HALT или превышения лимита циклов"
)
async def run_program(request: ExecutionRequest):
    """
    ## Выполнение программы до остановки

    Автоматически выполняет программу до одного из условий:
    - Встречена команда `HALT`
    - Достигнут конец программы (PC >= размер памяти команд)
    - Превышен лимит циклов (защита от бесконечных циклов)
    - Произошла ошибка выполнения

    **Параметры:**
    - `max_cycles`: Максимальное количество циклов (по умолчанию 10000)

    **Защита от зависания:**
    Если программа не останавливается за max_cycles, выполнение прерывается
    с сохранением текущего состояния.

    **Результат:** Финальное состояние эмулятора после выполнения
    """
    try:
        emulator.run_until_halt(request.max_cycles)
        return StateResponse(**emulator.get_state())
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка выполнения программы: {str(e)}"
        )

@app.get("/state",
    response_model=StateResponse,
    tags=["Управление эмулятором"],
    summary="Текущее состояние эмулятора",
    description="Получение полной информации о текущем состоянии эмулятора"
)
async def get_current_state():
    """
    ## Получение текущего состояния эмулятора

    Возвращает полную информацию о состоянии:

    ### Стек данных
    - Содержимое всех элементов стека
    - Указатель вершины стека (SP)

    ### Память
    - Память данных (первые 50 ячеек для экономии трафика)
    - Память команд (вся загруженная программа)

    ### Регистры и флаги
    - PC (Program Counter): указатель текущей команды
    - SP (Stack Pointer): указатель вершины стека
    - Флаги: zero, negative, overflow, carry

    ### Состояние выполнения
    - Флаг остановки (halted)
    - Сообщение об ошибке (если есть)
    - Количество выполненных циклов
    """
    return StateResponse(**emulator.get_state())

@app.post("/add_instruction",
    tags=["Ручное управление"],
    summary="Добавление инструкции",
    description="Ручное добавление одной инструкции к программе"
)
async def add_manual_instruction(request: InstructionRequest):
    """
    ## Добавление инструкции вручную

    Добавляет одну инструкцию к концу текущей программы.

    **Параметры:**
    - `instruction`: 32-битная инструкция (опкод + операнд)

    **Формат инструкции:**
    - Биты 0-7: код операции (см. `/opcodes`)
    - Биты 8-31: операнд (значение, адрес и т.д.)

    **Примеры:**
    - `0x510` = PUSH 5
    - `0x01` = ADD
    - `0x99` = HALT

    **Применение:** Динамическое изменение программы во время выполнения
    """
    try:
        current_state = emulator.get_state()
        instructions = current_state['instruction_memory'].copy()
        instructions.append(request.instruction)
        emulator.load_program(instructions)
        return {
            "success": True,
            "message": "✅ Инструкция добавлена",
            "instruction_hex": hex(request.instruction),
            "total_instructions": len(instructions),
            "state": emulator.get_state()
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Ошибка добавления инструкции: {str(e)}"
        )

@app.get("/preloaded_programs",
    tags=["Загрузка программ"],
    summary="Список предзагруженных программ",
    description="Получение списка готовых программ-примеров"
)
async def get_preloaded_programs():
    """
    ## Получение списка предзагруженных программ

    Возвращает коллекцию готовых программ для демонстрации возможностей эмулятора.

    ### Доступные программы:
    - **simple_math**: Демонстрация арифметических операций
    - **factorial**: Вычисление факториала с циклами и переходами

    Каждая программа содержит:
    - Название и описание
    - Готовые инструкции
    - Ожидаемый результат

    **Использование:** Быстрый старт и изучение возможностей эмулятора
    """
    return {
        "programs": {
            program_id: {
                "name": program["name"],
                "description": program["description"],
                "instruction_count": len(program["instructions"])
            }
            for program_id, program in PRELOADED_PROGRAMS.items()
        },
        "total_count": len(PRELOADED_PROGRAMS)
    }

@app.post("/load_preloaded/{program_id}",
    response_model=StateResponse,
    tags=["Загрузка программ"],
    summary="Загрузка предзагруженной программы",
    description="Загрузка выбранной программы из коллекции примеров"
)
async def load_preloaded_program(program_id: str):
    """
    ## Загрузка предзагруженной программы

    Загружает выбранную программу из коллекции готовых примеров.

    **Доступные ID программ:**
    - `simple_math`: (5 + 3) * 2 = 16
    - `factorial`: 5! = 120

    **Что происходит:**
    1. Сброс эмулятора
    2. Загрузка инструкций программы
    3. Загрузка начальных данных (если есть)
    4. Возврат готового состояния для выполнения

    **После загрузки** используйте `/step` для пошагового выполнения
    или `/run` для автоматического выполнения.
    """
    if program_id not in PRELOADED_PROGRAMS:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Программа '{program_id}' не найдена. Доступные: {list(PRELOADED_PROGRAMS.keys())}"
        )

    try:
        program = PRELOADED_PROGRAMS[program_id]
        emulator.reset()
        emulator.load_program(program["instructions"])
        if "data" in program:
            emulator.load_data(program["data"])

        return StateResponse(**emulator.get_state())
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка загрузки программы: {str(e)}"
        )

@app.post("/convert_to_binary",
    tags=["Ассемблер и команды"],
    summary="Преобразование ассемблерного кода",
    description="Компиляция текстового ассемблерного кода в бинарные инструкции"
)
async def convert_to_binary(request: BinaryConversionRequest):
    """
    ## Встроенный ассемблер

    Преобразует текстовый ассемблерный код в бинарные инструкции.

    ### Поддерживаемый синтаксис:
    ```
    PUSH 5          ; Поместить 5 на стек
    PUSH 3          ; Поместить 3 на стек
    ADD             ; Сложить два верхних элемента
    HALT            ; Остановить выполнение
    ```

    ### Поддерживаемые команды:
    - **Стек:** PUSH, POP, DUP, SWAP
    - **Арифметика:** ADD, SUB, MUL, DIV
    - **Логика:** AND, OR, XOR, NOT, CMP
    - **Память:** LOAD, STORE
    - **Переходы:** JMP, JZ, JNZ, JL, JG, JLE, JGE
    - **Система:** HALT, NOP

    ### Комментарии:
    Используйте `;` для комментариев (игнорируются при компиляции)

    **Результат:** Готовые инструкции для загрузки в эмулятор
    """
    try:
        lines = request.assembly_code.strip().split('\n')
        instructions = []

        for line_num, line in enumerate(lines, 1):
            line = line.strip().upper()
            if not line or line.startswith(';'):
                continue

            parts = line.split()
            if not parts:
                continue

            cmd = parts[0]

            try:
                # Простая трансляция команд
                if cmd == "PUSH" and len(parts) > 1:
                    value = int(parts[1])
                    instructions.append(OpCode.PUSH.value | (value << 8))
                elif cmd == "POP":
                    instructions.append(OpCode.POP.value)
                elif cmd == "ADD":
                    instructions.append(OpCode.ADD.value)
                elif cmd == "SUB":
                    instructions.append(OpCode.SUB.value)
                elif cmd == "MUL":
                    instructions.append(OpCode.MUL.value)
                elif cmd == "DIV":
                    instructions.append(OpCode.DIV.value)
                elif cmd == "DUP":
                    instructions.append(OpCode.DUP.value)
                elif cmd == "SWAP":
                    instructions.append(OpCode.SWAP.value)
                elif cmd == "HALT":
                    instructions.append(OpCode.HALT.value)
                elif cmd == "NOP":
                    instructions.append(OpCode.NOP.value)
                elif cmd == "AND":
                    instructions.append(OpCode.AND.value)
                elif cmd == "OR":
                    instructions.append(OpCode.OR.value)
                elif cmd == "XOR":
                    instructions.append(OpCode.XOR.value)
                elif cmd == "NOT":
                    instructions.append(OpCode.NOT.value)
                elif cmd == "CMP":
                    instructions.append(OpCode.CMP.value)
                elif cmd == "LOAD":
                    instructions.append(OpCode.LOAD.value)
                elif cmd == "STORE":
                    instructions.append(OpCode.STORE.value)
                elif cmd.startswith("J") and len(parts) > 1:
                    # Команды перехода
                    addr = int(parts[1])
                    if cmd == "JMP":
                        instructions.append(OpCode.JMP.value | (addr << 8))
                    elif cmd == "JZ":
                        instructions.append(OpCode.JZ.value | (addr << 8))
                    elif cmd == "JNZ":
                        instructions.append(OpCode.JNZ.value | (addr << 8))
                    elif cmd == "JL":
                        instructions.append(OpCode.JL.value | (addr << 8))
                    elif cmd == "JG":
                        instructions.append(OpCode.JG.value | (addr << 8))
                    elif cmd == "JLE":
                        instructions.append(OpCode.JLE.value | (addr << 8))
                    elif cmd == "JGE":
                        instructions.append(OpCode.JGE.value | (addr << 8))
                    else:
                        raise ValueError(f"Неизвестная команда перехода: {cmd}")
                else:
                    raise ValueError(f"Неизвестная команда: {cmd}")
            except ValueError as ve:
                raise ValueError(f"Строка {line_num}: {ve}")

        return {
            "success": True,
            "instructions": instructions,
            "hex_instructions": [hex(x) for x in instructions],
            "instructions_preview": [hex(x) for x in instructions[:5]] if instructions else [],
            "instructions_count": len(instructions),
            "message": f"✅ Успешно скомпилировано {len(instructions)} инструкций"
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Ошибка ассемблирования: {str(e)}"
        )

@app.get("/opcodes",
    tags=["Ассемблер и команды"],
    summary="Список команд процессора",
    description="Полный справочник всех доступных команд эмулятора"
)
async def get_opcodes():
    """
    ## Справочник команд процессора

    Возвращает полный список всех 24 команд эмулятора с описанием.

    ### Категории команд:

    #### 🧮 Арифметические (0x01-0x04)
    - ADD, SUB, MUL, DIV

    #### 🔧 Логические (0x05-0x08)
    - AND, OR, XOR, NOT

    #### 📚 Стековые (0x10-0x13)
    - PUSH, POP, DUP, SWAP

    #### 💾 Память (0x20-0x21)
    - LOAD, STORE

    #### 🔀 Переходы (0x30-0x36)
    - JMP, JZ, JNZ, JL, JG, JLE, JGE

    #### ⚙️ Системные
    - HALT (0x99), NOP (0x00), CMP (0x09)

    **Каждая команда содержит:**
    - Код операции (hex и decimal)
    - Название команды
    - Подробное описание работы
    """
    categories = {
        "arithmetic": {"name": "🧮 Арифметические", "opcodes": []},
        "logical": {"name": "🔧 Логические", "opcodes": []},
        "stack": {"name": "📚 Стековые", "opcodes": []},
        "memory": {"name": "💾 Память", "opcodes": []},
        "jumps": {"name": "🔀 Переходы", "opcodes": []},
        "system": {"name": "⚙️ Системные", "opcodes": []}
    }

    for opcode in OpCode:
        info = {
            "name": opcode.name,
            "value": opcode.value,
            "hex": hex(opcode.value),
            "description": _get_opcode_description(opcode)
        }

        # Категоризация команд
        if opcode.value in [0x01, 0x02, 0x03, 0x04]:
            categories["arithmetic"]["opcodes"].append(info)
        elif opcode.value in [0x05, 0x06, 0x07, 0x08]:
            categories["logical"]["opcodes"].append(info)
        elif opcode.value in [0x10, 0x11, 0x12, 0x13]:
            categories["stack"]["opcodes"].append(info)
        elif opcode.value in [0x20, 0x21]:
            categories["memory"]["opcodes"].append(info)
        elif opcode.value in [0x30, 0x31, 0x32, 0x33, 0x34, 0x35, 0x36]:
            categories["jumps"]["opcodes"].append(info)
        else:
            categories["system"]["opcodes"].append(info)

    return {
        "categories": categories,
        "total_opcodes": len(OpCode),
        "instruction_format": "32-bit: [24-bit операнд][8-bit опкод]"
    }

def _get_opcode_description(opcode: OpCode) -> str:
    """Получить подробное описание кода операции"""
    descriptions = {
        OpCode.ADD: "Извлекает два числа со стека, складывает их и помещает результат на стек",
        OpCode.SUB: "Извлекает два числа (b, a), вычисляет a-b и помещает результат на стек",
        OpCode.MUL: "Извлекает два числа со стека, умножает их и помещает результат на стек",
        OpCode.DIV: "Извлекает два числа (b, a), вычисляет a/b и a%b, помещает частное и остаток на стек",
        OpCode.AND: "Побитовое И двух верхних элементов стека",
        OpCode.OR: "Побитовое ИЛИ двух верхних элементов стека",
        OpCode.XOR: "Побитовое исключающее ИЛИ двух верхних элементов стека",
        OpCode.NOT: "Побитовое НЕ верхнего элемента стека",
        OpCode.CMP: "Сравнивает два верхних элемента стека и устанавливает флаги (zero, negative)",
        OpCode.PUSH: "Помещает операнд инструкции на стек",
        OpCode.POP: "Извлекает верхний элемент со стека (отбрасывает значение)",
        OpCode.DUP: "Дублирует верхний элемент стека",
        OpCode.SWAP: "Меняет местами два верхних элемента стека",
        OpCode.LOAD: "Извлекает адрес со стека, загружает значение из памяти данных по этому адресу",
        OpCode.STORE: "Извлекает значение и адрес со стека, сохраняет значение в память данных",
        OpCode.JMP: "Безусловный переход на адрес, указанный в операнде",
        OpCode.JZ: "Переход на адрес, если установлен флаг zero",
        OpCode.JNZ: "Переход на адрес, если НЕ установлен флаг zero",
        OpCode.JL: "Переход на адрес, если установлен флаг negative (меньше)",
        OpCode.JG: "Переход на адрес, если НЕ установлены флаги negative и zero (больше)",
        OpCode.JLE: "Переход на адрес, если установлен флаг negative ИЛИ zero (меньше или равно)",
        OpCode.JGE: "Переход на адрес, если НЕ установлен флаг negative (больше или равно)",
        OpCode.HALT: "Останавливает выполнение программы",
        OpCode.NOP: "Пустая операция, ничего не делает (только увеличивает PC)"
    }
    return descriptions.get(opcode, "Неизвестная операция")

# Дополнительные endpoints для расширенного функционала

@app.get("/memory/{address}",
    tags=["Память и отладка"],
    summary="Чтение ячейки памяти",
    description="Получение значения конкретной ячейки памяти данных"
)
async def get_memory_cell(address: int):
    """
    ## Чтение ячейки памяти данных

    Возвращает значение указанной ячейки памяти данных.

    **Параметры:**
    - `address`: Адрес ячейки памяти (0-999)

    **Возвращает:**
    - Адрес ячейки
    - Значение в десятичном формате
    - Значение в шестнадцатеричном формате

    **Использование:** Отладка и проверка содержимого памяти
    """
    try:
        if 0 <= address < len(emulator.state.data_memory):
            value = emulator.state.data_memory[address]
            return {
                "address": address,
                "value": value,
                "hex_value": hex(value),
                "binary_value": bin(value),
                "is_zero": value == 0
            }
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Неверный адрес памяти. Допустимый диапазон: 0-{len(emulator.state.data_memory)-1}"
            )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка чтения памяти: {str(e)}"
        )

@app.post("/memory/{address}",
    tags=["Память и отладка"],
    summary="Запись в ячейку памяти",
    description="Установка значения конкретной ячейки памяти данных"
)
async def set_memory_cell(address: int, request: MemoryValueRequest):
    """
    ## Запись в ячейку памяти данных

    Устанавливает новое значение для указанной ячейки памяти.

    **Параметры:**
    - `address`: Адрес ячейки памяти (0-999)
    - `value`: Новое значение для записи

    **Ограничения:**
    - Адрес должен быть в допустимом диапазоне
    - Значение должно помещаться в 32-битное число

    **Применение:**
    - Инициализация данных
    - Отладка программ
    - Тестирование алгоритмов
    """
    try:
        if 0 <= address < len(emulator.state.data_memory):
            emulator.state.data_memory[address] = request.value
            return {
                "success": True,
                "message": f"✅ Ячейка памяти {address} установлена в {request.value}",
                "address": address,
                "old_value": emulator.state.data_memory[address],
                "new_value": request.value,
                "hex_value": hex(request.value)
            }
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Неверный адрес памяти. Допустимый диапазон: 0-{len(emulator.state.data_memory)-1}"
            )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка записи в память: {str(e)}"
        )

@app.get("/stack",
    tags=["Память и отладка"],
    summary="Информация о стеке",
    description="Подробная информация о состоянии стека данных"
)
async def get_stack_info():
    """
    ## Подробная информация о стеке данных

    Возвращает полную информацию о текущем состоянии стека.

    ### Содержит:
    - **Содержимое стека** (все элементы от дна к вершине)
    - **Размер стека** (количество элементов)
    - **Указатель стека** (SP)
    - **Вершина стека** (последний добавленный элемент)
    - **Состояние** (пустой/заполнен)

    ### Применение:
    - Отладка стековых операций
    - Проверка правильности вычислений
    - Анализ потока данных в программе
    """
    stack_info = {
        "stack": emulator.state.stack,
        "size": len(emulator.state.stack),
        "pointer": emulator.state.sp,
        "top": emulator.state.stack[-1] if emulator.state.stack else None,
        "is_empty": len(emulator.state.stack) == 0,
        "capacity": "unlimited"
    }

    # Дополнительная статистика
    if emulator.state.stack:
        stack_info.update({
            "sum": sum(emulator.state.stack),
            "max": max(emulator.state.stack),
            "min": min(emulator.state.stack),
            "average": sum(emulator.state.stack) / len(emulator.state.stack)
        })

    return stack_info

@app.get("/instruction/{address}",
    tags=["Память и отладка"],
    summary="Информация об инструкции",
    description="Подробная информация об инструкции по указанному адресу"
)
async def get_instruction(address: int):
    """
    ## Анализ инструкции по адресу

    Возвращает подробную информацию об инструкции в памяти команд.

    **Параметры:**
    - `address`: Адрес в памяти команд (0 - размер программы)

    ### Возвращаемая информация:
    - **Адрес** инструкции
    - **Сырая инструкция** (32-битное число)
    - **Код операции** (младший байт)
    - **Операнд** (старшие байты)
    - **Мнемоника** команды (ADD, PUSH и т.д.)
    - **Описание** операции
    - **Форматы** (hex, binary)

    **Использование:** Дизассемблер и анализ программ
    """
    try:
        if 0 <= address < len(emulator.state.instruction_memory):
            instruction = emulator.state.instruction_memory[address]
            opcode_val = instruction & 0xFF
            operand = instruction >> 8

            # Находим соответствующий OpCode
            opcode = None
            for op in OpCode:
                if op.value == opcode_val:
                    opcode = op
                    break

            result = {
                "address": address,
                "raw_instruction": instruction,
                "hex_instruction": hex(instruction),
                "binary_instruction": bin(instruction),
                "opcode": opcode.name if opcode else "UNKNOWN",
                "opcode_value": opcode_val,
                "opcode_hex": hex(opcode_val),
                "operand": operand,
                "operand_hex": hex(operand) if operand else "0x0",
                "description": _get_opcode_description(opcode) if opcode else "Неизвестная инструкция"
            }

            # Добавляем мнемонику ассемблера
            if opcode == OpCode.PUSH:
                result["assembly"] = f"PUSH {operand}"
            elif opcode and opcode.name.startswith("J") and operand:
                result["assembly"] = f"{opcode.name} {operand}"
            elif opcode:
                result["assembly"] = opcode.name
            else:
                result["assembly"] = f"UNKNOWN {hex(instruction)}"

            return result
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Неверный адрес инструкции. Допустимый диапазон: 0-{len(emulator.state.instruction_memory)-1}"
            )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка чтения инструкции: {str(e)}"
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
