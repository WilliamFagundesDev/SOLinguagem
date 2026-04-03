const express = require('express');
const path = require('path');

// Importando os nossos NOVOS compiladores separados!
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
    const solCode = req.body.code;
    
    console.log("Código estelar recebido da IDE. Iniciando processadores...");

    // O servidor agora passa o código por AMBOS os processadores
    const webResult = compileWeb(solCode);
    const espResult = compileEsp(solCode);

    // Combinando os Logs para mostrar na tela preta da IDE
    let combinedLogs = "=== COMPILADOR WEB ===\n" + webResult.logs + "\n";
    combinedLogs += "=== COMPILADOR ESP32 ===\n" + espResult.logs;

    // Se algum dos dois falhar, o status final é de erro
    const finalStatus = (webResult.status === 'success' && espResult.status === 'success') ? 'success' : 'error';

    res.json({ 
        status: finalStatus, 
        message: "Operação finalizada.",
        logs: combinedLogs,
        generatedWeb: webResult.generatedWeb // Mandamos o HTML da página web (se houver)
        // No futuro, podemos mandar o espResult.generatedCpp para download aqui também!
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Base de lançamento SOL IDE pronta em http://localhost:${PORT}`);
});