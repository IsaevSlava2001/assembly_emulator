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
        int[] memory = new int[] { };
        List<int> stack = new List<int>();
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

        }

        private void doCommand(Command comm)
        {
            switch (comm.getCommand())
            {
                case "PUSH":
                    stack.Add(comm.getLiteral());
                    counter += 1;
                    Redraw(comm);
                    iterator += 1;
                    break;
                case "ADD":
                    //Добавить проверку на реальность
                    int first = stack[stack.Count - 1];
                    int second = stack[stack.Count - 2];
                    int res = first + second;
                    stack.RemoveAt(stack.Count - 1);
                    stack.RemoveAt(stack.Count - 1);
                    stack.Add(res);
                    counter -= 1;
                    Redraw(comm);
                    iterator += 1;
                    break;

                default:
                    break;
            }
        }

        private void Redraw(Command command)
        {
            commandLabel.Text += '\n' + command.ToString();
            resultLabel.Text += '\n' + ASMTranslator.Work(command.ToString());
            counterLabel.Text = counter.ToString();
            if (iterator != 1)
            {
                stackPanel.ColumnCount += 1;
            }
            stackPanel.RowCount = stackPanel.RowCount < stack.Count? stack.Count: stackPanel.RowCount;
            stackPanel.Controls.Add(new Label { Text = iterator.ToString(), Font = new Font("Arial", 10, FontStyle.Bold)},iterator-1, 0);
            for (int col = 0; col < stack.Count; col++)
            {
                stackPanel.Controls.Add(
                    new Label { Text = stack[col].ToString(), AutoSize = true }, iterator-1, col+1);
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
    }
}
