using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace assembly_emulator
{
    class Command
    {
        private string command;
        private int? literal = null;
        private int code;
        public Command(string comand, int lit)
        {
            command = comand;
            literal = lit;
            code = getCode(command);
        }
        public Command(string comand)
        {
            command = comand;
            code = getCode(command);
        }
        public override string ToString()
        {
            string c = command;
            if(literal != null)
            {
                c += " " + literal;
            }
            return c;
        }
        public string getCommand() =>command;
        public int getLiteral() => (int)literal;
        public int getCode() => code;

        private int getCode(string command)
        {
            /*
             * 1 - запись числа (push)
             * 2 - взаимодействие только со стеком/памятью (read, write, dup, drop, inc, dec, add, mul, swap, ror, rol)
             * 3 - взаимодействие со стеком/памятью и счётчиком (ldc, stc)
             * 4 - сравнение (cmp, cmpc)
             * 5 - взаимодействие только со счётчиком (incc, decc)
             */
            switch (command)
            {
                case "PUSH":
                    return 1;
                break;
                case "READ":
                    return 2;
                break;
                case "WRITE":
                    return 2;
                break;
                case "DUP":
                    return 2;
                break;
                case "DROP":
                    return 2;
                break;
                case "LDC":
                    return 3;
                break;
                case "STC":
                    return 3;
                break;
                case "CMP":
                    return 4;
                break;
                case "INC":
                    return 2;
                break;
                case "DEC":
                    return 2;
                break;
                case "INCС":
                    return 5;
                break;
                case "DECC":
                    return 5;
                break;
                case "CMPC":
                    return 4;
                break;
                case "ADD":
                    return 2;
                break;
                case "MUL":
                    return 2;
                break;
                case "SWAP":
                    return 2;
                break;
                case "ROR":
                    return 2;
                break;
                case "ROL":
                    return 2;
                break;
                default:
                    return 0;
                break;
            }
        }
    }
}
