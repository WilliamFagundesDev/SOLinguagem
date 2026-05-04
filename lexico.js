// =========================================================
// MÓDULO LÉXICO (LEXER) - SOLINGUAGEM
// Analisador profissional, extraído para garantir que o 
// ESP32 e a WEB sigam rigorosamente as mesmas regras.
// =========================================================

const KEYWORDS = [
    // Controle de Fluxo e Laços
    'testa', 'falha', 'enquanto', 'para', 'escolha', 'caso', 'padrao', 'quebra', 'continua', 'retorna',
    
    // Declaração de Variáveis e Funções
    'tarefa', 'guarda', 'crava',
    
    // Tipos Primitivos / Constantes
    'sim', 'nao', 'nulo',
    
    // Escopos de Ambiente
    'esp', 'web',
    
    // Comandos de I/O e Elementos UI
    'gira', 'mostra', 'manda', 'envia', 'tema', 'caixa', 'texto', 'botao', 'estilo', 'atualiza', 'limpa', 'coloca',
    
    // Propriedades e Atributos Visuais
    'cor', 'tamanho', 'funcao'
];

function lexicalAnalyzer(code) {
    let current = 0;
    let line = 1;
    let column = 1;
    let tokens = [];

    // Função de avanço inteligente (Rastreia Linha e Coluna)
    function advance(amount = 1) {
        for (let i = 0; i < amount; i++) {
            if (code[current] === '\n') {
                line++;
                column = 1;
            } else {
                column++;
            }
            current++;
        }
    }

    // Função para espiar o próximo caractere sem avançar
    function peek(offset = 0) {
        return code[current + offset] || '';
    }

    while (current < code.length) {
        let char = peek();

        // 1. Espaços em branco e quebras de linha
        if (/\s/.test(char)) {
            advance();
            continue;
        }

        // 2. Comentários de Linha (//)
        if (char === '/' && peek(1) === '/') {
            advance(2);
            while (current < code.length && peek() !== '\n') {
                advance();
            }
            continue;
        }

        // 3. Comentários de Bloco de múltiplas linhas (/* ... */)
        if (char === '/' && peek(1) === '*') {
            let startLine = line;
            let startCol = column;
            advance(2);
            let closed = false;
            while (current < code.length) {
                if (peek() === '*' && peek(1) === '/') {
                    advance(2);
                    closed = true;
                    break;
                }
                advance();
            }
            if (!closed) {
                throw { type: 'Erro Léxico', message: 'Comentário de bloco /* ... */ não foi fechado!', line: startLine, column: startCol };
            }
            continue;
        }

        // 4. Operadores Compostos (Comparação, Lógicos e Atribuição)
        const threeCharOps = ['===', '!=='];
        const twoCharOps = ['==', '!=', '<=', '>=', '&&', '||', '+=', '-=', '*=', '/=', '++', '--', '**'];
        
        let possibleThreeChar = char + peek(1) + peek(2);
        if (threeCharOps.includes(possibleThreeChar)) {
            tokens.push({ type: 'operator', value: possibleThreeChar, line, column });
            advance(3);
            continue;
        }

        let possibleTwoChar = char + peek(1);
        if (twoCharOps.includes(possibleTwoChar)) {
            tokens.push({ type: 'operator', value: possibleTwoChar, line, column });
            advance(2);
            continue;
        }

        // 5. Pontuação e Operadores Simples
        if (/[\[\];,:.]/.test(char)) {
            tokens.push({ type: 'punctuation', value: char, line, column });
            advance();
            continue;
        }

        if (/[+\-*/=><!%&|]/.test(char)) {
            tokens.push({ type: 'operator', value: char, line, column });
            advance();
            continue;
        }

        // 6. Restrição de Sintaxe da SOLinguagem (Proibir chaves e parênteses)
        if (/[(){}]/.test(char)) {
            throw { type: 'Erro Léxico', message: `Uso de '${char}' é proibido na SOLinguagem! Use apenas colchetes [].`, line, column };
        }

        // 7. Números (Inteiros e Decimais)
        if (/[0-9]/.test(char)) {
            let value = '';
            let startCol = column;
            let hasDot = false;

            while (current < code.length && /[0-9.]/.test(peek())) {
                if (peek() === '.') {
                    if (hasDot) throw { type: 'Erro Léxico', message: `Número mal formatado com múltiplos pontos decimais`, line, column };
                    hasDot = true;
                }
                value += peek();
                advance();
            }
            tokens.push({ type: 'number', value: hasDot ? parseFloat(value) : parseInt(value, 10), line, column: startCol });
            continue;
        }

        // 8. Strings (com suporte a escape \n, \", etc)
        if (char === '"' || char === "'") {
            let quoteType = char;
            let value = '';
            let startCol = column;
            advance(); // Pula a aspa de abertura
            let closed = false;

            while (current < code.length) {
                let c = peek();
                if (c === quoteType) {
                    closed = true;
                    advance(); // Pula a aspa de fechamento
                    break;
                }
                if (c === '\\') { // Tratamento de caracteres de escape
                    let nextC = peek(1);
                    if (nextC === 'n') value += '\n';
                    else if (nextC === 't') value += '\t';
                    else if (nextC === quoteType) value += quoteType;
                    else if (nextC === '\\') value += '\\';
                    else value += '\\' + nextC; // Fallback
                    advance(2);
                    continue;
                }
                value += c;
                advance();
            }

            if (!closed) {
                throw { type: 'Erro Léxico', message: `Texto (String) não fechado. Faltou um ${quoteType} no final.`, line, column: startCol };
            }

            tokens.push({ type: 'string', value, line, column: startCol });
            continue;
        }

        // 9. Identificadores e Palavras-chave (Keywords)
        if (/[a-zA-Z_]/.test(char)) {
            let value = '';
            let startCol = column;

            while (current < code.length && /[a-zA-Z0-9_]/.test(peek())) {
                value += peek();
                advance();
            }

            if (KEYWORDS.includes(value)) {
                tokens.push({ type: 'keyword', value, line, column: startCol });
            } else {
                tokens.push({ type: 'identifier', value, line, column: startCol });
            }
            continue;
        }

        // 10. Caracteres Desconhecidos (Tratamento de Exceção)
        throw { type: 'Erro Léxico', message: `Caractere não reconhecido ou inválido: '${char}'`, line, column };
    }

    return tokens;
}

module.exports = { lexicalAnalyzer, KEYWORDS };