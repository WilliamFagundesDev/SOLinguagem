// Inicializa o editor CodeMirror
const editor = CodeMirror.fromTextArea(document.getElementById("editor"), {
    lineNumbers: true,
    theme: "dracula",
    mode: "javascript", // Usando JS provisoriamente para colorir a sintaxe
    indentUnit: 4
});

// Coloca um código inicial de exemplo
const initialCode = `mqtt {
    broker = "test.mosquitto.org";
    topic = "aula/compiladores/sol";
}

esp32 {
    pin led = 2 out;
}`;
editor.setValue(initialCode);

const btnCompile = document.getElementById("btn-compile");
const terminal = document.getElementById("terminal");

btnCompile.addEventListener("click", async () => {
    // Pega o texto de dentro do editor
    const code = editor.getValue();
    terminal.innerText = "Compilando...\n";

    try {
        // Envia para a rota /compile do nosso server.js
        const response = await fetch('/compile', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ code: code })
        });

        const result = await response.json();
        
        // Mostra o retorno do Node.js no terminal da IDE
        terminal.innerText += `Status: ${result.status}\n\n`;
        terminal.innerText += result.logs;

    } catch (error) {
        terminal.innerText += "Erro ao conectar com o compilador: " + error.message;
    }
});