// Importando o Motor Léxico centralizado
const { lexicalAnalyzer } = require('./lexico');

function syntaxAnalyzer(tokens) {
    let current = 0;

    // Função auxiliar para tornar o ';' opcional e saber onde quebrar comandos
    function isStmtStarter(idx) {
        if (idx >= tokens.length) return true;
        let t = tokens[idx];
        if (t.value === ';' || t.value === ']') return true;
        
        // Se o Léxico já classificou como palavra-chave, é um novo comando nativo!
        if (t.type === 'keyword') return true;
        
        // Se for um nome seguido de '[' (Chamada de Função) ou '=' (Atribuição)
        if (t.type === 'identifier' && idx + 1 < tokens.length && (tokens[idx+1].value === '[' || tokens[idx+1].value === '=')) return true;
        
        return false;
    }

    function walk() {
        if (current >= tokens.length) return null;
        let token = tokens[current];

        // 1. BLOCOS DE AMBIENTE (esp / web)
        if (token.type === 'keyword' && (token.value === 'esp' || token.value === 'web')) {
            let envName = token.value; current++; 
            let body = [];
            while (current < tokens.length && !(tokens[current].type === 'keyword' && tokens[current].value === envName)) {
                let stmt = walk(); if (stmt) body.push(stmt);
            }
            if (current < tokens.length) current++; 
            return { type: 'EnvironmentBlock', environment: envName, body };
        }

        // 2. DECLARAÇÃO DE VARIÁVEIS (guarda / crava)
        if (token.type === 'keyword' && (token.value === 'guarda' || token.value === 'crava')) {
            let kind = token.value; current++; 
            let nameToken = tokens[current++];
            if (nameToken.type !== 'identifier') throw new Error(`Erro Sintático (ESP): Esperado nome após '${kind}'`);
            if (tokens[current].value !== '=') throw new Error(`Erro Sintático (ESP): Esperado '=' na declaração de '${nameToken.value}'`);
            current++; 
            let valueNodes = [];
            while(current < tokens.length && !isStmtStarter(current)) {
                valueNodes.push(tokens[current++]);
            }
            if (current < tokens.length && tokens[current].value === ';') current++; 
            return { type: 'VariableDeclaration', kind, name: nameToken.value, value: valueNodes };
        }

        // 3. DECLARAÇÃO DE TAREFAS
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

        // 4. CONDICIONAIS (testa / falha)
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

        // 5. LAÇO DE REPETIÇÃO (enquanto)
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
        
        // 6. CHAMADAS DE FUNÇÕES GENÉRICAS (envia, espera, mostra, ou tarefas customizadas)
        if ((token.type === 'keyword' || token.type === 'identifier') && current + 1 < tokens.length && tokens[current + 1].value === '[') {
            let funcName = token.value; current += 2; 
            let args = [];
            while (current < tokens.length && tokens[current].value !== ']') {
                if (tokens[current].value !== ',') args.push(tokens[current]); // Ignora vírgulas
                current++;
            }
            if (current < tokens.length) current++; // Pula o ']'
            if (current < tokens.length && tokens[current].value === ';') current++; // Ponto e vírgula opcional
            return { type: 'CallExpression', name: funcName, arguments: args };
        }
        
        // 7. ATRIBUIÇÃO DE VARIÁVEIS (x = 10)
        if (token.type === 'identifier' && current + 1 < tokens.length && tokens[current + 1].value === '=') {
            let nameToken = token; current += 2; 
            let valueNodes = [];
            while(current < tokens.length && !isStmtStarter(current)) {
                valueNodes.push(tokens[current++]);
            }
            if (current < tokens.length && tokens[current].value === ';') current++; 
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
            case 'CallExpression': break; // Libera a passagem das funções para o gerador C++ avaliar
        }
    }
    traverse(ast);
    return logs.join('\n');
}

// GERADOR C++ AVANÇADO
function translateVal(val) {
    if (val === 'sim') return 'true';
    if (val === 'nao') return 'false';
    return val;
}

function codeGeneratorCpp(node) {
    if (Array.isArray(node)) return node.map(codeGeneratorCpp).join('\n');
    
    switch (node.type) {
        case 'Program':
            let espBlocks = node.body.filter(n => n.type === 'EnvironmentBlock' && n.environment === 'esp').map(codeGeneratorCpp).join('\n');
            if(espBlocks.trim().length > 0) {
                // Truque avançado: cria um iniciar() fraco para a IDE do Arduino não dar erro caso o utilizador não crie a tarefa principal
                return `// CÓDIGO C++ GERADO PARA HARDWARE\n\n${espBlocks}\n\nvoid setup() {\n  Serial.begin(115200);\n  iniciar();\n}\n\nvoid loop() {\n  // Lógica principal rola nas tarefas\n}`;
            }
            return '';
        case 'EnvironmentBlock': return node.environment === 'esp' ? codeGeneratorCpp(node.body) : '';
        case 'VariableDeclaration': return `${node.kind === 'crava' ? 'const int' : 'int'} ${node.name} = ${node.value.map(n => translateVal(n.value)).join('')};`;
        case 'FunctionDeclaration': return `void ${node.name}(${node.params.map(p => `String ${p}`).join(', ')}) {\n  ${codeGeneratorCpp(node.body)}\n}`;
        case 'IfStatement':
            let ifCode = `if (${node.condition.map(n => translateVal(n.value)).join(' ')}) {\n  ${codeGeneratorCpp(node.consequent)}\n}`;
            if (node.alternate) ifCode += ` else {\n  ${codeGeneratorCpp(node.alternate)}\n}`;
            return ifCode;
        case 'WhileStatement':
            return `while (${node.condition.map(n => translateVal(n.value)).join(' ')}) {\n  ${codeGeneratorCpp(node.body)}\n}`;
        case 'CallExpression': 
            // Ignora os comandos visuais da Web
            if (['caixa', 'texto', 'botao', 'estilo', 'atualiza', 'limpa', 'coloca', 'tema'].includes(node.name)) {
                return '';
            }
            if(node.name === 'mostra') return `Serial.println(${node.arguments.map(n => '"' + n.value + '"').join(' ')});`;
            if(node.name === 'espera') {
                let time = node.arguments[0] ? node.arguments[0].value : '1000';
                return `delay(${time});`;
            }
            if(node.name === 'envia') {
                let pin = node.arguments[0] ? node.arguments[0].value : '0';
                let state = node.arguments[1] ? node.arguments[1].value : '0';
                return `pinMode(${pin}, OUTPUT);\n  digitalWrite(${pin}, ${state});`;
            }
            // Retorno padrão para tarefas personalizadas
            return `${node.name}(${node.arguments.map(n => translateVal(n.value)).join(', ')});`;
        case 'AssignmentExpression':
            return `${node.name} = ${node.value.map(n => translateVal(n.value)).join('')};`;
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
            executionLogs += "✓ Motor ESP32: Esqueleto C++ gerado com sucesso.\n";
        } else {
            executionLogs += "✓ Motor ESP32: Nenhum bloco 'esp' detectado para compilar.\n";
        }

        return { status: "success", logs: executionLogs, generatedCpp };
    } catch (error) {
        let errMsg = error.message;
        if(error.type) {
            errMsg = `[${error.type} na Linha ${error.line}]: ${error.message}`;
        }
        return { status: "error", logs: executionLogs + "\n❌ ERRO ESP32: " + errMsg };
    }
}

module.exports = { compileEsp };