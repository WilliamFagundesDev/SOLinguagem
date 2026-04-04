function semanticAnalyzer(ast) {
    const symbolUniverse = new Set(); 
    let logs = [];
    let errors = []; // Lista para guardar todos os erros semânticos

    // Apenas regista o erro e deixa a análise continuar!
    function recordError(msg, line) {
        errors.push({ type: 'Erro de Semântica', message: msg, line: line || 1 });
    }

    function traverse(node) {
        if (!node) return;
        if (Array.isArray(node)) { node.forEach(traverse); return; }
        switch (node.type) {
            case 'Program': 
                node.body.forEach(traverse); 
                break;
            case 'EnvironmentBlock': 
                if(node.environment === 'web') logs.push(`\n🌐 [WEB] Analisando ambiente visual...`); 
                node.body.forEach(traverse); 
                break;
            case 'FunctionDeclaration':
                if (symbolUniverse.has(node.name)) {
                    recordError(`A tarefa '${node.name}' já foi criada antes!`, node.line);
                } else {
                    symbolUniverse.add(node.name); 
                    logs.push(`⚙️ [WEB] Tarefa registada -> ${node.name}`); 
                }
                traverse(node.body); 
                break;
            case 'VariableDeclaration':
                if (symbolUniverse.has(node.name)) {
                    recordError(`A variável '${node.name}' já foi declarada!`, node.line);
                } else {
                    symbolUniverse.add(node.name); 
                    logs.push(`⚙️ [WEB] Memória alocada -> '${node.name}'.`); 
                }
                break;
            case 'AssignmentExpression':
                if (!symbolUniverse.has(node.name)) {
                    recordError(`Você tentou usar a variável '${node.name}', mas não a declarou usando 'guarda' ou 'crava' primeiro!`, node.line);
                }
                break;
            case 'IfStatement': 
                traverse(node.consequent); 
                if (node.alternate) traverse(node.alternate); 
                break;
        }
    }
    
    traverse(ast);
    return { logs: logs.join('\n'), errors: errors };
}

module.exports = { semanticAnalyzer };