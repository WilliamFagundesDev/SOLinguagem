function syntaxAnalyzer(tokens) {
    let current = 0;
    let errors = []; // Lista que guardará todos os erros de sintaxe encontrados!

    // Agora, em vez de parar o programa, ele lança um erro interno que será capturado e salvo
    function throwError(msg, tokenIndex) {
        let t = tokens[tokenIndex] || tokens[current - 1] || tokens[tokens.length - 1] || { line: 1, column: 1 };
        throw { type: 'Erro de Sintaxe', message: msg, line: t.line, column: t.column };
    }

    function isStatementStarter(idx) {
        if (idx >= tokens.length) return true;
        let t = tokens[idx];
        if (t.value === ']' || t.value === ';') return true;
        const starters = ['caixa', 'texto', 'botao', 'tema', 'mostra', 'envia', 'atualiza', 'limpa', 'testa', 'guarda', 'crava', 'tarefa', 'falha'];
        if (t.type === 'keyword' && starters.includes(t.value)) return true;
        if (t.type === 'identifier' && idx + 1 < tokens.length && tokens[idx+1].value === '=') return true;
        if (t.type === 'identifier' && idx + 1 < tokens.length && tokens[idx+1].value === '[') return true;
        return false;
    }

    // A MÁGICA DA RECUPERAÇÃO: Se achar erro, pula até o próximo comando seguro
    function synchronize() {
        current++;
        while (current < tokens.length) {
            if (tokens[current - 1] && (tokens[current - 1].value === ';' || tokens[current - 1].value === ']')) return;
            if (isStatementStarter(current)) return;
            current++;
        }
    }

    function walk() {
        if (current >= tokens.length) return null;
        let token = tokens[current];
        let pos = { line: token.line, column: token.column };

        if (token.type === 'keyword' && (token.value === 'esp' || token.value === 'web')) {
            let envName = token.value; current++; 
            let body = [];
            while (current < tokens.length && !(tokens[current].type === 'keyword' && tokens[current].value === envName)) {
                let stmt = walk(); if (stmt) body.push(stmt);
            }
            if (current < tokens.length) current++; 
            return { type: 'EnvironmentBlock', environment: envName, body, line: pos.line };
        }
        
        if (token.type === 'keyword' && (token.value === 'guarda' || token.value === 'crava')) {
            let kind = token.value; current++; 
            let nameToken = tokens[current++];
            if (!nameToken || nameToken.type !== 'identifier') throwError(`Esperado nome da variável após '${kind}'`, current - 1);
            if (!tokens[current] || tokens[current].value !== '=') throwError(`Esperado '=' na declaração de '${nameToken.value}'`, current);
            current++; 
            let valueNodes = [];
            while(current < tokens.length && !isStatementStarter(current) && tokens[current].value !== ',') {
                valueNodes.push(tokens[current++]);
            }
            if (current < tokens.length && (tokens[current].value === ';' || tokens[current].value === ',')) current++; 
            return { type: 'VariableDeclaration', kind, name: nameToken.value, value: valueNodes, line: pos.line };
        }
        
        if (token.type === 'keyword' && token.value === 'tarefa') {
            current++; let nameToken = tokens[current++];
            if (!tokens[current] || tokens[current].value !== '[') throwError(`Esperado '[' para argumentos da tarefa '${nameToken.value || '?'}'`, current);
            current++; 
            let params = [];
            while (tokens[current] && tokens[current].value !== ']') {
                if (tokens[current].type === 'identifier') params.push(tokens[current].value);
                current++;
            }
            current++; 
            if (!tokens[current] || tokens[current].value !== '[') throwError(`Esperado '[' para abrir o bloco da tarefa '${nameToken.value || '?'}'`, current);
            current++; 
            let body = [];
            while (tokens[current] && tokens[current].value !== ']') {
                let stmt = walk(); if (stmt) body.push(stmt);
            }
            current++; 
            return { type: 'FunctionDeclaration', name: nameToken.value, params, body, line: pos.line };
        }

        if (token.type === 'keyword' && token.value === 'testa') {
            current++;
            if (!tokens[current] || tokens[current].value !== '[') throwError("Esperado '[' após comando 'testa'", current);
            current++;
            let condition = [];
            while (tokens[current] && tokens[current].value !== ']') condition.push(tokens[current++]);
            current++;
            if (!tokens[current] || tokens[current].value !== '[') throwError("Esperado '[' para abrir o bloco do 'testa'", current);
            current++;
            let consequent = [];
            while (tokens[current] && tokens[current].value !== ']') {
                let stmt = walk(); if (stmt) consequent.push(stmt);
            }
            current++; 
            
            let alternate = null;
            if (current < tokens.length && tokens[current].value === 'falha') {
                current++;
                if (!tokens[current] || tokens[current].value !== '[') throwError("Esperado '[' após comando 'falha'", current);
                current++;
                alternate = [];
                while (tokens[current] && tokens[current].value !== ']') {
                    let stmt = walk(); if (stmt) alternate.push(stmt);
                }
                current++; 
            }
            return { type: 'IfStatement', condition, consequent, alternate, line: pos.line };
        }

        const uiElements = ['caixa', 'botao', 'texto', 'tema'];
        if (token.type === 'keyword' && uiElements.includes(token.value)) {
            let kind = token.value; current++; 
            
            if (!tokens[current] || tokens[current].value !== '[') throwError(`Esperado '[' após '${kind}'`, current);
            current++;
            
            let id = '';
            if (tokens[current] && tokens[current].value !== ']') {
                id = tokens[current].value;
                current++;
            }
            if (!tokens[current] || tokens[current].value !== ']') throwError(`Esperado ']' fechando identificador de '${kind}'`, current);
            current++;

            let properties = {};
            const validProps = ['cor', 'tamanho', 'estilo', 'coloca', 'texto', 'funcao'];

            while (current < tokens.length && 
                  (tokens[current].type === 'keyword' || tokens[current].type === 'identifier') && 
                  validProps.includes(tokens[current].value)) {
                
                let propName = tokens[current].value; current++;
                if (!tokens[current] || tokens[current].value !== '[') throwError(`Esperado '[' após propriedade '${propName}'`, current);
                current++;
                
                let propVal = tokens[current].value; current++;
                if (!tokens[current] || tokens[current].value !== ']') throwError(`Esperado ']' fechando valor da propriedade '${propName}'`, current);
                current++;
                
                properties[propName] = propVal;
            }

            if (current < tokens.length && (tokens[current].value === ';' || tokens[current].value === ',')) current++;
            return { type: 'UIElement', kind, id, properties, line: pos.line };
        }

        const actions = ['mostra', 'envia', 'atualiza', 'limpa'];
        if (token.type === 'keyword' && actions.includes(token.value)) {
            let funcName = token.value; current++; 
            if (!tokens[current] || tokens[current].value !== '[') throwError(`Esperado '[' após comando '${funcName}'`, current);
            current++;
            let args = [];
            while (tokens[current] && tokens[current].value !== ']') args.push(tokens[current++]);
            current++; 
            if (current < tokens.length && (tokens[current].value === ';' || tokens[current].value === ',')) current++; 
            return { type: 'CallExpression', name: funcName, arguments: args, line: pos.line };
        }
        
        if (token.type === 'identifier' && current + 1 < tokens.length && tokens[current + 1].value === '[') {
            let funcName = token.value; current += 2;
            let args = [];
            while (tokens[current] && tokens[current].value !== ']') {
                args.push(tokens[current++]);
            }
            current++;
            if (current < tokens.length && (tokens[current].value === ';' || tokens[current].value === ',')) current++;
            return { type: 'CallExpression', name: funcName, arguments: args, line: pos.line };
        }

        if (token.type === 'identifier' && current + 1 < tokens.length && tokens[current + 1].value === '=') {
            let nameToken = token; current += 2; 
            let valueNodes = [];
            while(current < tokens.length && !isStatementStarter(current) && tokens[current].value !== ',') {
                valueNodes.push(tokens[current++]);
            }
            if (current < tokens.length && (tokens[current].value === ';' || tokens[current].value === ',')) current++; 
            return { type: 'AssignmentExpression', name: nameToken.value, value: valueNodes, line: pos.line };
        }
        
        throwError(`Comando inválido ou mal formatado perto de '${token.value}'`, current);
    }

    let ast = { type: 'Program', body: [] };
    while (current < tokens.length) {
        try {
            let node = walk(); 
            if (node) ast.body.push(node);
        } catch (error) {
            if (error.type === 'Erro de Sintaxe') {
                errors.push(error); // Salva o erro na lista
                synchronize();      // Pula a parte quebrada e tenta continuar
            } else {
                throw error; // Erros inesperados
            }
        }
    }
    
    // Agora o retorno devolve a árvore E a lista completa de erros
    return { ast, errors };
}

module.exports = { syntaxAnalyzer };