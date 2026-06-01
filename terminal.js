// =========================================================
// MÓDULO TERMINAL - GERENCIADOR DE COMANDOS
// =========================================================

const { syntaxAnalyzer } = require('./sintaxe');
const { lexicalAnalyzer } = require('./compilerWeb');

function processTerminalCommand(command, code) {
    const cmd = command.trim().toLowerCase();

    // 1. CLEAR: Limpa a tela do terminal na interface
    if (cmd === 'clear') {
        return { action: 'clear' };
    }

    // 2. TOKENS: Lista todas as palavras e regras da linguagem
    if (cmd === 'tokens') {
        const list = `
[TOKENS E FUNCIONALIDADES SOLINGUAGEM]
- Ambientes: web, esp (Define o escopo da compilação)
- Variáveis: guarda (let), crava (const)
- Condicionais: testa (if), falha (else)
- Funções: tarefa (function)
- UI Builder: caixa, texto, botao, tema
- UI Propriedades: cor, tamanho, estilo, coloca, texto, funcao
- Ações Web: mostra (console), atualiza (DOM), limpa (DOM)
- Booleanos: sim (true), nao (false)
- Símbolos: [ ] = + - * / ; , > < !
`;
        return { action: 'print', output: list };
    }

    // 2. TOKENS: Lista todas as palavras e regras da linguagem
    if (cmd === 'help') {
        const list = `
[----Lista de Comandos----]
- clear : limpa terminal
- tokens : gera uma lista de tokens e suas funcionalidades de toda a linguagem sol
- lexico : faz uma analise lexica do meu codigo
- sintatico : faz uma analise sintatica do meu codigo
`;
        return { action: 'print', output: list };
    }

    // 3. LÉXICO: Faz a quebra do código em Tokens e mostra o resultado
    if (cmd === 'lexico') {
        try {
            const tokens = lexicalAnalyzer(code);
            let formatado = "====== [ ANÁLISE LÉXICA ] ======\n";
            tokens.forEach(t => {
                formatado += `[Linha ${t.line}, Col ${t.column}] TIPO: '${t.type}' | VALOR: '${t.value}'\n`;
            });
            return { action: 'print', output: formatado };
        } catch (err) {
            return { action: 'print', output: `❌ Erro Léxico:\n${err.message}` };
        }
    }

    // 4. SINTÁTICO: Gera a AST (Abstract Syntax Tree) baseada nos tokens
    if (cmd === 'sintatico') {
        try {
            const tokens = lexicalAnalyzer(code);
            const { ast, errors } = syntaxAnalyzer(tokens);
            let formatado = "====== [ ANÁLISE SINTÁTICA (AST) ] ======\n";
            formatado += JSON.stringify(ast, null, 2);
            
            if (errors && errors.length > 0) {
                formatado += "\n\n❌ ERROS RECUPERADOS DURANTE A SINTAXE:\n";
                errors.forEach(e => formatado += `- Linha ${e.line}: ${e.message}\n`);
            }
            return { action: 'print', output: formatado };
        } catch (err) {
            return { action: 'print', output: `❌ Erro Sintático Crítico:\n${err.message}` };
        }
    }

    // Comando não encontrado
    return { 
        action: 'print', 
        output: `❌ Comando '${command}' não reconhecido.\nDigite "help" para ver comandos disponíveis!` 
    };
}

module.exports = { processTerminalCommand };