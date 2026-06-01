// =========================================================
// COMPILADOR ARDUINO - SOLINGUAGEM -> Arduino C++ (.ino)
// =========================================================
// Esta etapa NÃO grava na placa sozinha. Ela transforma o código SOL em
// C++ Arduino. A gravação/compilação real é feita pelo arduinoService.js
// usando o arduino-cli.

const { lexicalAnalyzer } = require('./lexico');

function createParser(tokens) {
    let current = 0;

    function atEnd() {
        return current >= tokens.length;
    }

    function peek(offset = 0) {
        return tokens[current + offset];
    }

    function previous() {
        return tokens[current - 1];
    }

    function advance() {
        if (!atEnd()) current++;
        return previous();
    }

    function checkValue(value) {
        return !atEnd() && peek().value === value;
    }

    function checkKeyword(value) {
        return !atEnd() && peek().type === 'keyword' && peek().value === value;
    }

    function matchValue(value) {
        if (checkValue(value)) {
            advance();
            return true;
        }
        return false;
    }

    function matchKeyword(value) {
        if (checkKeyword(value)) {
            advance();
            return true;
        }
        return false;
    }

    function error(message, token = peek()) {
        const lineInfo = token && token.line ? ` Linha ${token.line}, coluna ${token.column}.` : '';
        const err = new Error(`${message}.${lineInfo}`);
        err.line = token && token.line ? token.line : null;
        err.column = token && token.column ? token.column : null;
        err.type = 'Erro Sintático Arduino';
        throw err;
    }

    function expectValue(value, message) {
        if (matchValue(value)) return previous();
        error(message || `Esperado '${value}'`);
    }

    function expectIdentifier(message) {
        const token = peek();
        if (token && token.type === 'identifier') return advance();
        error(message || 'Esperado um nome/identificador', token);
    }

    function consumeOptionalSemicolon() {
        matchValue(';');
    }

    function isStatementStart(token = peek(), next = peek(1)) {
        if (!token) return true;
        if (token.value === ';' || token.value === ']') return true;
        if (token.type === 'keyword') return true;
        return token.type === 'identifier' && next && (next.value === '[' || next.value === '=');
    }

    function readExpressionUntilStatementBoundary() {
        const expression = [];
        while (!atEnd() && !isStatementStart()) {
            expression.push(advance());
        }
        return expression;
    }

    function readExpressionInsideBrackets() {
        const expression = [];
        let depth = 1;

        while (!atEnd() && depth > 0) {
            const token = advance();
            if (token.value === '[') depth++;
            if (token.value === ']') depth--;
            if (depth > 0) expression.push(token);
        }

        if (depth !== 0) error('Bloco/expressão com colchete não fechado');
        return expression;
    }

    function parseEnvironment() {
        const envName = advance().value;
        const body = [];

        while (!atEnd() && !checkKeyword(envName)) {
            const stmt = parseStatement();
            if (stmt) body.push(stmt);
        }

        if (!matchKeyword(envName)) error(`Esperado '${envName}' para fechar o bloco de ambiente`);
        return { type: 'EnvironmentBlock', environment: envName, body };
    }

    function parseVariableDeclaration() {
        const kind = advance().value;
        const name = expectIdentifier(`Esperado nome da variável após '${kind}'`);
        expectValue('=', `Esperado '=' na declaração de '${name.value}'`);
        const value = readExpressionUntilStatementBoundary();
        if (value.length === 0) error(`Esperado valor para '${name.value}'`, name);
        consumeOptionalSemicolon();
        return { type: 'VariableDeclaration', kind, name: name.value, value, line: name.line };
    }

    function parseFunctionDeclaration() {
        advance(); // tarefa
        const name = expectIdentifier("Esperado nome da tarefa após 'tarefa'");

        expectValue('[', "Esperado '[' para os parâmetros da tarefa");
        const params = [];
        while (!atEnd() && !checkValue(']')) {
            const token = advance();
            if (token.type === 'identifier') params.push(token.value);
        }
        expectValue(']', "Esperado ']' ao final dos parâmetros da tarefa");

        expectValue('[', "Esperado '[' para abrir o corpo da tarefa");
        const body = [];
        while (!atEnd() && !checkValue(']')) {
            const stmt = parseStatement();
            if (stmt) body.push(stmt);
        }
        expectValue(']', "Esperado ']' para fechar o corpo da tarefa");

        return { type: 'FunctionDeclaration', name: name.value, params, body, line: name.line };
    }

    function parseIfStatement() {
        advance(); // testa
        expectValue('[', "Esperado '[' após 'testa'");
        const condition = readExpressionInsideBrackets();

        expectValue('[', "Esperado '[' para abrir o bloco do 'testa'");
        const consequent = [];
        while (!atEnd() && !checkValue(']')) {
            const stmt = parseStatement();
            if (stmt) consequent.push(stmt);
        }
        expectValue(']', "Esperado ']' para fechar o bloco do 'testa'");

        let alternate = null;
        if (matchKeyword('falha')) {
            expectValue('[', "Esperado '[' para abrir o bloco do 'falha'");
            alternate = [];
            while (!atEnd() && !checkValue(']')) {
                const stmt = parseStatement();
                if (stmt) alternate.push(stmt);
            }
            expectValue(']', "Esperado ']' para fechar o bloco do 'falha'");
        }

        return { type: 'IfStatement', condition, consequent, alternate };
    }

    function parseWhileStatement() {
        advance(); // enquanto
        expectValue('[', "Esperado '[' após 'enquanto'");
        const condition = readExpressionInsideBrackets();

        expectValue('[', "Esperado '[' para abrir o bloco do 'enquanto'");
        const body = [];
        while (!atEnd() && !checkValue(']')) {
            const stmt = parseStatement();
            if (stmt) body.push(stmt);
        }
        expectValue(']', "Esperado ']' para fechar o bloco do 'enquanto'");

        return { type: 'WhileStatement', condition, body };
    }

    function parseCallExpression() {
        const name = advance();
        expectValue('[', `Esperado '[' após '${name.value}'`);
        const args = [];
        let currentArg = [];
        let depth = 1;

        while (!atEnd() && depth > 0) {
            const token = advance();

            if (token.value === '[') {
                depth++;
                currentArg.push(token);
                continue;
            }

            if (token.value === ']') {
                depth--;
                if (depth === 0) break;
                currentArg.push(token);
                continue;
            }

            if (token.value === ',' && depth === 1) {
                args.push(currentArg);
                currentArg = [];
                continue;
            }

            currentArg.push(token);
        }

        if (depth !== 0) error(`Chamada '${name.value}' com colchete não fechado`, name);
        if (currentArg.length > 0) args.push(currentArg);
        consumeOptionalSemicolon();

        return { type: 'CallExpression', name: name.value, arguments: args, line: name.line };
    }

    function parseAssignment() {
        const name = advance();
        expectValue('=', `Esperado '=' na atribuição de '${name.value}'`);
        const value = readExpressionUntilStatementBoundary();
        if (value.length === 0) error(`Esperado valor para '${name.value}'`, name);
        consumeOptionalSemicolon();
        return { type: 'AssignmentExpression', name: name.value, value, line: name.line };
    }

    function parseStatement() {
        if (atEnd()) return null;

        if (matchValue(';')) return null;

        const token = peek();

        if (token.type === 'keyword' && (token.value === 'arduino' || token.value === 'esp' || token.value === 'web')) return parseEnvironment();
        if (token.type === 'keyword' && (token.value === 'guarda' || token.value === 'crava')) return parseVariableDeclaration();
        if (checkKeyword('tarefa')) return parseFunctionDeclaration();
        if (checkKeyword('testa')) return parseIfStatement();
        if (checkKeyword('enquanto')) return parseWhileStatement();

        if ((token.type === 'keyword' || token.type === 'identifier') && peek(1) && peek(1).value === '[') {
            return parseCallExpression();
        }

        if (token.type === 'identifier' && peek(1) && peek(1).value === '=') {
            return parseAssignment();
        }

        error(`Comando Arduino não reconhecido: '${token.value}'`, token);
    }

    function parseProgram() {
        const body = [];
        while (!atEnd()) {
            const stmt = parseStatement();
            if (stmt) body.push(stmt);
        }
        return { type: 'Program', body };
    }

    return { parseProgram };
}

