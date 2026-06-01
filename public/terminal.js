import { state } from './state.js';

export function setupTerminalAndCompiler() {
    const btnCompile = document.getElementById('btn-compile');

    if (btnCompile) {
        btnCompile.addEventListener('click', async () => {
            const currentFile = state.files[state.activeIndex];
            const code = state.editor.getValue();
            const trimmedCode = code.trim();
            const isHardware = (trimmedCode.startsWith('arduino') && trimmedCode.endsWith('arduino')) ||
                (trimmedCode.startsWith('esp') && trimmedCode.endsWith('esp'));

            state.terminal.innerText = isHardware
                ? '🚀 Gerando .ino e compilando para Arduino com Arduino CLI...\n'
                : '🚀 Iniciando compilação...\n';

            state.currentErrorMarks.forEach(mark => mark.clear());
            state.currentErrorMarks = [];

            try {
                const response = await fetch('/compile', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        code,
                        filename: currentFile.name,
                        // Para Arduino, o botão funciona como Verificar/Compilar do Arduino IDE.
                        arduinoAction: isHardware ? 'compile' : 'generate'
                    })
                });

                const result = await response.json();
                state.terminal.innerText += result.logs;

                if (result.status === 'success' && result.generatedWeb) {
                    const blob = new Blob([result.generatedWeb], { type: 'text/html' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `app_${currentFile.name.replace('.sol', '.html')}`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                }

                if (result.status === 'success' && result.generatedCpp) {
                    state.terminal.innerText += '\n✅ Verificação finalizada. Para enviar: use "portas" e depois "enviar-arduino COM6".\n';
                }

                if (result.status === 'error' && result.errorDetails && result.errorDetails.length > 0) {
                    result.errorDetails.forEach(err => {
                        if (!err.line) return;
                        const lineIdx = err.line - 1;
                        const mark = state.editor.markText(
                            { line: lineIdx, ch: 0 }, { line: lineIdx, ch: 999 },
                            { className: 'error-underline', title: `[${err.type}] ${err.message}` }
                        );
                        state.currentErrorMarks.push(mark);
                    });
                }
            } catch (error) {
                state.terminal.innerText += '⚠️ Erro: ' + error.message;
            }

            state.terminal.scrollTop = state.terminal.scrollHeight;
        });
    }

    const terminalInput = document.getElementById('terminal-input');
    if (terminalInput) {
        terminalInput.addEventListener('keydown', async (e) => {
            if (e.key === 'Enter') {
                const comando = terminalInput.value.trim();
                if (!comando) return;

                const currentFile = state.files[state.activeIndex];
                terminalInput.value = '';
                state.terminal.innerText += `\n$ ${comando}\n`;

                try {
                    const response = await fetch('/terminal', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            command: comando,
                            code: state.editor.getValue(),
                            filename: currentFile.name
                        })
                    });
                    const result = await response.json();

                    if (result.action === 'clear') {
                        state.terminal.innerText = 'Conexão com a base estabelecida.\nAguardando comandos...\n';
                    } else if (result.action === 'print') {
                        state.terminal.innerText += result.output + '\n';
                    }
                    state.terminal.scrollTop = state.terminal.scrollHeight;
                } catch (error) {
                    state.terminal.innerText += `⚠️ Erro de rede: ${error.message}\n`;
                }
            }
        });
    }
}
