const express = require('express');
const path = require('path');

// Importando os compiladores e o novo módulo do terminal
const { compileWeb } = require('./compilerWeb'); 
const { compileEsp } = require('./compilerEsp'); 
const { processTerminalCommand } = require('./terminal'); 

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.post('/compile', (req, res) => {
    const solCode = req.body.code.trim(); 
    
    console.log("Codigo recebido da IDE. Roteando ambiente...");

    let combinedLogs = "";
    let finalStatus = "success";
    let generatedWeb = null;
    let generatedCpp = null; // <-- ADICIONADO: Variável para guardar o C++ gerado
    let errorDetails = []; 

    if (solCode.startsWith("web") && solCode.endsWith("web")) {
        combinedLogs += "=== DETECTADO AMBIENTE: WEB ===\n";
        const webResult = compileWeb(solCode);
        combinedLogs += webResult.logs + "\n";
        generatedWeb = webResult.generatedWeb;
        
        if (webResult.status === 'error') {
            finalStatus = 'error';
            if (webResult.errorDetails) errorDetails = webResult.errorDetails; 
        }
    } 
    else if (solCode.startsWith("esp") && solCode.endsWith("esp")) {
        combinedLogs += "=== DETECTADO AMBIENTE: ESP32 ===\n";
        const espResult = compileEsp(solCode);
        combinedLogs += espResult.logs + "\n";
        
        generatedCpp = espResult.generatedCpp; // <-- ADICIONADO: Capturando o código C++ do compilador
        
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
        generatedCpp: generatedCpp, // <-- ADICIONADO: Enviando o C++ para o frontend
        errorDetails: errorDetails 
    });
});

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