function syntaxAnalyzer(tokens) {
    return createParser(tokens).parseProgram();
}

function semanticAnalyzer(ast) {
    const scopes = [new Set()];
    const functions = new Set();
    const logs = [];

    function currentScope() {
        return scopes[scopes.length - 1];
    }

    function declare(name, kind, line) {
        if (currentScope().has(name)) {
            const err = new Error(`${kind} '${name}' já foi declarado(a). Linha ${line || '?'}.`);
            err.type = 'Erro Semântico Arduino';
            err.line = line || null;
            throw err;
        }
        currentScope().add(name);
    }

    function exists(name) {
        return scopes.some(scope => scope.has(name)) || functions.has(name);
    }

    function traverse(node) {
        if (!node) return;
        if (Array.isArray(node)) return node.forEach(traverse);

        switch (node.type) {
            case 'Program':
                return traverse(node.body);

            case 'EnvironmentBlock':
                if (node.environment === 'arduino' || node.environment === 'esp') logs.push('🔌 [Arduino] Bloco de hardware encontrado.');
                return traverse(node.body);

            case 'VariableDeclaration':
                declare(node.name, 'Variável', node.line);
                logs.push(`⚙️ [Arduino] Variável/pino '${node.name}' alocado.`);
                return;

            case 'FunctionDeclaration':
                if (functions.has(node.name)) {
                    const err = new Error(`A tarefa '${node.name}' já existe. Linha ${node.line || '?'}.`);
                    err.type = 'Erro Semântico Arduino';
                    err.line = node.line || null;
                    throw err;
                }
                functions.add(node.name);
                logs.push(`⚙️ [Arduino] Tarefa '${node.name}' encontrada.`);
                scopes.push(new Set(node.params));
                traverse(node.body);
                scopes.pop();
                return;

            case 'AssignmentExpression':
                if (!exists(node.name)) {
                    const err = new Error(`Variável '${node.name}' não foi declarada antes do uso. Linha ${node.line || '?'}.`);
                    err.type = 'Erro Semântico Arduino';
                    err.line = node.line || null;
                    throw err;
                }
                return;

            case 'IfStatement':
                scopes.push(new Set());
                traverse(node.consequent);
                scopes.pop();
                if (node.alternate) {
                    scopes.push(new Set());
                    traverse(node.alternate);
                    scopes.pop();
                }
                return;

            case 'WhileStatement':
                scopes.push(new Set());
                traverse(node.body);
                scopes.pop();
                return;

            case 'CallExpression':
                return;
        }
    }

    traverse(ast);
    return logs.join('\n');
}

