const KEYWORDS = [
    'tarefa', 'guarda', 'crava', 'testa', 
    'falha', 'gira', 'mostra', 'manda', 'envia', 'tema',
    'sim', 'nao', 'esp', 'web'
];

// O motor Lexico e Sintático é o mesmo por enquanto,
// a principal diferença será na Análise Semântica e Geração de Código!
function lexicalAnalyzer(code) {
    let current = 0;
    let tokens = [];

    while (current < code.length) {
        let char = code[current];
        if (/\s/.test(char)) { current++; continue; }
        if (char === '/' && code[current + 1] === '/') {
            while (current < code.length && code[current] !== '\n') current++;
            continue;
        }
        if (/[\[\];=><!+\-*/,]/.test(char)) {
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
        if (/[(){}]/.test(char)) {
            throw new Error(`Erro Lexico (ESP): Chaves e Parênteses são proibidos! Use apenas colchetes []. Encontrado: '${char}'`);
        }
        if (/[0-9]/.test(char)) {
            let value = '';
            while (/[0-9]/.test(char)) { value += char; char = code[++current]; }
            tokens.push({ type: 'number', value: parseInt(value, 10) });
            continue;
        }
        if (char === '"') {
            let value = ''; char = code[++current]; 
            while (current < code.length && char !== '"') { value += char; char = code[++current]; }
            current++; tokens.push({ type: 'string', value });
            continue;
        }
        if (/[a-zA-Z_]/.test(char)) {
            let value = '';
            while (current < code.length && /[a-zA-Z0-9_]/.test(char)) { value += char; char = code[++current]; }
            if (KEYWORDS.includes(value)) tokens.push({ type: 'keyword', value });
            else tokens.push({ type: 'identifier', value });
            continue;
        }
        throw new Error(`Erro Lexico (ESP): Caractere não reconhecido: '${char}'`);
    }
    return tokens;
}

function syntaxAnalyzer(tokens) {
    let current = 0;
    function walk() {
        if (current >= tokens.length) return null;
        let token = tokens[current];

        if (token.type === 'keyword' && (token.value === 'esp' || token.value === 'web')) {
            let envName = token.value; current++; 
            let body = [];
            while (current < tokens.length && !(tokens[current].type === 'keyword' && tokens[current].value === envName)) {
                let stmt = walk(); if (stmt) body.push(stmt);
            }
            if (current < tokens.length) current++; 
            return { type: 'EnvironmentBlock', environment: envName, body };
        }
        if (token.type === 'keyword' && (token.value === 'guarda' || token.value === 'crava')) {
            let kind = token.value; current++; 
            let nameToken = tokens[current++];
            if (nameToken.type !== 'identifier') throw new Error(`Erro Sintático (ESP): Esperado nome após '${kind}'`);
            if (tokens[current].value !== '=') throw new Error(`Erro Sintático (ESP): Esperado '=' na declaração de '${nameToken.value}'`);
            current++; 
            let valueNodes = [];
            while(current < tokens.length && tokens[current].value !== ';') valueNodes.push(tokens[current++]);
            if (tokens[current] && tokens[current].value !== ';') throw new Error("Erro Sintático (ESP): Faltou ';'");
            current++; 
            return { type: 'VariableDeclaration', kind, name: nameToken.value, value: valueNodes };
        }
        if (token.type === 'keyword' && token.value === 'tarefa') {
            current++; let nameToken = tokens[current++];
            if (tokens[current].value !== '[') throw new Error("Erro Sintático (ESP): Esperado '[' para argumentos");
            current++; 
            let params = [];
            while (tokens[current].value !== ']') {
                if (tokens[current].type === 'identifier') params.push(tokens[current].value);
                current++;
            }
            current++; 
            if (tokens[current].value !== '[') throw new Error("Erro Sintático (ESP): Esperado '[' para bloco da tarefa");
            current++; 
            let body = [];
            while (tokens[current].value !== ']') {
                let stmt = walk(); if (stmt) body.push(stmt);
            }
            current++; 
            return { type: 'FunctionDeclaration', name: nameToken.value, params, body };
        }
        if (token.type === 'keyword' && token.value === 'testa') {
            current++; if (tokens[current].value !== '[') throw new Error("Erro Sintático (ESP): Esperado '[' após 'testa'");
            current++; 
            let condition = [];
            while (tokens[current].value !== ']') condition.push(tokens[current++]);
            current++; 
            if (tokens[current].value !== '[') throw new Error("Erro Sintático (ESP): Esperado '[' para bloco 'testa'");
            current++; 
            let consequent = [];
            while (tokens[current].value !== ']') { let stmt = walk(); if (stmt) consequent.push(stmt); }
            current++; 
            let alternate = null;
            if (current < tokens.length && tokens[current].value === 'falha') {
                current++; if (tokens[current].value !== '[') throw new Error("Erro Sintático (ESP): Esperado '['");
                current++; alternate = [];
                while (tokens[current].value !== ']') { let stmt = walk(); if (stmt) alternate.push(stmt); }
                current++; 
            }
            return { type: 'IfStatement', condition, consequent, alternate };
        }
        if (token.type === 'keyword' && (token.value === 'mostra' || token.value === 'envia' || token.value === 'tema')) {
            let funcName = token.value; current++; 
            if (tokens[current++].value !== '[') throw new Error(`Erro Sintático (ESP): Esperado '[' após '${funcName}'`);
            let args = [];
            while (tokens[current].value !== ']') args.push(tokens[current++]);
            current++; 
            if (tokens[current].value !== ';') throw new Error(`Erro Sintático (ESP): Esperado ';' após ${funcName}`);
            current++; 
            return { type: 'CallExpression', name: funcName, arguments: args };
        }
        if (token.type === 'identifier' && current + 1 < tokens.length && tokens[current + 1].value === '=') {
            let nameToken = token; current += 2; 
            let valueNodes = [];
            while(current < tokens.length && tokens[current].value !== ';') valueNodes.push(tokens[current++]);
            current++; 
            return { type: 'AssignmentExpression', name: nameToken.value, value: valueNodes };
        }
        current++; return { type: 'Unknown', value: token.value };
    }

    let ast = { type: 'Program', body: [] };
    while (current < tokens.length) {
        let node = walk(); if (node && node.type !== 'Unknown') ast.body.push(node);
    }
    return ast;
}

function semanticAnalyzer(ast) {
    const symbolUniverse = new Set(); 
    let logs = [];
    function traverse(node) {
        if (!node) return;
        if (Array.isArray(node)) { node.forEach(traverse); return; }
        switch (node.type) {
            case 'Program': node.body.forEach(traverse); break;
            case 'EnvironmentBlock': if(node.environment === 'esp') logs.push(`\n🔌 [ESP32] Analisando hardware...`); node.body.forEach(traverse); break;
            case 'FunctionDeclaration':
                if (symbolUniverse.has(node.name)) throw new Error(`Erro Semântico (ESP): A tarefa '${node.name}' já existe!`);
                symbolUniverse.add(node.name); logs.push(`⚙️ [ESP32] Rotina alocada -> ${node.name}()`); traverse(node.body); break;
            case 'VariableDeclaration':
                if (symbolUniverse.has(node.name)) throw new Error(`Erro Semântico (ESP): '${node.name}' já foi declarada!`);
                symbolUniverse.add(node.name); logs.push(`⚙️ [ESP32] Pino/Memória alocado -> '${node.name}'.`); break;
            case 'AssignmentExpression':
                if (!symbolUniverse.has(node.name)) throw new Error(`Erro Semântico (ESP): Variável '${node.name}' não existe!`); break;
            case 'IfStatement': traverse(node.consequent); if (node.alternate) traverse(node.alternate); break;
        }
    }
    traverse(ast);
    return logs.join('\n');
}

// === NOVO: GERADOR C++ (Preparando para o futuro) ===
function codeGeneratorCpp(node) {
    // Por enquanto, isso é apenas um rascunho de como as tarefas SOL
    // vão virar código C++ (Arduino/ESP) na próxima fase do seu projeto!
    if (Array.isArray(node)) return node.map(codeGeneratorCpp).join('\n');
    
    switch (node.type) {
        case 'Program':
            let espBlocks = node.body.filter(n => n.type === 'EnvironmentBlock' && n.environment === 'esp').map(codeGeneratorCpp).join('\n');
            if(espBlocks.trim().length > 0) {
                return `// CÓDIGO C++ GERADO PARA ESP32\n#include <WiFi.h>\n#include <PubSubClient.h>\n\n${espBlocks}\n\nvoid setup() {\n  Serial.begin(115200);\n  if (iniciar) iniciar();\n}\n\nvoid loop() {\n  // Lógica de Loop MQTT\n}`;
            }
            return '';
        case 'EnvironmentBlock': return node.environment === 'esp' ? codeGeneratorCpp(node.body) : '';
        case 'VariableDeclaration': return `${node.kind === 'crava' ? 'const int' : 'int'} ${node.name} = ${node.value.map(n => n.value).join('')};`;
        case 'FunctionDeclaration': return `void ${node.name}(${node.params.map(p => `String ${p}`).join(', ')}) {\n  ${codeGeneratorCpp(node.body)}\n}`;
        case 'CallExpression': 
            if(node.name === 'mostra') return `Serial.println(${node.arguments.map(n => '"' + n.value + '"').join(' ')});`;
            return `// Chamada de função: ${node.name}`;
        default: return '';
    }
}

function compileEsp(code) {
    let executionLogs = "";
    try {
        const tokens = lexicalAnalyzer(code);
        const ast = syntaxAnalyzer(tokens);
        executionLogs += semanticAnalyzer(ast) + "\n";
        
        let cppCode = codeGeneratorCpp(ast);
        let hasEspBlock = ast.body.some(n => n.type === 'EnvironmentBlock' && n.environment === 'esp');
        let generatedCpp = null;

        if (hasEspBlock) {
            generatedCpp = cppCode;
            executionLogs += "✓ Motor ESP32: Esqueleto C++ (Arduino) preparado para a placa.\n";
        } else {
            executionLogs += "✓ Motor ESP32: Nenhum bloco 'esp' detectado para gerar C++.\n";
        }

        return { status: "success", logs: executionLogs, generatedCpp };
    } catch (error) {
        return { status: "error", logs: executionLogs + "\n❌ ERRO ESP32: " + error.message };
    }
}

module.exports = { compileEsp };