const express = require('express');
const path = require('path');

// Importando os compiladores separados
const { compileWeb } = require('./compilerWeb'); 
const { compileEsp } = require('./compilerEsp'); 

const app = express();
const PORT = 3000;

// Permite que o Node entenda JSON no corpo das requisições
app.use(express.json());

// Serve os arquivos estáticos da pasta "public" (nossa interface)
app.use(express.static(path.join(__dirname, 'public')));

// Rota onde o Frontend vai enviar o código SOL para ser compilado
app.post('/compile', (req, res) => {
    // O trim() remove espaços ou quebras de linha que o usuário pode ter deixado no começo/fim
    const solCode = req.body.code.trim(); 
    
    console.log("Código recebido da IDE. Roteando ambiente...");

    let combinedLogs = "";
    let finalStatus = "success";
    let generatedWeb = null;

    // Lógica Roteadora de Ambientes
    if (solCode.startsWith("web") && solCode.endsWith("web")) {
        combinedLogs += "=== DETECTADO AMBIENTE: WEB ===\n";
        const webResult = compileWeb(solCode);
        combinedLogs += webResult.logs + "\n";
        generatedWeb = webResult.generatedWeb;
        
        if (webResult.status === 'error') finalStatus = 'error';
    } 
    else if (solCode.startsWith("esp") && solCode.endsWith("esp")) {
        combinedLogs += "=== DETECTADO AMBIENTE: ESP32 ===\n";
        const espResult = compileEsp(solCode);
        combinedLogs += espResult.logs + "\n";
        
        if (espResult.status === 'error') finalStatus = 'error';
    } 
    else {
        finalStatus = 'error';
        combinedLogs += "❌ ERRO ESTRUTURAL: O código fornecido é inválido.\n";
        combinedLogs += "-> Para interface gráfica, o código DEVE começar com 'web' e terminar com 'web'.\n";
        combinedLogs += "-> Para hardware IoT, o código DEVE começar com 'esp' e terminar com 'esp'.\n";
    }

    // Devolve o resultado processado pelo compilador correto
    res.json({ 
        status: finalStatus, 
        message: "Operação finalizada.",
        logs: combinedLogs,
        generatedWeb: generatedWeb 
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Base de lançamento SOL IDE pronta em http://localhost:${PORT}`);
});