import { state } from './state.js';

export function setupTerminalAndCompiler() {
    const btnCompile = document.getElementById("btn-compile");
    const btnConnectEsp = document.getElementById("btn-conectar-esp");

    if (btnCompile) {
        btnCompile.addEventListener("click", async () => {
            const currentFile = state.files[state.activeIndex];
            const code = state.editor.getValue();
            
            // Nova validação: Se o código for para ESP, exige a porta salva
            if (code.trim().startsWith("esp")) {
                const portaSalva = sessionStorage.getItem('esp_port');
                if (!portaSalva) {
                    state.terminal.innerText += "\n> ❌ Erro: Nenhuma porta selecionada. Conecte o ESP primeiro!\n";
                    state.terminal.scrollTop = state.terminal.scrollHeight;
                    return; // Interrompe a execução aqui, não envia para o backend
                }
            }

            state.terminal.innerText = "🚀 Iniciando compilação...\n";

            state.currentErrorMarks.forEach(mark => mark.clear());
            state.currentErrorMarks = [];

            try {
                // Recupera a porta (pode ser null se for ambiente web, não tem problema)
                const portaSalva = sessionStorage.getItem('esp_port');

                const response = await fetch('/compile', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        code: code, 
                        filename: currentFile.name,
                        port: portaSalva // Enviando a porta para o servidor poder usar
                    })
                });
                const result = await response.json();
                state.terminal.innerText += result.logs;

                if (result.status === "success" && result.generatedWeb) {
                    const blob = new Blob([result.generatedWeb], { type: 'text/html' });
                    const url = URL.createObjectURL(blob);

                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `app_${currentFile.name.replace('.sol', '.html')}`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);

                    URL.revokeObjectURL(url);

                } else if (result.status === "success" && result.generatedCpp) {
                    const blob = new Blob([result.generatedCpp], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);

                    const a = document.createElement('a');
                    a.href = url;
                    a.download = currentFile.name.replace('.sol', '.ino');
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);

                    URL.revokeObjectURL(url);

                    state.terminal.innerText += "\n Arquivo .ino gerado com sucesso.\n";

                } else if (result.status === "error" && result.errorDetails && result.errorDetails.length > 0) {
                    result.errorDetails.forEach(err => {
                        const lineIdx = err.line - 1;
                        const mark = state.editor.markText(
                            { line: lineIdx, ch: 0 }, { line: lineIdx, ch: 999 },
                            { className: 'error-underline', title: `[${err.type}] ${err.message}` }
                        );
                        state.currentErrorMarks.push(mark);
                    });
                }
            } catch (error) { 
                state.terminal.innerText += "⚠️ Erro: " + error.message; 
            }
            
            state.terminal.scrollTop = state.terminal.scrollHeight;
        });
    }

    if (btnConnectEsp) {
        btnConnectEsp.addEventListener("click", async () => {
            state.terminal.innerText += "\n> 🔎 Escaneando portas USB...\n";
            state.terminal.scrollTop = state.terminal.scrollHeight;
            
            try {
                const response = await fetch('/detect-esp');
                const result = await response.json();
                
                if (result.success) {
                    const porta = result.port;
                    const nome = result.name;
                    
                    // Salva a porta no sessionStorage para usar na hora de compilar/enviar
                    sessionStorage.setItem('esp_port', porta);
                    
                    state.terminal.innerText += `> ✅ Dispositivo identificado com sucesso!\n`;
                    state.terminal.innerText += `  📍 Porta: ${porta}\n`;
                    state.terminal.innerText += `  🔌 Dispositivo: ${nome}\n`;
                    state.terminal.innerText += `  ⚙️ Protocolo: ${result.protocol}\n`;
                    state.terminal.innerText += `> 💾 Porta '${porta}' armazenada na sessão. Pronta para gravação.\n`;
                } else {
                    state.terminal.innerText += `> ⚠️ Não foi possível encontrar o ESP.\n`;
                    state.terminal.innerText += `  Detalhes: ${result.message}\n`;
                }
            } catch (error) {
                state.terminal.innerText += `\n> ❌ Falha na comunicação com a base: ${error.message}\n`;
            }
            
            state.terminal.scrollTop = state.terminal.scrollHeight;
        });
    }

    const terminalInput = document.getElementById("terminal-input");
    if (terminalInput) {
        terminalInput.addEventListener("keydown", async (e) => {
            if (e.key === "Enter") {
                const comando = terminalInput.value.trim();
                if (!comando) return;

                terminalInput.value = "";
                state.terminal.innerText += `\n$ ${comando}\n`;

                try {
                    const response = await fetch('/terminal', {
                        method: 'POST', headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ command: comando, code: state.editor.getValue() })
                    });
                    const result = await response.json();

                    if (result.action === 'clear') {
                        state.terminal.innerText = "Conexão com a base estabelecida.\nAguardando comandos...\n";
                    } else if (result.action === 'print') {
                        state.terminal.innerText += result.output + "\n";
                    }
                    state.terminal.scrollTop = state.terminal.scrollHeight;
                } catch (error) {
                    state.terminal.innerText += `⚠️ Erro de rede: ${error.message}\n`;
                }
            }
        });
    }
}
