const express = require('express');
const path = require('path');

// Importando os compiladores e o novo módulo do terminal
const { compileWeb } = require('./compilerWeb'); 
const { compileEsp } = require('./compilerEsp'); 
const { processTerminalCommand } = require('./terminal'); 

const app = express();
const PORT = 3000;

// Permite que o Node entenda JSON no corpo das requisições
app.use(express.json());

// Serve os arquivos estáticos da pasta "public" (nossa interface)
app.use(express.static(path.join(__dirname, 'public')));

// Rota onde o Frontend vai enviar o código SOL para ser compilado
app.post('/compile', (req, res) => {
    const solCode = req.body.code.trim(); 
    
    console.log("Codigo recebido da IDE. Roteando ambiente...");

    let combinedLogs = "";
    let finalStatus = "success";
    let generatedWeb = null;
    let errorDetails = []; // Agora é um Array que pode guardar MÚLTIPLOS erros simultâneos!

    if (solCode.startsWith("web") && solCode.endsWith("web")) {
        combinedLogs += "=== DETECTADO AMBIENTE: WEB ===\n";
        const webResult = compileWeb(solCode);
        combinedLogs += webResult.logs + "\n";
        generatedWeb = webResult.generatedWeb;
        
        if (webResult.status === 'error') {
            finalStatus = 'error';
            if (webResult.errorDetails) errorDetails = webResult.errorDetails; // Passa o Array todo
        }
    } 
    else if (solCode.startsWith("esp") && solCode.endsWith("esp")) {
        combinedLogs += "=== DETECTADO AMBIENTE: ESP32 ===\n";
        const espResult = compileEsp(solCode);
        combinedLogs += espResult.logs + "\n";
        
        if (espResult.status === 'error') {
            finalStatus = 'error';
            if (espResult.errorDetails) errorDetails = espResult.errorDetails;
        }
    } 
    else {
        finalStatus = 'error';
        combinedLogs += "❌ ERRO ESTRUTURAL: O código fornecido é inválido.\n";
        combinedLogs += "-> Para interface gráfica, o código DEVE começar com 'web' e terminar com 'web'.\n";
        combinedLogs += "-> Para hardware IoT, o código DEVE começar com 'esp' e terminar com 'esp'.\n";
    }

    res.json({ 
        status: finalStatus, 
        message: "Operação finalizada.",
        logs: combinedLogs,
        generatedWeb: generatedWeb,
        errorDetails: errorDetails // Envia a lista inteira de erros para o Frontend
    });
});

// NOVA ROTA: COMANDOS DO TERMINAL
app.post('/terminal', (req, res) => {
    const command = req.body.command || '';
    const code = req.body.code || '';
    
    try {
        const result = processTerminalCommand(command, code);
        res.json(result);
    } catch (error) {
        res.json({ action: 'print', output: `❌ Erro interno no servidor: ${error.message}` });
    }
});

app.listen(PORT, () => {
    console.log(`Base de lancamento SOL IDE pronta em http://localhost:${PORT}`);
});