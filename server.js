const express = require('express');
const path = require('path');
const { compileSOL } = require('./compiler'); // Importando o nosso novo compilador!

const app = express();
const PORT = 3000;

// Permite que o Node entenda JSON no corpo das requisições
app.use(express.json());

// Serve os arquivos estáticos da pasta "public" (nossa interface)
app.use(express.static(path.join(__dirname, 'public')));

// Rota onde o Frontend vai enviar o código SOL para ser compilado
app.post('/compile', (req, res) => {
    const solCode = req.body.code;
    
    console.log("Código estelar recebido da IDE:");
    console.log(solCode);

    // Passa o código para as 3 fases do compilador
    const result = compileSOL(solCode);

    res.json({ 
        status: result.status, 
        message: "Operação finalizada.",
        logs: result.logs
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Base de lançamento SOL IDE pronta em http://localhost:${PORT}`);
});