function escapeCppString(value) {
    return String(value)
        .replace(/\\/g, '\\\\')
        .replace(/"/g, '\\"')
        .replace(/\n/g, '\\n')
        .replace(/\t/g, '\\t');
}

function translateToken(token) {
    if (!token) return '';
    if (token.type === 'string') return `"${escapeCppString(token.value)}"`;
    if (token.value === 'sim') return 'true';
    if (token.value === 'nao') return 'false';
    if (token.value === 'nulo') return 'NULL';
    return String(token.value);
}

function translateExpression(tokens, separator = '') {
    return tokens.map(translateToken).join(separator).trim();
}

function translateArgument(argTokens) {
    return translateExpression(argTokens);
}

function inferCppType(tokens, constant) {
    if (!tokens || tokens.length === 0) return constant ? 'const int' : 'int';
    if (tokens.length === 1) {
        const token = tokens[0];
        if (token.type === 'string') return constant ? 'const String' : 'String';
        if (token.value === 'sim' || token.value === 'nao') return constant ? 'const bool' : 'bool';
        if (token.type === 'number' && String(token.value).includes('.')) return constant ? 'const float' : 'float';
    }
    return constant ? 'const int' : 'int';
}

function indent(code, spaces = 2) {
    const prefix = ' '.repeat(spaces);
    return code
        .split('\n')
        .filter(line => line.trim().length > 0)
        .map(line => prefix + line)
        .join('\n');
}

function codeGeneratorCpp(ast) {
    const setupCalls = [];
    const loopCalls = [];

    function generate(node) {
        if (!node) return '';
        if (Array.isArray(node)) return node.map(generate).filter(Boolean).join('\n');

        switch (node.type) {
            case 'Program': {
                const hardwareBlocks = node.body.filter(n => n.type === 'EnvironmentBlock' && (n.environment === 'arduino' || n.environment === 'esp'));
                if (hardwareBlocks.length === 0) return '';

                const body = hardwareBlocks.map(generate).filter(Boolean).join('\n\n');

                return `#include <Arduino.h>\n\n// CÓDIGO C++ GERADO PELA SOL IDE\n\n${body}\n\nvoid setup() {\n  Serial.begin(115200);\n${setupCalls.length ? indent(setupCalls.join('\n')) : '  // Sem tarefa iniciar[] definida.'}\n}\n\nvoid loop() {\n${loopCalls.length ? indent(loopCalls.join('\n')) : '  // Sem tarefa repetir[] definida.'}\n}`;
            }

            case 'EnvironmentBlock':
                return generate(node.body);

            case 'VariableDeclaration': {
                const isConst = node.kind === 'crava';
                const cppType = inferCppType(node.value, isConst);
                const value = translateExpression(node.value);
                return `${cppType} ${node.name} = ${value};`;
            }

            case 'FunctionDeclaration': {
                const params = node.params.map(p => `String ${p}`).join(', ');
                let cppName = node.name;

                if (node.name === 'iniciar') setupCalls.push('iniciar();');
                if (node.name === 'repetir') loopCalls.push('repetir();');

                const body = generate(node.body);
                return `void ${cppName}(${params}) {\n${indent(body)}\n}`;
            }

            case 'IfStatement': {
                const condition = translateExpression(node.condition, ' ');
                let code = `if (${condition}) {\n${indent(generate(node.consequent))}\n}`;
                if (node.alternate) code += ` else {\n${indent(generate(node.alternate))}\n}`;
                return code;
            }

            case 'WhileStatement': {
                const condition = translateExpression(node.condition, ' ');
                return `while (${condition}) {\n${indent(generate(node.body))}\n}`;
            }

            case 'AssignmentExpression':
                return `${node.name} = ${translateExpression(node.value)};`;

            case 'CallExpression':
                return generateCall(node);

            default:
                return '';
        }
    }

    function generateCall(node) {
        const name = node.name;
        const args = node.arguments.map(translateArgument);

        // Comandos web são ignorados no compilador Arduino.
        if (['caixa', 'texto', 'botao', 'estilo', 'atualiza', 'limpa', 'coloca', 'tema'].includes(name)) {
            return '';
        }

        if (name === 'mostra') {
            if (args.length === 0) return 'Serial.println();';
            if (args.length === 1) return `Serial.println(${args[0]});`;
            return args.map(arg => `Serial.print(${arg});`).join('\n') + '\nSerial.println();';
        }

        if (name === 'espera') {
            return `delay(${args[0] || '1000'});`;
        }

        // envia[pino, valor] -> digitalWrite
        // Ex.: envia[2, sim] ou envia[led, 1]
        if (name === 'envia' || name === 'manda') {
            const pin = args[0] || '0';
            let state = args[1] || 'LOW';
            if (state === 'true') state = 'HIGH';
            if (state === 'false') state = 'LOW';
            return `pinMode(${pin}, OUTPUT);\ndigitalWrite(${pin}, ${state});`;
        }

        // le[pino] -> digitalRead(pino) como expressão não é perfeito em chamada solta,
        // mas permite usar mostra[leitura] com variáveis no futuro.
        if (name === 'le') {
            const pin = args[0] || '0';
            return `digitalRead(${pin});`;
        }

        // pwm[pino, valor] -> analogWrite
        if (name === 'pwm') {
            const pin = args[0] || '0';
            const value = args[1] || '0';
            return `pinMode(${pin}, OUTPUT);\nanalogWrite(${pin}, ${value});`;
        }

        return `${name}(${args.join(', ')});`;
    }

    return generate(ast);
}

function compileEsp(code) {
    let executionLogs = '';

    try {
        const tokens = lexicalAnalyzer(code);
        const ast = syntaxAnalyzer(tokens);
        executionLogs += semanticAnalyzer(ast) + '\n';

        const hasHardwareBlock = ast.body.some(n => n.type === 'EnvironmentBlock' && (n.environment === 'arduino' || n.environment === 'esp'));
        const generatedCpp = hasHardwareBlock ? codeGeneratorCpp(ast) : null;

        if (generatedCpp) {
            executionLogs += '✓ Motor Arduino: código C++/.ino gerado com sucesso.\n';
        } else {
            executionLogs += "✓ Motor Arduino: nenhum bloco 'arduino' ou 'esp' detectado para compilar.\n";
        }

        return { status: 'success', logs: executionLogs, generatedCpp, ast };
    } catch (error) {
        const line = error.line || null;
        const column = error.column || null;
        const type = error.type || 'Erro Arduino';
        const message = error.message || String(error);

        return {
            status: 'error',
            logs: `${executionLogs}\n❌ ${type}: ${message}\n`,
            errorDetails: [{ type, message, line, column }]
        };
    }
}

module.exports = { compileEsp, syntaxAnalyzer, semanticAnalyzer, codeGeneratorCpp };
