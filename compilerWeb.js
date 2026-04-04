// Importando os nossos módulos de Sintaxe e Semântica!
const { syntaxAnalyzer } = require('./sintaxe');
const { semanticAnalyzer } = require('./semantica');

const KEYWORDS = [
    'tarefa', 'guarda', 'crava', 'testa', 
    'falha', 'gira', 'mostra', 'manda', 'envia', 'tema',
    'caixa', 'texto', 'botao', 'estilo', 'atualiza', 'limpa', 'coloca',
    'cor', 'tamanho', 'funcao', 
    'sim', 'nao', 'esp', 'web'
];

function lexicalAnalyzer(code) {
    let current = 0;
    let tokens = [];

    function getPos() {
        let line = 1, col = 1;
        for (let i = 0; i < current; i++) {
            if (code[i] === '\n') { line++; col = 1; }
            else { col++; }
        }
        return { line, col };
    }

    while (current < code.length) {
        let char = code[current];
        let pos = getPos(); 

        if (/\s/.test(char)) { current++; continue; }
        if (char === '/' && code[current + 1] === '/') {
            while (current < code.length && code[current] !== '\n') current++;
            continue;
        }
        if (/[\[\];=><!+\-*/,]/.test(char)) {
            if ((char === '=' || char === '>' || char === '<' || char === '!') && code[current + 1] === '=') {
                tokens.push({ type: 'operator', value: char + '=', line: pos.line, column: pos.col });
                current += 2;
                continue;
            }
            let type = 'punctuation';
            if (/[+\-*/=><!]/.test(char)) type = 'operator';
            tokens.push({ type, value: char, line: pos.line, column: pos.col });
            current++;
            continue;
        }
        if (/[(){}]/.test(char)) {
            throw { type: 'Erro Léxico', message: `Chaves e Parênteses são proibidos! Use apenas colchetes []. Encontrado: '${char}'`, line: pos.line, column: pos.col };
        }
        if (/[0-9]/.test(char)) {
            let value = '';
            while (current < code.length && /[0-9]/.test(char)) { value += char; char = code[++current]; }
            tokens.push({ type: 'number', value: parseInt(value, 10), line: pos.line, column: pos.col });
            continue;
        }
        if (char === '"') {
            let value = ''; char = code[++current]; 
            while (current < code.length && char !== '"') { value += char; char = code[++current]; }
            current++; tokens.push({ type: 'string', value, line: pos.line, column: pos.col });
            continue;
        }
        if (/[a-zA-Z_]/.test(char)) {
            let value = '';
            while (current < code.length && /[a-zA-Z0-9_]/.test(char)) { value += char; char = code[++current]; }
            if (KEYWORDS.includes(value)) tokens.push({ type: 'keyword', value, line: pos.line, column: pos.col });
            else tokens.push({ type: 'identifier', value, line: pos.line, column: pos.col });
            continue;
        }
        throw { type: 'Erro Léxico', message: `Caractere não reconhecido: '${char}'`, line: pos.line, column: pos.col };
    }
    return tokens;
}

