const { spawn } = require('child_process');

// Função auxiliar para rodar comandos em sequência sem travar a IDE
function runCommand(command, args, sendEvent, isWinget = false) {
    return new Promise((resolve, reject) => {
        const process = spawn(command, args, { shell: true });

        process.stdout.on('data', (data) => {
            const output = data.toString();
            sendEvent('log', output);

            // Tenta pescar a porcentagem (funciona para o winget e para o download do core do ESP)
            const match = output.match(/(\d+)%/);
            if (match) {
                sendEvent('progress', match[1]);
            }
        });

        process.stderr.on('data', (data) => {
            sendEvent('error_log', data.toString());
        });

        process.on('close', (code) => {
            if (code === 0) resolve();
            else reject(code);
        });
        
        process.on('error', (err) => {
            reject(err.message);
        });
    });
}

async function installArduinoCLI(sendEvent) {
    try {
        sendEvent('log', '=== ETAPA 1: INSTALANDO ARDUINO CLI ===\n');
        await runCommand('winget', ['install', 'ArduinoSA.CLI', '--accept-package-agreements', '--accept-source-agreements'], sendEvent, true);
        
        sendEvent('log', '\n=== ETAPA 2: CONFIGURANDO URL DO ESP8266 ===\n');
        await runCommand('arduino-cli', ['config', 'add', 'board_manager.additional_urls', 'http://arduino.esp8266.com/stable/package_esp8266com_index.json'], sendEvent);
        
        sendEvent('log', '\n=== ETAPA 3: ATUALIZANDO ÍNDICES (Aguarde...) ===\n');
        await runCommand('arduino-cli', ['core', 'update-index'], sendEvent);
        
        sendEvent('log', '\n=== ETAPA 4: INSTALANDO COMPILADORES ESP8266 ===\n');
        await runCommand('arduino-cli', ['core', 'install', 'esp8266:esp8266'], sendEvent);

        sendEvent('done', 'Instalação e configuração do ESP8266 concluídas com sucesso! Você já pode compilar.');
    } catch (error) {
        sendEvent('error', `Processo interrompido. \nDetalhe do Erro: ${error}\n\n⚠️ IMPORTANTE: Se esta for a primeira vez que você instalou o Arduino CLI, feche a IDE inteira e abra novamente para o Windows reconhecer o comando. Depois clique no botão de instalar mais uma vez para terminar a configuração.`);
    }
}

module.exports = { installArduinoCLI };