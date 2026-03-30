const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

// Permite que o Node entenda JSON no corpo das requisições
app.use(express.json());

// Serve os arquivos estáticos da pasta "public" (nossa interface)
app.use(express.static(path.join(__dirname, 'public')));

// Rota onde o Frontend vai enviar o código SOL para ser compilado
app.post('/compile', (req, res) => {
    const solCode = req.body.code;
    
    console.log("Código recebido da IDE:");
    console.log(solCode);

    // Aqui, no futuro, chamaremos:
    // 1. Analisador Léxico
    // 2. Analisador Sintático
    // 3. Gerador de Código

    // Por enquanto, vamos apenas simular um retorno de sucesso
    res.json({ 
        status: "success", 
        message: "Compilação simulada com sucesso! Em breve, os arquivos serão gerados aqui.",
        logs: "Analisando sintaxe... OK.\nGerando código C++... OK."
    });
});

app.listen(PORT, () => {
    console.log(`🚀 IDE Web rodando em http://localhost:${PORT}`);
});