const KEYWORDS = [
    'tarefa', 'guarda', 'crava', 'testa', 
    'falha', 'gira', 'mostra', 'manda', 'envia', 'tema',
    'caixa', 'texto', 'botao', 'estilo', 'atualiza', 'limpa', 'coloca',
    'sim', 'nao', 'esp', 'web'
];

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
            throw new Error(`Erro Lexico (WEB): Chaves e Parênteses são proibidos! Use apenas colchetes []. Encontrado: '${char}'`);
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
        throw new Error(`Erro Lexico (WEB): Caractere não reconhecido: '${char}'`);
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
            if (nameToken.type !== 'identifier') throw new Error(`Erro Sintático (WEB): Esperado nome após '${kind}'`);
            if (tokens[current].value !== '=') throw new Error(`Erro Sintático (WEB): Esperado '=' na declaração de '${nameToken.value}'`);
            current++; 
            let valueNodes = [];
            while(current < tokens.length && tokens[current].value !== ';') valueNodes.push(tokens[current++]);
            if (tokens[current] && tokens[current].value !== ';') throw new Error("Erro Sintático (WEB): Faltou ';'");
            current++; 
            return { type: 'VariableDeclaration', kind, name: nameToken.value, value: valueNodes };
        }
        if (token.type === 'keyword' && token.value === 'tarefa') {
            current++; let nameToken = tokens[current++];
            if (tokens[current].value !== '[') throw new Error("Erro Sintático (WEB): Esperado '[' para argumentos");
            current++; 
            let params = [];
            while (tokens[current].value !== ']') {
                if (tokens[current].type === 'identifier') params.push(tokens[current].value);
                current++;
            }
            current++; 
            if (tokens[current].value !== '[') throw new Error("Erro Sintático (WEB): Esperado '[' para bloco da tarefa");
            current++; 
            let body = [];
            while (tokens[current].value !== ']') {
                let stmt = walk(); if (stmt) body.push(stmt);
            }
            current++; 
            return { type: 'FunctionDeclaration', name: nameToken.value, params, body };
        }
        if (token.type === 'keyword' && token.value === 'testa') {
            current++; if (tokens[current].value !== '[') throw new Error("Erro Sintático (WEB): Esperado '[' após 'testa'");
            current++; 
            let condition = [];
            while (tokens[current].value !== ']') condition.push(tokens[current++]);
            current++; 
            if (tokens[current].value !== '[') throw new Error("Erro Sintático (WEB): Esperado '[' para bloco 'testa'");
            current++; 
            let consequent = [];
            while (tokens[current].value !== ']') { let stmt = walk(); if (stmt) consequent.push(stmt); }
            current++; 
            let alternate = null;
            if (current < tokens.length && tokens[current].value === 'falha') {
                current++; if (tokens[current].value !== '[') throw new Error("Erro Sintático (WEB): Esperado '['");
                current++; alternate = [];
                while (tokens[current].value !== ']') { let stmt = walk(); if (stmt) alternate.push(stmt); }
                current++; 
            }
            return { type: 'IfStatement', condition, consequent, alternate };
        }
        
        const uiCommands = ['mostra', 'envia', 'tema', 'caixa', 'texto', 'botao', 'estilo', 'atualiza', 'limpa', 'coloca'];
        if (token.type === 'keyword' && uiCommands.includes(token.value)) {
            let funcName = token.value; current++; 
            if (tokens[current++].value !== '[') throw new Error(`Erro Sintático (WEB): Esperado '[' após '${funcName}'`);
            let args = [];
            while (tokens[current].value !== ']') args.push(tokens[current++]);
            current++; 
            if (tokens[current].value !== ';') throw new Error(`Erro Sintático (WEB): Esperado ';' após ${funcName}`);
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
            case 'EnvironmentBlock': if(node.environment === 'web') logs.push(`\n🌐 [WEB] Analisando ambiente visual...`); node.body.forEach(traverse); break;
            case 'FunctionDeclaration':
                if (symbolUniverse.has(node.name)) throw new Error(`Erro Semântico (WEB): A tarefa '${node.name}' já existe!`);
                symbolUniverse.add(node.name); logs.push(`⚙️ [WEB] Tarefa registrada -> ${node.name}`); traverse(node.body); break;
            case 'VariableDeclaration':
                if (symbolUniverse.has(node.name)) throw new Error(`Erro Semântico (WEB): '${node.name}' já foi declarada!`);
                symbolUniverse.add(node.name); logs.push(`⚙️ [WEB] Memória alocada -> '${node.name}'.`); break;
            case 'AssignmentExpression':
                if (!symbolUniverse.has(node.name)) throw new Error(`Erro Semântico (WEB): Variável '${node.name}' não existe!`); break;
            case 'IfStatement': traverse(node.consequent); if (node.alternate) traverse(node.alternate); break;
        }
    }
    traverse(ast);
    return logs.join('\n');
}

