using System;
using System.Collections.Generic;
using System.Linq;
using System.IO;

namespace assembly_emulator
{
    public class CommandsList
    {
        private string path;
        private List<string[]> data;
        private readEnvFile fileReader;

        public CommandsList(string filePath)
        {
            path = filePath;
            fileReader = new readEnvFile();
            fileReader.SetPath(filePath);
            data = ReadAllCommands();
        }

        private List<string[]> ReadAllCommands()
        {
            var result = new List<string[]>();

            if (!fileReader.Create())
            {
                Console.WriteLine($"Файл '{path}' не найден");
                return result;
            }

            // Читаем все строки из файла
            string[] allLines = fileReader.readLines();

            foreach (string line in allLines)
            {
                if (string.IsNullOrWhiteSpace(line))
                    continue;

                // Разделяем строку по табуляции и удаляем пустые элементы
                string[] parts = line.Split(new char[] { '\t' }, StringSplitOptions.RemoveEmptyEntries);

                if (parts.Length < 2)
                {
                    // Если не нашли разделение по табуляции, пробуем разделить по пробелам
                    parts = line.Split(new char[] { ' ' }, StringSplitOptions.RemoveEmptyEntries);
                }

                if (parts.Length >= 2)
                {
                    // Берем первую часть как команду, остальные объединяем как число
                    // (на случай, если число содержит пробелы, например "0x01")
                    string command = parts[0].Trim();
                    string number = string.Join("", parts.Skip(1)).Trim();

                    result.Add(new string[] { command, number });
                }
                else
                {
                    Console.WriteLine($"Некорректный формат строки: {line}");
                }
            }

            return result;
        }

        public override string ToString()
        {
            var result = new List<string>();
            for (int i = 0; i < data.Count; i++)
            {
                result.Add($"{i}: {data[i][0]}\t{data[i][1]}");
            }
            return string.Join(Environment.NewLine, result);
        }

        public bool CreateCommand(string command, string number)
        {
            // Проверяем, нет ли уже команды с таким названием
            if (data.Any(item => item[0].Equals(command, StringComparison.OrdinalIgnoreCase)))
            {
                Console.WriteLine($"Команда '{command}' уже существует");
                return false;
            }

            // Добавляем новую команду
            data.Add(new string[] { command, number });
            Save();
            return true;
        }

        public bool DeleteCommandByName(string command)
        {
            // Удаляем команду по названию
            for (int i = 0; i < data.Count; i++)
            {
                if (data[i][0].Equals(command, StringComparison.OrdinalIgnoreCase))
                {
                    data.RemoveAt(i);
                    Save();
                    return true;
                }
            }

            Console.WriteLine($"Команда '{command}' не найдена");
            return false;
        }

        public bool DeleteCommandByNumber(string number)
        {
            // Удаляем команду по номеру (идентификатору)
            for (int i = 0; i < data.Count; i++)
            {
                if (data[i][1].Equals(number, StringComparison.OrdinalIgnoreCase))
                {
                    data.RemoveAt(i);
                    Save();
                    return true;
                }
            }

            Console.WriteLine($"Команда с номером '{number}' не найдена");
            return false;
        }

        public bool UpdateCommand(string command, string newNumber)
        {
            // Обновляем номер команды по её названию
            for (int i = 0; i < data.Count; i++)
            {
                if (data[i][0].Equals(command, StringComparison.OrdinalIgnoreCase))
                {
                    data[i][1] = newNumber;
                    Save();
                    return true;
                }
            }

            Console.WriteLine($"Команда '{command}' не найдена");
            return false;
        }

        public string GetCommandNumber(string command)
        {
            // Получаем номер команды по её названию
            foreach (var item in data)
            {
                if (item[0].Equals(command, StringComparison.OrdinalIgnoreCase))
                {
                    return item[1];
                }
            }

            Console.WriteLine($"Команда '{command}' не найдена");
            return null;
        }

        private void Save()
        {
            try
            {
                // Сохраняем данные в файл
                var lines = data.Select(item => $"{item[0]}\t{item[1]}").ToArray();
                File.WriteAllLines(path, lines);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Ошибка при сохранении файла команд: {ex.Message}");
            }
        }
    }
}