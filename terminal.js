// =========================================================
// MÓDULO TERMINAL - GERENCIADOR DE COMANDOS
// =========================================================

const { syntaxAnalyzer } = require('./sintaxe');
const { lexicalAnalyzer } = require('./lexico');
const { compileEsp } = require('./compilerEsp');
const { listBoards, configureArduinoAvr, configureEsp32, compileSketch, uploadSketch, DEFAULT_FQBN, setArduinoCliPath, diagnoseArduinoCli, checkArduinoCli } = require('./arduinoService');

async function processTerminalCommand(command, code, context = {}) {
    const raw = command.trim();
    const cmd = raw.toLowerCase();
    const parts = raw.split(/\s+/).filter(Boolean);
    const filename = context.filename || 'SolSketch.sol';

    if (cmd === 'clear') {
        return { action: 'clear' };
    }

    if (cmd === 'tokens') {
        const list = `
[TOKENS E FUNCIONALIDADES SOLINGUAGEM]
- Ambientes: web, arduino, esp
- Variáveis: guarda, crava
- Condicionais: testa, falha
- Laços: enquanto
- Funções: tarefa
- Arduino: mostra, espera, envia/manda, pwm
- Booleanos: sim, nao
- Símbolos: [ ] = + - * / ; , > < !
`;
        return { action: 'print', output: list };
    }

    if (cmd === 'help') {
        const list = `
[---- Lista de Comandos ----]
- clear                  : limpa terminal
- tokens                 : lista tokens da linguagem
- lexico                 : análise léxica do código atual
- sintatico              : análise sintática do código atual
- diagnostico-arduino    : mostra por que o Node/Electron não acha o Arduino CLI
- arduino-caminho CAMINHO : salva o caminho completo do arduino-cli.exe
- testar-arduino         : testa se o Arduino CLI está acessível
- portas                 : lista portas/placas detectadas pelo Arduino CLI
- configurar-arduino    : instala/configura o core Arduino AVR no Arduino CLI
- compilar-arduino       : gera .ino e compila para Arduino Uno por padrão
- enviar-arduino COM3    : compila e envia para a placa na porta informada
- configurar-esp32       : apelido antigo; agora aponta para Arduino AVR
- compilar-esp32         : apelido antigo para compilar-arduino
- enviar-esp32 COM3      : apelido antigo para enviar-arduino

FQBN padrão: ${DEFAULT_FQBN}
Exemplo Linux: enviar-arduino /dev/ttyUSB0
Exemplo Windows: enviar-arduino COM6
`;
        return { action: 'print', output: list };
    }

    if (cmd === 'lexico') {
        try {
            const tokens = lexicalAnalyzer(code);
            let formatado = '====== [ ANÁLISE LÉXICA ] ======\n';
            tokens.forEach(t => {
                formatado += `[Linha ${t.line}, Col ${t.column}] TIPO: '${t.type}' | VALOR: '${t.value}'\n`;
            });
            return { action: 'print', output: formatado };
        } catch (err) {
            return { action: 'print', output: `❌ Erro Léxico:\n${err.message}` };
        }
    }

    if (cmd === 'sintatico') {
        try {
            const tokens = lexicalAnalyzer(code);
            const parsed = syntaxAnalyzer(tokens);
            const ast = parsed.ast || parsed;
            const errors = parsed.errors || [];
            let formatado = '====== [ ANÁLISE SINTÁTICA (AST) ] ======\n';
            formatado += JSON.stringify(ast, null, 2);

            if (errors && errors.length > 0) {
                formatado += '\n\n❌ ERROS RECUPERADOS DURANTE A SINTAXE:\n';
                errors.forEach(e => formatado += `- Linha ${e.line}: ${e.message}\n`);
            }
            return { action: 'print', output: formatado };
        } catch (err) {
            return { action: 'print', output: `❌ Erro Sintático Crítico:\n${err.message}` };
        }
    }


    if (cmd === 'diagnostico-arduino') {
        const result = await diagnoseArduinoCli();
        return { action: 'print', output: result.logs };
    }

    if (cmd === 'testar-arduino') {
        const result = await checkArduinoCli();
        return { action: 'print', output: result.logs };
    }

    if (parts[0] && parts[0].toLowerCase() === 'arduino-caminho') {
        const cliPath = raw.replace(/^arduino-caminho\s+/i, '').trim();
        const result = await setArduinoCliPath(cliPath);
        return { action: 'print', output: result.logs };
    }

    if (cmd === 'portas' || cmd === 'placas') {
        const result = await listBoards();
        return { action: 'print', output: result.logs };
    }

    if (cmd === 'configurar-arduino' || cmd === 'configurar-esp32') {
        const result = await configureArduinoAvr();
        return { action: 'print', output: result.logs };
    }

    if (cmd === 'compilar-arduino' || cmd === 'compilar-esp32') {
        const esp = compileEsp(code);
        let output = esp.logs + '\n';

        if (esp.status === 'error') {
            return { action: 'print', output };
        }

        const result = await compileSketch(esp.generatedCpp, { filename });
        return { action: 'print', output: output + result.logs };
    }

    if (parts[0] && ['enviar-arduino', 'enviar-esp32'].includes(parts[0].toLowerCase())) {
        const port = parts[1];
        const esp = compileEsp(code);
        let output = esp.logs + '\n';

        if (esp.status === 'error') {
            return { action: 'print', output };
        }

        const result = await uploadSketch(esp.generatedCpp, { filename, port });
        return { action: 'print', output: output + result.logs };
    }

    return {
        action: 'print',
        output: `❌ Comando '${command}' não reconhecido.\nDigite "help" para ver comandos disponíveis!`
    };
}

module.exports = { processTerminalCommand };
