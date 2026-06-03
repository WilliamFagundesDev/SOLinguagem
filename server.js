const express = require('express');
const path = require('path');

// Importando os compiladores e o novo módulo do terminal
const { compileWeb } = require('./compilerWeb'); 
const { compileEsp } = require('./compilerEsp'); 
const { processTerminalCommand } = require('./terminal'); 
const { installArduinoCLI } = require('./arduinoCLI');

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

app.post('/install-arduino-cli', async (req, res) => {
    try {
        const result = await installArduinoCLI();
        res.json(result);
    } catch (error) {
        res.json({ status: 'error', output: `❌ Erro interno no servidor: ${error.message}` });
    }
});

// NOVA ROTA EM TEMPO REAL PARA A INSTALAÇÃO
app.get('/install-arduino-cli-stream', (req, res) => {
    // Configura os cabeçalhos para Server-Sent Events (SSE)
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Função auxiliar para enviar os eventos formatados para o navegador
    const sendEvent = (type, data) => {
        res.write(`event: ${type}\n`);
        res.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    // Inicia a instalação passando a função que cospe os dados
    installArduinoCLI(sendEvent);

    // Se o usuário fechar a IDE no meio do processo
    req.on('close', () => {
        console.log("Conexão de instalação encerrada pelo cliente.");
    });
});

app.listen(PORT, () => {
    console.log(`Base de lancamento SOL IDE pronta em http://localhost:${PORT}`);
});

app.listen(PORT, () => {
    console.log(`Direitos reservados William Fagundes Dev ©`);
});