function tokensToJS(tokensArray) {
    return tokensArray.map(t => {
        if (t.type === 'string') return '"' + t.value + '"';
        if (t.value === 'sim') return 'true';
        if (t.value === 'nao') return 'false';
        return t.value;
    }).join(' ');
}

function codeGenerator(node) {
    if (Array.isArray(node)) return node.map(codeGenerator).join('\n');
    switch (node.type) {
        case 'Program':
            let globals = node.body.filter(n => n.type !== 'EnvironmentBlock').map(codeGenerator).join('\n');
            let webBlocks = node.body.filter(n => n.type === 'EnvironmentBlock' && n.environment === 'web').map(codeGenerator).join('\n');
            return globals + '\n' + webBlocks;
        case 'EnvironmentBlock': return node.environment === 'web' ? codeGenerator(node.body) : '';
        case 'VariableDeclaration': return `${node.kind === 'crava' ? 'const' : 'let'} ${node.name} = ${tokensToJS(node.value)};`;
        case 'FunctionDeclaration': return `function ${node.name}(${node.params.join(', ')}) {\n  ${codeGenerator(node.body)}\n}`;
        case 'AssignmentExpression': return `${node.name} = ${tokensToJS(node.value)};`;
        case 'IfStatement':
            let ifCode = `if (${tokensToJS(node.condition)}) {\n  ${codeGenerator(node.consequent)}\n}`;
            if (node.alternate) ifCode += ` else {\n  ${codeGenerator(node.alternate)}\n}`;
            return ifCode;
        case 'CallExpression':
            // Separa os argumentos por vírgula corretamente
            let argsArr = [];
            let currentArg = [];
            node.arguments.forEach(t => {
                if (t.value === ',') {
                    argsArr.push(tokensToJS(currentArg));
                    currentArg = [];
                } else {
                    currentArg.push(t);
                }
            });
            if (currentArg.length > 0) argsArr.push(tokensToJS(currentArg));

            // ==== NOVOS COMANDOS DE CRIAÇÃO DE UI NATIVOS DA SOLINGUAGEM ====
            if (node.name === 'caixa') {
                return `(function(){ let el = document.createElement('div'); el.id = ${argsArr[0]}; document.body.appendChild(el); })();`;
            }
            if (node.name === 'texto') {
                return `(function(){ let el = document.createElement('div'); el.id = ${argsArr[0]}; el.innerText = ${argsArr[1]}; document.body.appendChild(el); })();`;
            }
            if (node.name === 'botao') {
                let funcName = argsArr[2] ? argsArr[2].replace(/"/g, '') : '';
                return `(function(){ let el = document.createElement('button'); el.id = ${argsArr[0]}; el.innerText = ${argsArr[1]}; el.onclick = function() { if(typeof window['${funcName}'] === 'function') window['${funcName}'](); }; document.body.appendChild(el); })();`;
            }
            if (node.name === 'estilo') {
                return `document.getElementById(${argsArr[0]}).style.cssText += ${argsArr[1]};`;
            }
            if (node.name === 'atualiza') {
                return `document.getElementById(${argsArr[0]}).innerText = ${argsArr[1]};`;
            }
            if (node.name === 'coloca') {
                return `document.getElementById(${argsArr[1]}).appendChild(document.getElementById(${argsArr[0]}));`;
            }
            if (node.name === 'limpa') {
                return `document.body.innerHTML = '';`;
            }

            // Comandos antigos
            if (node.name === 'tema') {
                return `(function(){ let t = ${argsArr[0]}; let s = document.createElement('style'); if(t === "vermelho") { document.body.style.backgroundColor = "#0d0000"; document.body.style.color = "#ff4444"; s.innerHTML = "button { background: linear-gradient(135deg, #cc0000, #660000) !important; color: white !important; border: 1px solid #ff3333 !important; box-shadow: 0 4px 15px rgba(255,0,0,0.4); } .terminal { border: 1px solid #ff3333 !important; color: #ff6666 !important; background-color: #1a0000 !important; } h1, p { color: #ff5555; }"; } document.head.appendChild(s); })();`;
            }
            if (node.name === 'mostra') return `console.log(${argsArr.join(', ')});`;
            if (node.name === 'envia') return `console.log("📡 [MQTT Enviando]: " + ${argsArr.join(', ')});`;
            
            return `${node.name}(${argsArr.join(', ')});`;
        default: return '';
    }
}

function compileWeb(code) {
    let executionLogs = "";
    try {
        const tokens = lexicalAnalyzer(code);
        const ast = syntaxAnalyzer(tokens);
        executionLogs += semanticAnalyzer(ast) + "\n";
        
        let webJS = codeGenerator(ast);
        let hasWebBlock = ast.body.some(n => n.type === 'EnvironmentBlock' && n.environment === 'web');
        let generatedWeb = null;

        if (hasWebBlock) {
            generatedWeb = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Painel Web - SOLinguagem</title>
    <style>
        body { font-family: 'Inter', sans-serif; background-color: #06060a; color: #f0f0f5; padding: 40px; text-align: center; transition: all 0.3s;}
        .terminal { background-color: rgba(20, 20, 30, 0.8); border: 1px solid #333; padding: 20px; border-radius: 12px; margin-top: 30px; text-align: left; font-family: monospace; color: #00e5ff; height: 300px; overflow-y: auto;}
        button { background: linear-gradient(135deg, #00e5ff, #0055ff); color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; margin: 10px; font-weight: bold; transition: all 0.2s;}
        button:hover { transform: scale(1.05); }
    </style>
</head>
<body>
    <div id="default-ui">
        <h1>Painel de Controle 🚀</h1>
        <p>Abaixo estão os botões interativos gerados através do código SOL.</p>
        <div id="action-buttons"></div>
        <div class="terminal" id="logs"><div>> Sistema Iniciado. Aguardando comandos...</div></div>
    </div>
    <script>
        const terminalUI = document.getElementById('logs');
        const oldLog = console.log;
        console.log = function(message) {
            if(document.body.contains(terminalUI)) {
                terminalUI.innerHTML += '<div>> ' + message + '</div>';
                terminalUI.scrollTop = terminalUI.scrollHeight;
            }
            oldLog.apply(console, arguments);
        };

        // Cria botões automáticos apenas se a tela não for limpa
        const generateDefaultButtons = () => {
            if(!document.getElementById('action-buttons')) return;
            const actionsDiv = document.getElementById('action-buttons');
            for (let prop in window) {
                if (typeof window[prop] === 'function' && prop !== 'iniciar' && prop !== 'console' && prop !== 'generateDefaultButtons') {
                    if(window[prop].toString().indexOf('[native code]') === -1) {
                        let btn = document.createElement('button');
                        btn.innerText = prop.replace(/_/g, ' ');
                        btn.onclick = window[prop];
                        actionsDiv.appendChild(btn);
                    }
                }
            }
        };

        // === CÓDIGO SOL (WEB) APLICADO AQUI ===
        ${webJS}

        // Inicia a aplicação
        if (typeof iniciar === "function") iniciar();
        generateDefaultButtons();
    </script>
</body>
</html>`;
            executionLogs += "✓ Motor WEB: HTML e DOM configurados com sucesso.\n";
        } else {
            executionLogs += "✓ Motor WEB: Nenhum bloco 'web' detectado.\n";
        }

        return { status: "success", logs: executionLogs, generatedWeb };
    } catch (error) {
        return { status: "error", logs: executionLogs + "\n❌ ERRO WEB: " + error.message };
    }
}

module.exports = { compileWeb };