
namespace assembly_emulator
{
    partial class Form1
    {
        /// <summary>
        /// Обязательная переменная конструктора.
        /// </summary>
        private System.ComponentModel.IContainer components = null;

        /// <summary>
        /// Освободить все используемые ресурсы.
        /// </summary>
        /// <param name="disposing">истинно, если управляемый ресурс должен быть удален; иначе ложно.</param>
        protected override void Dispose(bool disposing)
        {
            if (disposing && (components != null))
            {
                components.Dispose();
            }
            base.Dispose(disposing);
        }

        #region Код, автоматически созданный конструктором форм Windows

        /// <summary>
        /// Требуемый метод для поддержки конструктора — не изменяйте 
        /// содержимое этого метода с помощью редактора кода.
        /// </summary>
        private void InitializeComponent()
        {
            this.resultLabel = new System.Windows.Forms.Label();
            this.label1 = new System.Windows.Forms.Label();
            this.stackPanel = new System.Windows.Forms.TableLayoutPanel();
            this.label2 = new System.Windows.Forms.Label();
            this.label3 = new System.Windows.Forms.Label();
            this.counterLabel = new System.Windows.Forms.Label();
            this.label5 = new System.Windows.Forms.Label();
            this.memoryPanel = new System.Windows.Forms.TableLayoutPanel();
            this.label6 = new System.Windows.Forms.Label();
            this.commandLabel = new System.Windows.Forms.Label();
            this.button1 = new System.Windows.Forms.Button();
            this.button2 = new System.Windows.Forms.Button();
            this.button3 = new System.Windows.Forms.Button();
            this.button4 = new System.Windows.Forms.Button();
            this.button5 = new System.Windows.Forms.Button();
            this.textBox1 = new System.Windows.Forms.TextBox();
            this.label8 = new System.Windows.Forms.Label();
            this.button6 = new System.Windows.Forms.Button();
            this.button7 = new System.Windows.Forms.Button();
            this.button8 = new System.Windows.Forms.Button();
            this.button9 = new System.Windows.Forms.Button();
            this.button10 = new System.Windows.Forms.Button();
            this.button11 = new System.Windows.Forms.Button();
            this.testButton = new System.Windows.Forms.Button();
            this.SuspendLayout();
            // 
            // resultLabel
            // 
            this.resultLabel.BorderStyle = System.Windows.Forms.BorderStyle.FixedSingle;
            this.resultLabel.Location = new System.Drawing.Point(820, 66);
            this.resultLabel.Name = "resultLabel";
            this.resultLabel.Size = new System.Drawing.Size(159, 129);
            this.resultLabel.TabIndex = 0;
            this.resultLabel.Text = "label1";
            // 
            // label1
            // 
            this.label1.Location = new System.Drawing.Point(845, 15);
            this.label1.Name = "label1";
            this.label1.Size = new System.Drawing.Size(113, 42);
            this.label1.TabIndex = 1;
            this.label1.Text = "Транслированные команды";
            // 
            // stackPanel
            // 
            this.stackPanel.AutoScroll = true;
            this.stackPanel.CellBorderStyle = System.Windows.Forms.TableLayoutPanelCellBorderStyle.Single;
            this.stackPanel.ColumnCount = 1;
            this.stackPanel.ColumnStyles.Add(new System.Windows.Forms.ColumnStyle());
            this.stackPanel.Location = new System.Drawing.Point(909, 262);
            this.stackPanel.Name = "stackPanel";
            this.stackPanel.RowCount = 1;
            this.stackPanel.RowStyles.Add(new System.Windows.Forms.RowStyle());
            this.stackPanel.Size = new System.Drawing.Size(251, 160);
            this.stackPanel.TabIndex = 2;
            // 
            // label2
            // 
            this.label2.Location = new System.Drawing.Point(957, 211);
            this.label2.Name = "label2";
            this.label2.Size = new System.Drawing.Size(113, 42);
            this.label2.TabIndex = 3;
            this.label2.Text = "Стек по времени";
            // 
            // label3
            // 
            this.label3.Location = new System.Drawing.Point(671, 15);
            this.label3.Name = "label3";
            this.label3.Size = new System.Drawing.Size(48, 23);
            this.label3.TabIndex = 5;
            this.label3.Text = "Счётчик";
            // 
            // counterLabel
            // 
            this.counterLabel.BorderStyle = System.Windows.Forms.BorderStyle.FixedSingle;
            this.counterLabel.Location = new System.Drawing.Point(674, 57);
            this.counterLabel.Name = "counterLabel";
            this.counterLabel.Size = new System.Drawing.Size(54, 37);
            this.counterLabel.TabIndex = 4;
            this.counterLabel.Text = "label1";
            // 
            // label5
            // 
            this.label5.Location = new System.Drawing.Point(644, 211);
            this.label5.Name = "label5";
            this.label5.Size = new System.Drawing.Size(113, 42);
            this.label5.TabIndex = 8;
            this.label5.Text = "Память по времени";
            // 
            // memoryPanel
            // 
            this.memoryPanel.CellBorderStyle = System.Windows.Forms.TableLayoutPanelCellBorderStyle.Single;
            this.memoryPanel.ColumnCount = 2;
            this.memoryPanel.ColumnStyles.Add(new System.Windows.Forms.ColumnStyle(System.Windows.Forms.SizeType.Percent, 50F));
            this.memoryPanel.ColumnStyles.Add(new System.Windows.Forms.ColumnStyle(System.Windows.Forms.SizeType.Percent, 50F));
            this.memoryPanel.Location = new System.Drawing.Point(528, 262);
            this.memoryPanel.Name = "memoryPanel";
            this.memoryPanel.RowCount = 2;
            this.memoryPanel.RowStyles.Add(new System.Windows.Forms.RowStyle(System.Windows.Forms.SizeType.Percent, 50F));
            this.memoryPanel.RowStyles.Add(new System.Windows.Forms.RowStyle(System.Windows.Forms.SizeType.Percent, 50F));
            this.memoryPanel.Size = new System.Drawing.Size(329, 160);
            this.memoryPanel.TabIndex = 7;
            // 
            // label6
            // 
            this.label6.Location = new System.Drawing.Point(1041, 15);
            this.label6.Name = "label6";
            this.label6.Size = new System.Drawing.Size(113, 42);
            this.label6.TabIndex = 10;
            this.label6.Text = "Команды";
            // 
            // commandLabel
            // 
            this.commandLabel.BorderStyle = System.Windows.Forms.BorderStyle.FixedSingle;
            this.commandLabel.Location = new System.Drawing.Point(1016, 66);
            this.commandLabel.Name = "commandLabel";
            this.commandLabel.Size = new System.Drawing.Size(159, 129);
            this.commandLabel.TabIndex = 9;
            this.commandLabel.Text = "label1";
            // 
            // button1
            // 
            this.button1.Location = new System.Drawing.Point(1167, 233);
            this.button1.Name = "button1";
            this.button1.Size = new System.Drawing.Size(100, 54);
            this.button1.TabIndex = 11;
            this.button1.Text = "Следующий шаг";
            this.button1.UseVisualStyleBackColor = true;
            this.button1.Click += new System.EventHandler(this.button1_Click);
            // 
            // button2
            // 
            this.button2.Location = new System.Drawing.Point(1241, 33);
            this.button2.Name = "button2";
            this.button2.Size = new System.Drawing.Size(75, 45);
            this.button2.TabIndex = 12;
            this.button2.Text = "удалить команду";
            this.button2.UseVisualStyleBackColor = true;
            // 
            // button3
            // 
            this.button3.Location = new System.Drawing.Point(1241, 115);
            this.button3.Name = "button3";
            this.button3.Size = new System.Drawing.Size(75, 45);
            this.button3.TabIndex = 13;
            this.button3.Text = "добавить команду";
            this.button3.UseVisualStyleBackColor = true;
            this.button3.Click += new System.EventHandler(this.button3_Click);
            // 
            // button4
            // 
            this.button4.Location = new System.Drawing.Point(12, 12);
            this.button4.Name = "button4";
            this.button4.Size = new System.Drawing.Size(100, 54);
            this.button4.TabIndex = 14;
            this.button4.Text = "Задание 1";
            this.button4.UseVisualStyleBackColor = true;
            // 
            // button5
            // 
            this.button5.Location = new System.Drawing.Point(12, 89);
            this.button5.Name = "button5";
            this.button5.Size = new System.Drawing.Size(100, 54);
            this.button5.TabIndex = 15;
            this.button5.Text = "Задание 2";
            this.button5.UseVisualStyleBackColor = true;
            // 
            // textBox1
            // 
            this.textBox1.Location = new System.Drawing.Point(209, 66);
            this.textBox1.Multiline = true;
            this.textBox1.Name = "textBox1";
            this.textBox1.Size = new System.Drawing.Size(176, 110);
            this.textBox1.TabIndex = 16;
            // 
            // label8
            // 
            this.label8.Location = new System.Drawing.Point(254, 9);
            this.label8.Name = "label8";
            this.label8.Size = new System.Drawing.Size(79, 50);
            this.label8.TabIndex = 17;
            this.label8.Text = "Ввести команды вручную";
            // 
            // button6
            // 
            this.button6.Location = new System.Drawing.Point(12, 176);
            this.button6.Name = "button6";
            this.button6.Size = new System.Drawing.Size(100, 54);
            this.button6.TabIndex = 18;
            this.button6.Text = "Ввести код вручную";
            this.button6.UseVisualStyleBackColor = true;
            // 
            // button7
            // 
            this.button7.Location = new System.Drawing.Point(12, 262);
            this.button7.Name = "button7";
            this.button7.Size = new System.Drawing.Size(100, 54);
            this.button7.TabIndex = 19;
            this.button7.Text = "Изменить файл с кодом";
            this.button7.UseVisualStyleBackColor = true;
            // 
            // button8
            // 
            this.button8.Location = new System.Drawing.Point(233, 211);
            this.button8.Name = "button8";
            this.button8.Size = new System.Drawing.Size(100, 54);
            this.button8.TabIndex = 20;
            this.button8.Text = "Запустить";
            this.button8.UseVisualStyleBackColor = true;
            // 
            // button9
            // 
            this.button9.Location = new System.Drawing.Point(12, 340);
            this.button9.Name = "button9";
            this.button9.Size = new System.Drawing.Size(100, 54);
            this.button9.TabIndex = 21;
            this.button9.Text = "Изменить файл с командами";
            this.button9.UseVisualStyleBackColor = true;
            // 
            // button10
            // 
            this.button10.Location = new System.Drawing.Point(1357, 415);
            this.button10.Name = "button10";
            this.button10.Size = new System.Drawing.Size(75, 23);
            this.button10.TabIndex = 24;
            this.button10.Text = "Выход";
            this.button10.UseVisualStyleBackColor = true;
            // 
            // button11
            // 
            this.button11.Location = new System.Drawing.Point(1167, 293);
            this.button11.Name = "button11";
            this.button11.Size = new System.Drawing.Size(100, 54);
            this.button11.TabIndex = 25;
            this.button11.Text = "выполнить целиком";
            this.button11.UseVisualStyleBackColor = true;
            this.button11.Click += new System.EventHandler(this.button11_Click);
            // 
            // testButton
            // 
            this.testButton.Location = new System.Drawing.Point(470, 33);
            this.testButton.Name = "testButton";
            this.testButton.Size = new System.Drawing.Size(100, 54);
            this.testButton.TabIndex = 26;
            this.testButton.Text = "Тест";
            this.testButton.UseVisualStyleBackColor = true;
            this.testButton.Click += new System.EventHandler(this.testButton_Click);
            // 
            // Form1
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(6F, 13F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.ClientSize = new System.Drawing.Size(1444, 450);
            this.Controls.Add(this.testButton);
            this.Controls.Add(this.button11);
            this.Controls.Add(this.button10);
            this.Controls.Add(this.button9);
            this.Controls.Add(this.button8);
            this.Controls.Add(this.button7);
            this.Controls.Add(this.button6);
            this.Controls.Add(this.label8);
            this.Controls.Add(this.textBox1);
            this.Controls.Add(this.button5);
            this.Controls.Add(this.button4);
            this.Controls.Add(this.button3);
            this.Controls.Add(this.button2);
            this.Controls.Add(this.button1);
            this.Controls.Add(this.label6);
            this.Controls.Add(this.commandLabel);
            this.Controls.Add(this.label5);
            this.Controls.Add(this.memoryPanel);
            this.Controls.Add(this.label3);
            this.Controls.Add(this.counterLabel);
            this.Controls.Add(this.label2);
            this.Controls.Add(this.stackPanel);
            this.Controls.Add(this.label1);
            this.Controls.Add(this.resultLabel);
            this.Name = "Form1";
            this.Text = "Form1";
            this.Load += new System.EventHandler(this.Form1_Load);
            this.ResumeLayout(false);
            this.PerformLayout();

        }

        #endregion

        private System.Windows.Forms.Label resultLabel;
        private System.Windows.Forms.Label label1;
        private System.Windows.Forms.TableLayoutPanel stackPanel;
        private System.Windows.Forms.Label label2;
        private System.Windows.Forms.Label label3;
        private System.Windows.Forms.Label counterLabel;
        private System.Windows.Forms.Label label5;
        private System.Windows.Forms.TableLayoutPanel memoryPanel;
        private System.Windows.Forms.Label label6;
        private System.Windows.Forms.Label commandLabel;
        private System.Windows.Forms.Button button1;
        private System.Windows.Forms.Button button2;
        private System.Windows.Forms.Button button3;
        private System.Windows.Forms.Button button4;
        private System.Windows.Forms.Button button5;
        private System.Windows.Forms.TextBox textBox1;
        private System.Windows.Forms.Label label8;
        private System.Windows.Forms.Button button6;
        private System.Windows.Forms.Button button7;
        private System.Windows.Forms.Button button8;
        private System.Windows.Forms.Button button9;
        private System.Windows.Forms.Button button10;
        private System.Windows.Forms.Button button11;
        private System.Windows.Forms.Button testButton;
    }
}

