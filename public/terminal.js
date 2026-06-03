import { state } from './state.js';

export function setupTerminalAndCompiler() {
    const btnCompile = document.getElementById("btn-compile");
    const btnConnectEsp = document.getElementById("btn-conectar-esp");
    const btnInstalarCli = document.getElementById("btn-instalar-cli");

    if (btnCompile) {
        btnCompile.addEventListener("click", async () => {
            const currentFile = state.files[state.activeIndex];
            const code = state.editor.getValue();
            
            state.currentErrorMarks.forEach(mark => mark.clear());
            state.currentErrorMarks = [];

            // ==========================================
            // NOVO FLUXO: ESP32 COM STREAMING EM TEMPO REAL
            // ==========================================
            if (code.trim().startsWith("esp")) {
                const portaSalva = sessionStorage.getItem('esp_port');
                if (!portaSalva) {
                    state.terminal.innerText += "\n> ❌ Erro: Nenhuma porta selecionada. Conecte o ESP primeiro!\n";
                    state.terminal.scrollTop = state.terminal.scrollHeight;
                    return;
                }

                state.terminal.innerText = "🚀 Conectando ao compilador de hardware...\n";

                try {
                    const response = await fetch('/compile-esp-stream', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ 
                            code: code, 
                            filename: currentFile.name,
                            port: portaSalva 
                        })
                    });

                    // Lê a resposta em pedaços contínuos (Streaming)
                    const reader = response.body.getReader();
                    const decoder = new TextDecoder();
                    
                    while (true) {
                        const { value, done } = await reader.read();
                        if (done) break;
                        
                        // Joga o texto no terminal assim que ele chega do Arduino CLI
                        state.terminal.innerText += decoder.decode(value);
                        state.terminal.scrollTop = state.terminal.scrollHeight;
                    }
                } catch (error) { 
                    state.terminal.innerText += "\n⚠️ Erro de rede: " + error.message; 
                }
                
                state.terminal.scrollTop = state.terminal.scrollHeight;
                return; // Interrompe para não executar a parte Web
            }

            // ==========================================
            // FLUXO ORIGINAL: COMPILAÇÃO WEB
            // ==========================================
            state.terminal.innerText = "🚀 Iniciando compilação Web...\n";
            try {
                const response = await fetch('/compile', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ code: code, filename: currentFile.name })
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

    if (btnInstalarCli) {
        btnInstalarCli.addEventListener("click", () => {
            const progressContainer = document.getElementById('cli-progress-container');
            const progressText = document.getElementById('cli-progress-text');
            const progressBar = document.getElementById('cli-progress-bar');
            
            progressContainer.style.display = 'block';
            progressBar.style.width = '0%';
            progressText.innerText = '0%';
            
            state.terminal.innerText += "\n> 🔌 Iniciando pacote de instalação (CLI + ESP8266)...\n";
            state.terminal.scrollTop = state.terminal.scrollHeight;

            // Abre a conexão em tempo real com o servidor
            const source = new EventSource('/install-arduino-cli-stream');

            source.addEventListener('log', (e) => {
                const data = JSON.parse(e.data);
                state.terminal.innerText += data;
                state.terminal.scrollTop = state.terminal.scrollHeight;
            });

            source.addEventListener('progress', (e) => {
                const data = JSON.parse(e.data);
                progressBar.style.width = data + '%';
                progressText.innerText = data + '%';
            });

            source.addEventListener('done', (e) => {
                const data = JSON.parse(e.data);
                state.terminal.innerText += `\n> ✅ ${data}\n`;
                state.terminal.scrollTop = state.terminal.scrollHeight;
                
                progressBar.style.width = '100%';
                progressText.innerText = '100%';
                setTimeout(() => progressContainer.style.display = 'none', 3000); // Esconde a barra após 3 segundos
                source.close();
            });

            source.addEventListener('error', (e) => {
                const data = JSON.parse(e.data);
                state.terminal.innerText += `\n> ❌ ${data}\n`;
                state.terminal.scrollTop = state.terminal.scrollHeight;
                
                progressBar.style.background = '#bf616a'; // Fica vermelho se der erro
                setTimeout(() => {
                    progressContainer.style.display = 'none';
                    progressBar.style.background = '#a3be8c'; // Restaura a cor verde original
                }, 5000);
                
                source.close();
            });
        });
    }
}
