// Definição das palavras reservadas da temática espacial
const KEYWORDS = [
    'constelacao', 'estrela', 'planeta', 'orbita', 
    'eclipse', 'pulsar', 'supernova', 'buraco_negro',
    'materia', 'antimateria'
];

// 1. ANALISADOR LÉXICO (Lexer)
// Transforma o texto bruto em uma lista de "Tokens" (peças de vocabulário)
function lexicalAnalyzer(code) {
    let current = 0;
    let tokens = [];

    while (current < code.length) {
        let char = code[current];

        // Ignorar espaços em branco
        if (/\s/.test(char)) {
            current++;
            continue;
        }

        // Parênteses e Chaves
        if (/[(){};=><!+\-*/,]/.test(char)) {
            // Verifica operadores duplos (==, >=, <=, !=)
            if ((char === '=' || char === '>' || char === '<' || char === '!') && code[current + 1] === '=') {
                tokens.push({ type: 'operator', value: char + '=' });
                current += 2;
                continue;
            }
            let type = 'punctuation';
            if (/[+\-*/=><!]/.test(char)) type = 'operator';
            
            tokens.push({ type, value: char });
            current++;
            continue;
        }

        // Números
        if (/[0-9]/.test(char)) {
            let value = '';
            while (/[0-9]/.test(char)) {
                value += char;
                char = code[++current];
            }
            tokens.push({ type: 'number', value: parseInt(value, 10) });
            continue;
        }

        // Strings (Nebulosas de texto)
        if (char === '"') {
            let value = '';
            char = code[++current]; // Pula as aspas iniciais
            while (char !== '"' && current < code.length) {
                value += char;
                char = code[++current];
            }
            current++; // Pula as aspas finais
            tokens.push({ type: 'string', value });
            continue;
        }

        // Palavras (Identificadores e Palavras Reservadas)
        if (/[a-zA-Z_]/.test(char)) {
            let value = '';
            while (/[a-zA-Z0-9_]/.test(char) && current < code.length) {
                value += char;
                char = code[++current];
            }
            if (KEYWORDS.includes(value)) {
                tokens.push({ type: 'keyword', value });
            } else {
                tokens.push({ type: 'identifier', value });
            }
            continue;
        }

        throw new Error(`Erro Lexico: Caractere não reconhecido no espaço: '${char}'`);
    }

    return tokens;
}

// 2. ANALISADOR SINTÁTICO (Parser)
// Valida a gramática e constrói a Árvore de Sintaxe Abstrata (AST)
function syntaxAnalyzer(tokens) {
    let current = 0;

    function walk() {
        if (current >= tokens.length) return null;
        let token = tokens[current];

        // Declaração de Variável (estrela nome = valor;)
        if (token.type === 'keyword' && token.value === 'estrela') {
            current++; // pula 'estrela'
            let nameToken = tokens[current++];
            
            if (nameToken.type !== 'identifier') throw new Error("Erro Sintático: Esperado nome da estrela após 'estrela'");
            
            let assignToken = tokens[current++];
            if (assignToken.value !== '=') throw new Error("Erro Sintático: Esperado '=' na declaração da estrela");

            let valueNode = walk(); // Pega o valor (número, string ou outra variável)
            
            if (tokens[current].value !== ';') throw new Error("Erro Sintático: Faltou ponto e vírgula ';' no fim da declaração");
            current++; // pula ';'

            return {
                type: 'VariableDeclaration',
                name: nameToken.value,
                value: valueNode
            };
        }

        // Chamada de função (ex: supernova("ola"); )
        if (token.type === 'keyword' && token.value === 'supernova') {
            current++; // pula 'supernova'
            if (tokens[current++].value !== '(') throw new Error("Erro Sintático: Esperado '(' após 'supernova'");
            
            let argNode = walk();
            
            if (tokens[current++].value !== ')') throw new Error("Erro Sintático: Esperado ')' após argumentos");
            if (tokens[current++].value !== ';') throw new Error("Erro Sintático: Esperado ';' no final");

            return {
                type: 'CallExpression',
                name: 'supernova',
                argument: argNode
            };
        }

        // Primitivas
        if (token.type === 'number') {
            current++;
            return { type: 'NumericLiteral', value: token.value };
        }
        if (token.type === 'string') {
            current++;
            return { type: 'StringLiteral', value: token.value };
        }
        if (token.type === 'identifier') {
            current++;
            return { type: 'Identifier', value: token.value };
        }

        // Ignora tokens que o parser simples ainda não lida na raiz para evitar loop infinito
        current++; 
        return { type: 'Unknown', value: token.value };
    }

    let ast = {
        type: 'Program',
        body: []
    };

    while (current < tokens.length) {
        let node = walk();
        if (node && node.type !== 'Unknown') {
            ast.body.push(node);
        }
    }

    return ast;
}

// 3. ANALISADOR SEMÂNTICO
// Verifica regras de significado (escopo, tipos, variáveis não declaradas)
function semanticAnalyzer(ast) {
    const symbolUniverse = new Set(); // Guarda as estrelas (variáveis) declaradas no universo
    let logs = [];

    function traverse(node) {
        if (!node) return;

        switch (node.type) {
            case 'Program':
                node.body.forEach(traverse);
                break;
            
            case 'VariableDeclaration':
                if (symbolUniverse.has(node.name)) {
                    throw new Error(`Erro Semântico: A estrela '${node.name}' já foi descoberta (declarada)!`);
                }
                symbolUniverse.add(node.name);
                logs.push(`🪐 Semântica: Estrela '${node.name}' registrada na galáxia.`);
                traverse(node.value);
                break;

            case 'Identifier':
                if (!symbolUniverse.has(node.value)) {
                    throw new Error(`Erro Semântico: A estrela '${node.value}' é um mistério (não declarada)!`);
                }
                break;

            case 'CallExpression':
                traverse(node.argument);
                break;
        }
    }

    traverse(ast);
    return logs.join('\n');
}

// Função principal de compilação exposta para o server.js
function compileSOL(code) {
    let executionLogs = "";
    
    try {
        executionLogs += "🔭 Iniciando mapeamento do espaço (Análise Léxica)...\n";
        const tokens = lexicalAnalyzer(code);
        executionLogs += `✓ Lexer: ${tokens.length} partículas identificadas.\n\n`;

        executionLogs += "📐 Desenhando constelações (Análise Sintática)...\n";
        const ast = syntaxAnalyzer(tokens);
        executionLogs += "✓ Parser: Árvore Sintática formada.\n\n";

        executionLogs += "🌌 Verificando leis da física (Análise Semântica)...\n";
        const semanticLogs = semanticAnalyzer(ast);
        executionLogs += semanticLogs + "\n";
        executionLogs += "✓ Semântica: O universo está estável.\n\n";

        return {
            status: "success",
            logs: executionLogs + "✨ Compilação estelar concluída com sucesso!"
        };

    } catch (error) {
        return {
            status: "error",
            logs: executionLogs + "\n❌ CRITICAL FAILURE: " + error.message
        };
    }
}

module.exports = { compileSOL };