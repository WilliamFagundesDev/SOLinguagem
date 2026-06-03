const { spawn } = require('child_process');

function installArduinoCLI(sendEvent) {
    // Usamos spawn com shell: true para executar o winget em tempo real
    const process = spawn('winget', ['install', 'ArduinoSA.CLI', '--accept-package-agreements', '--accept-source-agreements'], { shell: true });

    process.stdout.on('data', (data) => {
        const output = data.toString();
        
        // Envia o texto bruto para o terminal da IDE
        sendEvent('log', output);

        // Expressão regular para capturar a porcentagem que o winget cospe (ex: "45%")
        const match = output.match(/(\d+)%/);
        if (match) {
            sendEvent('progress', match[1]); // Envia apenas o número
        }
    });

    process.stderr.on('data', (data) => {
        sendEvent('error_log', data.toString());
    });

    process.on('close', (code) => {
        if (code === 0) {
            sendEvent('done', 'Instalação do Arduino CLI concluída com sucesso!');
        } else {
            sendEvent('error', `Processo encerrado com código de erro: ${code}`);
        }
    });
}

module.exports = { installArduinoCLI };