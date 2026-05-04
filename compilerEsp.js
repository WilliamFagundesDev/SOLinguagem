// Importando o Motor Léxico centralizado para manter o padrão idêntico ao Web
const { lexicalAnalyzer } = require('./lexico');

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

        // Adição da Sintaxe para o comando de Repetição (enquanto) para ESP32
        if (token.type === 'keyword' && token.value === 'enquanto') {
            current++; if (tokens[current].value !== '[') throw new Error("Erro Sintático (ESP): Esperado '[' após 'enquanto'");
            current++; 
            let condition = [];
            while (tokens[current].value !== ']') condition.push(tokens[current++]);
            current++; 
            if (tokens[current].value !== '[') throw new Error("Erro Sintático (ESP): Esperado '[' para abrir o bloco do 'enquanto'");
            current++; 
            let body = [];
            while (tokens[current].value !== ']') { let stmt = walk(); if (stmt) body.push(stmt); }
            current++; 
            return { type: 'WhileStatement', condition, body };
        }
        
        const uiCommands = ['mostra', 'envia', 'tema', 'caixa', 'texto', 'botao', 'estilo', 'atualiza', 'limpa', 'coloca'];
        if (token.type === 'keyword' && uiCommands.includes(token.value)) {
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
            case 'WhileStatement': traverse(node.body); break;
        }
    }
    traverse(ast);
    return logs.join('\n');
}

// GERADOR C++
function codeGeneratorCpp(node) {
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
        case 'IfStatement':
            let ifCode = `if (${node.condition.map(n => n.value).join(' ')}) {\n  ${codeGeneratorCpp(node.consequent)}\n}`;
            if (node.alternate) ifCode += ` else {\n  ${codeGeneratorCpp(node.alternate)}\n}`;
            return ifCode;
        case 'WhileStatement':
            return `while (${node.condition.map(n => n.value).join(' ')}) {\n  ${codeGeneratorCpp(node.body)}\n}`;
        case 'CallExpression': 
            // O motor ESP ignora silenciosamente os comandos de UI exclusivos da Web!
            if (['caixa', 'texto', 'botao', 'estilo', 'atualiza', 'limpa', 'coloca', 'tema'].includes(node.name)) {
                return `// Comando visual ignorado pelo ESP32: ${node.name}`;
            }
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
            executionLogs += "✓ Motor ESP32: Esqueleto C++ preparado. (Ignorando blocos Web).\n";
        } else {
            executionLogs += "✓ Motor ESP32: Nenhum bloco 'esp' detectado para gerar C++.\n";
        }

        return { status: "success", logs: executionLogs, generatedCpp };
    } catch (error) {
        // Agora o Léxico repassa a Linha de erro. Vamos capturar isso para o terminal do ESP!
        let errMsg = error.message;
        if(error.type) {
            errMsg = `[${error.type} na Linha ${error.line}]: ${error.message}`;
        }
        return { status: "error", logs: executionLogs + "\n❌ ERRO ESP32: " + errMsg };
    }
}

module.exports = { compileEsp };