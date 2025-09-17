using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace assembly_emulator
{
    public class ASMTranslator
    {
        private List<string> memory;
        private CommandsList commands;
        private readEnvFile codeFileReader;
        private string codeFilePath;

        public ASMTranslator(string commandsFile, string codeFile = null)
        {
            memory = new List<string>();
            commands = new CommandsList(commandsFile);
            codeFilePath = codeFile;

            if (!string.IsNullOrEmpty(codeFile))
            {
                codeFileReader = new readEnvFile();
                codeFileReader.SetPath(codeFile);
            }
        }
        public override string ToString()
        {
            if (memory == null || memory.Count == 0)
                return "Память пуста";

            var result = new List<string>();
            for (int i = 0; i < memory.Count; i++)
            {
                result.Add($"{i}: {memory[i]}");
            }
            return string.Join(Environment.NewLine, result);
        }

        public string[] ReadCode()
        {
            if (codeFileReader != null && codeFileReader.Create())
            {
                return codeFileReader.readLines();
            }
            else
            {
                Console.WriteLine($"Файл с кодом '{codeFilePath}' не найден");
                return Array.Empty<string>();
            }
        }

        public string Work(string command)
        {
            string bitcommand = "";
            string[] lexems = command.Split(new char[] { ' ', '\t' }, StringSplitOptions.RemoveEmptyEntries);

            if (lexems.Length == 0) return "";

            string commandNumber = commands.GetCommandNumber(lexems[0]);
            if (commandNumber == null)
            {
                Console.WriteLine($"Неизвестная команда: {lexems[0]}");
                return "";
            }

            bitcommand += commandNumber;

            if (lexems.Length > 1)
            {
                string operand = lexems[1];

                // Обработка шестнадцатеричных чисел
                if (operand.StartsWith("0x", StringComparison.OrdinalIgnoreCase))
                {
                    operand = operand.Substring(2);
                    if (int.TryParse(operand, System.Globalization.NumberStyles.HexNumber, null, out int hexNumber))
                    {
                        bitcommand += hexNumber.ToString("X6");
                    }
                    else
                    {
                        Console.WriteLine($"Неверный формат операнда: {lexems[1]}");
                        bitcommand += "000000";
                    }
                }
                // Обработка десятичных чисел
                else if (int.TryParse(operand, out int number))
                {
                    bitcommand += number.ToString("X6");
                }
                else
                {
                    Console.WriteLine($"Неверный формат операнда: {lexems[1]}");
                    bitcommand += "000000";
                }
            }
            else
            {
                bitcommand += "000000";
            }

            return bitcommand;
        }
        public void Work()
        {
            var content = ReadCode();
            if (content.Length == 0) return;

            foreach (var command in content)
            {
                if (string.IsNullOrWhiteSpace(command)) continue;

                string bitcommand = "";
                string[] lexems = command.Split(new char[] { ' ','\t' }, StringSplitOptions.RemoveEmptyEntries);

                if (lexems.Length == 0) continue;

                string commandNumber = commands.GetCommandNumber(lexems[0]);
                if (commandNumber == null)
                {
                    Console.WriteLine($"Неизвестная команда: {lexems[0]}");
                    continue;
                }

                bitcommand += commandNumber;

                if (lexems.Length > 1)
                {
                    string operand = lexems[1];

                    // Обработка шестнадцатеричных чисел
                    if (operand.StartsWith("0x", StringComparison.OrdinalIgnoreCase))
                    {
                        operand = operand.Substring(2);
                        if (int.TryParse(operand, System.Globalization.NumberStyles.HexNumber, null, out int hexNumber))
                        {
                            bitcommand += hexNumber.ToString("X6");
                        }
                        else
                        {
                            Console.WriteLine($"Неверный формат операнда: {lexems[1]}");
                            bitcommand += "000000";
                        }
                    }
                    // Обработка десятичных чисел
                    else if (int.TryParse(operand, out int number))
                    {
                        bitcommand += number.ToString("X6");
                    }
                    else
                    {
                        Console.WriteLine($"Неверный формат операнда: {lexems[1]}");
                        bitcommand += "000000";
                    }
                }
                else
                {
                    bitcommand += "000000";
                }

                memory.Add(bitcommand);
            }
        }

        public void Generate(string fileName)
        {
            try
            {
                codeFileReader.WriteFile(fileName, memory);
                Console.WriteLine($"Файл '{fileName}' успешно создан");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Ошибка при создании файла: {ex.Message}");
            }
        }

        public void Compile(string file)
        {
            // Реализация компиляции (заглушка)
            Console.WriteLine("Компиляция не реализована");
        }
    }
}
