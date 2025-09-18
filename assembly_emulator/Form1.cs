using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace assembly_emulator
{
    public partial class Form1 : Form
    {
        ASMTranslator ASMTranslator = new ASMTranslator("../../CommandsList.txt", "../../Code.txt");
        int[] memory = new int[30];
        Stack<int> stack = new Stack<int>(30);
        List<int> stack_list = new List<int>(30);
        string[] commands;
        int counter = 0;
        int iterator = 1;
        List<Command> AllCommands;
        public Form1()
        {
            InitializeComponent();
        }

        private void Form1_Load(object sender, EventArgs e)
        {
            commandLabel.Text = "";
            resultLabel.Text = "";
            counterLabel.Text = "0";
            this.WindowState = FormWindowState.Maximized;
            stackPanel.RowStyles.Clear();
            stackPanel.RowCount = memory.Length + 1;
            for (int i = 0; i < stackPanel.RowCount; i++)
            {
                // Каждая строка будет занимать равную долю доступного пространства
                stackPanel.RowStyles.Add(new RowStyle(SizeType.Percent, 100f / stackPanel.RowCount));
            }
            memoryPanel.RowStyles.Clear();
            memoryPanel.RowCount = memory.Length + 1;
            for (int i = 0; i < memoryPanel.RowCount; i++)
            {
                // Каждая строка будет занимать равную долю доступного пространства
                memoryPanel.RowStyles.Add(new RowStyle(SizeType.Percent, 100f / memoryPanel.RowCount));
            }
        }

        private void button3_Click(object sender, EventArgs e)
        {

        }

        private void testButton_Click(object sender, EventArgs e)
        {
            stack.Clear();
            resultLabel.Text = "";
            commandLabel.Text = "";
            counter = 0;
            iterator = 1;
            counterLabel.Text = "0";
            AllCommands = getAllCommands(ASMTranslator);
            stackPanel.Controls.Clear();
            MessageBox.Show("Файл прочитан. Анализ проведён успешно", "Внимание!", MessageBoxButtons.OK, MessageBoxIcon.Information);

        }

        private void doCommand(Command comm)
        {
            int addr;
            int first;
            int second;
            int third;
            int count;
            switch (comm.getCommand())
            {
                case "PUSH":
                    stack.Push(comm.getLiteral());
                    counter += 1;
                    Redraw(comm);
                    iterator += 1;
                    break;
                case "ADD":
                    //Добавить проверку на реальность
                    first = stack.Pop();
                    second = stack.Pop();
                    stack.Push(first + second);
                    counter -= 1;
                    Redraw(comm);
                    iterator += 1;
                    break;
                case "READ":
                    //Проверка
                    addr = stack.Pop();
                    stack.Push(memory[addr]);
                    counter -= 1;
                    Redraw(comm);
                    iterator += 1;
                    break;
                case "WRITE":
                    //Проверка
                    addr = stack.Pop();
                    count = stack.Pop();
                    memory[addr] = count;
                    counter -= 2;
                    Redraw(comm);
                    iterator += 1;
                    break;
                case "DUP":
                    //Проверка
                    stack.Push(stack.Peek());
                    counter += 1;
                    Redraw(comm);
                    iterator += 1;
                    break;
                case "DROP":
                    //Проверка
                    stack.Pop();
                    counter -= 1;
                    Redraw(comm);
                    iterator += 1;
                    break;
                case "LDC":
                    //Проверка
                    counter = stack.Peek() - 1;
                    Redraw(comm);
                    iterator += 1;
                    break;
                case "STC":
                    //Проверка
                    stack.Push(counter);
                    Redraw(comm);
                    iterator += 1;
                    break;
                case "CMP":
                    //Проверка
                    //возвращаем большее
                    first = stack.Pop();
                    second = stack.Pop();
                    if (first <= second) { stack.Push(second); }
                    else { stack.Push(first); }
                    counter -= 1;
                    Redraw(comm);
                    iterator += 1;
                    break;
                case "INC":
                    stack.Push(stack.Pop() + 1);
                    Redraw(comm);
                    iterator += 1;
                    break;
                case "DEC":
                    stack.Push(stack.Pop() - 1);
                    Redraw(comm);
                    iterator += 1;
                    break;
                case "INCC":
                    counter += 1;
                    Redraw(comm);
                    iterator += 1;
                    break;
                case "DECC":
                    counter -= 1;
                    Redraw(comm);
                    iterator += 1;
                    break;
                case "CMPC":
                    //Проверка
                    //возвращаем большее
                    first = stack.Pop();
                    if (first <= counter) { stack.Push(counter); }
                    else { stack.Push(first); }
                    counter -= 1;
                    Redraw(comm);
                    iterator += 1;
                    break;
                case "MUL":
                    //Добавить проверку на реальность
                    first = stack.Pop();
                    second = stack.Pop();
                    stack.Push(first * second);
                    counter -= 1;
                    Redraw(comm);
                    iterator += 1;
                    break;
                case "SWAP":
                    //check
                    first = stack.Pop();
                    second = stack.Pop();
                    stack.Push(first);
                    stack.Push(second);
                    Redraw(comm);
                    iterator += 1;
                    break;
                case "ROR":
                    //check
                    first = stack.Pop();
                    second = stack.Pop();
                    third = stack.Pop();
                    stack.Push(second);
                    stack.Push(first);
                    stack.Push(third);
                    Redraw(comm);
                    iterator += 1;
                    break;
                case "ROL":
                    //check
                    first = stack.Pop();
                    second = stack.Pop();
                    third = stack.Pop();
                    stack.Push(first);
                    stack.Push(third);
                    stack.Push(second);
                    Redraw(comm);
                    iterator += 1;
                    break;


                default:
                    break;
            }
        }

        private void Redraw(Command command)
        {
            stack_list = stack.Reverse().ToList();
            commandLabel.Text += '\n' +(iterator-1).ToString()+": "+ command.ToString();
            resultLabel.Text += '\n' + (iterator - 1).ToString() + ": " + ASMTranslator.Work(command.ToString());
            counterLabel.Text = counter.ToString();
            if (iterator != 1)
            {
                stackPanel.ColumnCount += 1;
            }
            stackPanel.Controls.Add(new Label { Text = iterator.ToString(), Font = new Font("Arial", 10, FontStyle.Bold)},iterator-1, 0);
            for (int col = 0; col < stack.Count; col++)
            {
                stackPanel.Controls.Add(
                    new Label { Text = stack_list[col].ToString(), AutoSize = true }, iterator-1, col+1);
            }
            counterLabel.Text = counter.ToString();

        }

        private List<Command> getAllCommands(ASMTranslator aSMTranslator)
        {
            List<Command> AllCommands = new List<Command> { };
            string[] commands = aSMTranslator.ReadCode();
            foreach (var command in commands)
            {
                Command com;
                string[] comm = command.Split('\t');
                if (comm.Length > 1)
                {
                    com = new Command(comm[0], Convert.ToInt32(comm[1]));
                }
                else
                {
                    com = new Command(comm[0]);
                }
                AllCommands.Add(com);
            }
            return AllCommands;
        }

        private void button11_Click(object sender, EventArgs e)
        {
            foreach (Command comm in AllCommands)
            {
                doCommand(comm);
            }
        }

        private void button1_Click(object sender, EventArgs e)
        {
            if (iterator - 1 >= AllCommands.Count)
            {
                MessageBox.Show("Все команды выполнены!", "Внимание!", MessageBoxButtons.OK, MessageBoxIcon.Information);
            }
            else
            {
                doCommand(AllCommands[iterator - 1]);
            }
        }

        private void button10_Click(object sender, EventArgs e)
        {
            Environment.Exit(0);
        }
    }
}