function tokensToJS(tokensArray) {
    if(!tokensArray) return '';
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
        case 'FunctionDeclaration': return `function ${node.name}() {\n  ${codeGenerator(node.body)}\n}`;
        case 'AssignmentExpression': return `${node.name} = ${tokensToJS(node.value)};`;
        
        case 'IfStatement':
            let ifCode = `if (${tokensToJS(node.condition)}) {\n  ${codeGenerator(node.consequent)}\n}`;
            if (node.alternate) ifCode += ` else {\n  ${codeGenerator(node.alternate)}\n}`;
            return ifCode;

        case 'UIElement':
            let js = `(function(){\n`;
            let elId = node.id ? `"${node.id.replace(/"/g, '')}"` : `"tema_app"`;
            
            if (node.kind === 'tema') {
                let cor = node.properties.cor ? node.properties.cor.replace(/"/g, '') : 'branco';
                let bg = cor === 'escuro' || cor === 'preto' ? '#0d0d0d' : cor === 'vermelho' ? '#1a0000' : '#ffffff';
                let fg = bg === '#ffffff' ? '#111' : '#eee';
                js += `  document.body.style.backgroundColor = "${bg}";\n`;
                js += `  document.body.style.color = "${fg}";\n`;
                js += `})();\n`;
                return js;
            }

            let tag = node.kind === 'caixa' ? 'div' : node.kind === 'botao' ? 'button' : 'span';
            js += `  let el = document.getElementById(${elId}) || document.createElement('${tag}');\n`;
            js += `  el.id = ${elId};\n`;

            if (node.properties.texto) {
                js += `  el.innerText = "${node.properties.texto.replace(/"/g, '')}";\n`;
            }
            if (node.properties.funcao) {
                let fName = node.properties.funcao.replace(/"/g, '');
                js += `  el.onclick = function() { if(typeof window['${fName}'] === 'function') window['${fName}'](); };\n`;
            }

            let css = "";
            const DicionarioCores = {
                "azul": "#0055ff", "vermelho": "#ff3333", "branco": "#ffffff", "preto": "#000000", "verde": "#00cc66",
                "amarelo": "#ffaa00", "cinza": "#888888"
            };
            
            if (node.properties.cor) {
                let c = node.properties.cor.replace(/"/g, '');
                css += `background-color: ${DicionarioCores[c] || c}; color: ${c==='branco'||c==='amarelo' ? '#000' : '#fff'}; `;
            }
            
            if (node.properties.tamanho) {
                let t = node.properties.tamanho.replace(/"/g, '');
                if (t === 'grande') css += "padding: 20px; font-size: 24px; font-weight: bold; ";
                if (t === 'pequeno') css += "padding: 8px 12px; font-size: 14px; ";
                if (t === 'medio') css += "padding: 12px 18px; font-size: 18px; ";
                if (t === 'gigante') css += "padding: 30px; font-size: 40px; font-weight: bold; ";
            }

            if (node.properties.estilo) {
                let e = node.properties.estilo.replace(/"/g, '');
                const EstilosProntos = {
                    "moderno": "border: none; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.2); transition: 0.2s;",
                    "arredondado": "border-radius: 50px; border: none;",
                    "quadrado": "border-radius: 0px; border: 2px solid currentColor;",
                    "invisivel": "background: transparent; border: none; box-shadow: none;"
                };
                css += (EstilosProntos[e] || e) + "; ";
            }

            if (node.kind === 'botao' && !css.includes('cursor')) css += "cursor: pointer; ";
            if (css) js += `  el.style.cssText += \`${css}\`;\n`;

            if (node.properties.coloca) {
                let parentId = node.properties.coloca.replace(/"/g, '');
                js += `  let parent = document.getElementById("${parentId}");\n`;
                js += `  if (parent && !el.parentNode) parent.appendChild(el);\n`;
            } else {
                js += `  let parent = document.getElementById('app') || document.body;\n`;
                js += `  if (!el.parentNode) parent.appendChild(el);\n`;
            }

            js += `})();\n`;
            return js;

        case 'CallExpression':
            let argsArr = [];
            let currentArg = [];
            node.arguments.forEach(t => {
                if (t.value === ',') { argsArr.push(tokensToJS(currentArg)); currentArg = []; } 
                else currentArg.push(t);
            });
            if (currentArg.length > 0) argsArr.push(tokensToJS(currentArg));

            if (node.name === 'atualiza') return `(function(){ let e = document.getElementById(${argsArr[0]}); if(e) e.innerText = ${argsArr[1]}; })();`;
            if (node.name === 'limpa') return `let appNode = document.getElementById('app'); if(appNode) appNode.innerHTML = ''; else document.body.innerHTML = '';`;
            if (node.name === 'mostra') return `console.log(${argsArr.join(', ')});`;
            
            return `${node.name}(${argsArr.join(', ')});`;
        default: return '';
    }
}

function compileWeb(code) {
    let executionLogs = "";
    let allErrors = []; 
    
    try {
        const tokens = lexicalAnalyzer(code);
        
        const syntaxResult = syntaxAnalyzer(tokens);
        allErrors.push(...syntaxResult.errors); 
        
        const semanticResult = semanticAnalyzer(syntaxResult.ast);
        allErrors.push(...semanticResult.errors); 
        
        executionLogs += semanticResult.logs + "\n";
        
        if (allErrors.length > 0) {
            let errorText = "\n❌ ERROS DETECTADOS:\n" + allErrors.map(e => `${e.type} na Linha ${e.line}: ${e.message}`).join('\n');
            return {
                status: "error",
                errorDetails: allErrors, 
                logs: executionLogs + errorText
            };
        }

        let webJS = codeGenerator(syntaxResult.ast);
        let hasWebBlock = syntaxResult.ast.body.some(n => n.type === 'EnvironmentBlock' && n.environment === 'web');
        let generatedWeb = null;

        if (hasWebBlock) {
            generatedWeb = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Aplicação SOL</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', sans-serif; background-color: #06060a; color: #f0f0f5; overflow-x: hidden; transition: background-color 0.3s, color 0.3s; }
        #app { width: 100vw; min-height: 100vh; }
        #logs { 
            position: fixed; bottom: 20px; right: 20px; 
            background-color: rgba(20, 20, 30, 0.95); border: 1px solid #333; 
            padding: 15px; border-radius: 8px; font-family: monospace; color: #00e5ff; 
            max-height: 200px; max-width: 400px; overflow-y: auto; display: none; 
            z-index: 9999; box-shadow: 0 10px 25px rgba(0,0,0,0.7); 
        }
    </style>
</head>
<body>
    <div id="app"></div>
    <div id="logs"></div>
    <script>
        const terminalUI = document.getElementById('logs');
        const oldLog = console.log;
        let logTimeout;
        console.log = function(message) {
            if(terminalUI) {
                terminalUI.style.display = 'block';
                terminalUI.innerHTML += '<div>> ' + message + '</div>';
                terminalUI.scrollTop = terminalUI.scrollHeight;
                clearTimeout(logTimeout);
                logTimeout = setTimeout(() => { terminalUI.style.display = 'none'; }, 6000);
            }
            oldLog.apply(console, arguments);
        };
        // === CÓDIGO SOL GERADO ===
        ${webJS}
        if (typeof iniciar === "function") iniciar();
    </script>
</body>
</html>`;
            executionLogs += "✓ Motor WEB: HTML e Código gerados com Sucesso.\n";
        } else {
            executionLogs += "✓ Motor WEB: Nenhum bloco 'web' detectado.\n";
        }

        return { status: "success", logs: executionLogs, generatedWeb };
    } catch (error) {
        if (error.type) {
            allErrors.push(error);
            return { 
                status: "error", 
                errorDetails: allErrors, 
                logs: executionLogs + `\n❌ [${error.type} na Linha ${error.line}]:\n` + error.message 
            };
        }
        return { status: "error", logs: executionLogs + "\n❌ ERRO FATAL:\n" + error.message };
    }
}

// AQUI ESTÁ A CHAVE: Exportamos o lexicalAnalyzer para que o terminal.js possa usá-lo!
module.exports = { compileWeb, lexicalAnalyzer };