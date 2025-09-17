using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.IO;

namespace assembly_emulator
{
    class readEnvFile
    {
        private string path = "";

        // Добавляем метод для установки пути
        public void SetPath(string newPath)
        {
            this.path = newPath;
        }

        public void WriteFile(string path, string context)
        {
            File.WriteAllText(path, context);
        }
        public void WriteFile(string path, List<string> context)
        {
            File.WriteAllText(path, context.ToString());
        }

        public bool Create()
        {
            return File.Exists(this.path);
        }

        public string readFile()
        {
            return File.ReadAllText(this.path);
        }

        public string[] readLines()
        {
            return File.ReadAllLines(this.path);
        }

        public string[,] ReadSplit()
        {
            string[] content = File.ReadAllText(this.path).Split('\n');
            var rows = new List<List<string>>();

            foreach (string line in content)
            {
                string trimmedLine = line.Trim();
                if (string.IsNullOrEmpty(trimmedLine))
                    continue;

                string[] parts = line.Split('\t');
                if (parts.Length < 2)
                    continue;

                rows.Add(new List<string>(parts));
            }

            int rowCount = rows.Count;
            int colCount = rows.Max(r => r.Count);

            string[,] results = new string[rowCount, colCount];

            for (int i = 0; i < rowCount; i++)
            {
                for (int j = 0; j < rows[i].Count; j++)
                {
                    results[i, j] = rows[i][j];
                }
            }

            return results;
        }
    }
}
