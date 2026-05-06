import { state } from './state.js';

export function setupTerminalAndCompiler() {
    const btnCompile = document.getElementById("btn-compile");
    
    if (btnCompile) {
        btnCompile.addEventListener("click", async () => {
            const currentFile = state.files[state.activeIndex];
            const code = state.editor.getValue();
            state.terminal.innerText = "🚀 Iniciando compilação...\n";
            
            state.currentErrorMarks.forEach(mark => mark.clear());
            state.currentErrorMarks = [];

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
                    a.href = url; a.download = `app_${currentFile.name.replace('.sol', '.html')}`; a.click();
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
            } catch (error) { state.terminal.innerText += "⚠️ Erro: " + error.message; }
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
