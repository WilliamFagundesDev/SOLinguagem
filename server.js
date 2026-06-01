const express = require('express');
const path = require('path');

const { compileWeb } = require('./compilerWeb');
const { compileEsp } = require('./compilerEsp');
const { processTerminalCommand } = require('./terminal');
const { compileSketch, uploadSketch, listBoards, configureArduinoAvr, configureEsp32 } = require('./arduinoService');

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '5mb' }));
app.use(express.static(path.join(__dirname, 'public')));

app.post('/compile', async (req, res) => {
    const solCode = (req.body.code || '').trim();
    const filename = req.body.filename || 'SolSketch.sol';
    const arduinoAction = req.body.arduinoAction || 'generate'; // generate | compile | upload
    const port = req.body.port || '';
    const fqbn = req.body.fqbn || undefined;

    console.log('Código recebido da IDE. Roteando ambiente...');

    let combinedLogs = '';
    let finalStatus = 'success';
    let generatedWeb = null;
    let generatedCpp = null;
    let errorDetails = [];

    try {
        if (solCode.startsWith('web') && solCode.endsWith('web')) {
            combinedLogs += '=== DETECTADO AMBIENTE: WEB ===\n';
            const webResult = compileWeb(solCode);
            combinedLogs += webResult.logs + '\n';
            generatedWeb = webResult.generatedWeb;

            if (webResult.status === 'error') {
                finalStatus = 'error';
                if (webResult.errorDetails) errorDetails = webResult.errorDetails;
            }
        } else if ((solCode.startsWith('arduino') && solCode.endsWith('arduino')) || (solCode.startsWith('esp') && solCode.endsWith('esp'))) {
            combinedLogs += '=== DETECTADO AMBIENTE: ARDUINO ===\n';
            const espResult = compileEsp(solCode);
            combinedLogs += espResult.logs + '\n';
            generatedCpp = espResult.generatedCpp;

            if (espResult.status === 'error') {
                finalStatus = 'error';
                if (espResult.errorDetails) errorDetails = espResult.errorDetails;
            }

            // Aqui está a diferença para virar “Arduino IDE”:
            // além de gerar o .ino, podemos chamar o arduino-cli para compilar/enviar.
            if (finalStatus === 'success' && generatedCpp && arduinoAction === 'compile') {
                const cliResult = await compileSketch(generatedCpp, { filename, fqbn });
                combinedLogs += cliResult.logs;
                if (!cliResult.ok) finalStatus = 'error';
            }

            if (finalStatus === 'success' && generatedCpp && arduinoAction === 'upload') {
                const cliResult = await uploadSketch(generatedCpp, { filename, fqbn, port });
                combinedLogs += cliResult.logs;
                if (!cliResult.ok) finalStatus = 'error';
            }
        } else {
            finalStatus = 'error';
            combinedLogs += '❌ ERRO ESTRUTURAL: O código fornecido é inválido.\n';
            combinedLogs += "-> Para interface gráfica, o código DEVE começar com 'web' e terminar com 'web'.\n";
            combinedLogs += "-> Para hardware Arduino, o código DEVE começar com 'arduino' e terminar com 'arduino'.\n";
        }

        res.json({
            status: finalStatus,
            message: 'Operação finalizada.',
            logs: combinedLogs,
            generatedWeb,
            generatedCpp,
            errorDetails
        });
    } catch (error) {
        res.json({
            status: 'error',
            message: 'Erro interno no servidor.',
            logs: combinedLogs + `\n❌ Erro interno no servidor: ${error.message}\n`,
            generatedWeb,
            generatedCpp,
            errorDetails
        });
    }
});

app.post('/arduino/boards', async (req, res) => {
    const result = await listBoards();
    res.json({ status: result.ok ? 'success' : 'error', logs: result.logs });
});

app.post('/arduino/configure', async (req, res) => {
    const result = await configureArduinoAvr();
    res.json({ status: result.ok ? 'success' : 'error', logs: result.logs });
});

// Rota antiga mantida por compatibilidade.
app.post('/arduino/configure-esp32', async (req, res) => {
    const result = await configureArduinoAvr();
    res.json({ status: result.ok ? 'success' : 'error', logs: result.logs });
});

app.post('/arduino/upload', async (req, res) => {
    const solCode = (req.body.code || '').trim();
    const filename = req.body.filename || 'SolSketch.sol';
    const port = req.body.port || '';
    const fqbn = req.body.fqbn || undefined;

    const espResult = compileEsp(solCode);
    let logs = '=== DETECTADO AMBIENTE: ARDUINO ===\n' + espResult.logs + '\n';

    if (espResult.status === 'error') {
        return res.json({ status: 'error', logs, errorDetails: espResult.errorDetails || [] });
    }

    const upload = await uploadSketch(espResult.generatedCpp, { filename, port, fqbn });
    logs += upload.logs;

    res.json({ status: upload.ok ? 'success' : 'error', logs, generatedCpp: espResult.generatedCpp });
});

app.post('/terminal', async (req, res) => {
    const command = req.body.command || '';
    const code = req.body.code || '';
    const filename = req.body.filename || 'SolSketch.sol';

    try {
        const result = await processTerminalCommand(command, code, { filename });
        res.json(result);
    } catch (error) {
        res.json({ action: 'print', output: `❌ Erro interno no servidor: ${error.message}` });
    }
});

app.listen(PORT, () => {
    console.log(`Base de lançamento SOL IDE pronta em http://localhost:${PORT}`);
});
