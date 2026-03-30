// Código inicial temático focando no ESP32 e MQTT
const initialCode = `// ==== Configurações do Universo (Rede e MQTT) ====
planeta wifi_ssid = "Base_Estelar_WiFi";
planeta wifi_senha = "buraco_negro_123";

planeta broker_mqtt = "test.mosquitto.org";
planeta topico_sinal = "galaxia/esp32/comando";

// ==== Hardware do ESP32 ====
estrela pino_led = 2; // LED onboard do ESP32

// ==== Constelação principal de inicialização ====
constelacao iniciar_espaco() {
    supernova("Iniciando propulsores do ESP32...");
    // A linguagem fará o setup do WiFi e MQTT em C++ por trás dos panos
    supernova("Conectado ao Broker Estelar: " + broker_mqtt);
}

// ==== Reagindo aos comandos da Página Web ====
constelacao receber_sinal(mensagem) {
    orbita (mensagem == "LUZ") {
        // Envia energia para o pino 2
        pino_led = materia; // materia = true/HIGH
        supernova("Sinal da Web recebido: Emitindo luz!");
        
    } eclipse {
        // Corta a energia do pino 2
        pino_led = antimateria; // antimateria = false/LOW
        supernova("Sinal da Web recebido: Apagando luz.");
    }
}
`;

// Inicializa o editor CodeMirror
const editor = CodeMirror.fromTextArea(document.getElementById("editor"), {
    lineNumbers: true,
    theme: "dracula",
    mode: "javascript", 
    indentUnit: 4
});

// =========================================================
// GERENCIAMENTO DE ESTADO E ABAS (LOCALSTORAGE)
// =========================================================

const STORAGE_KEY = 'sol_ide_files';
const terminal = document.getElementById("terminal");

// Tenta carregar os arquivos do LocalStorage, se não houver, carrega o padrão
let files = JSON.parse(localStorage.getItem(STORAGE_KEY));
if (!files || files.length === 0) {
    files = [
        { name: "missao_alpha.sol", content: initialCode, isSaved: true }
    ];
}

let activeIndex = 0;
let isSwitchingTab = false; // Previne que a troca de aba acione o evento de "change" do CodeMirror

const tabsContainer = document.querySelector('.file-tabs');
// Garante que o container de abas permita rolagem horizontal para abas infinitas
tabsContainer.style.overflowX = 'auto';
tabsContainer.style.overflowY = 'hidden';
tabsContainer.style.display = 'flex';
tabsContainer.style.whiteSpace = 'nowrap';

// Função para renderizar as abas na tela
function renderTabs() {
    tabsContainer.innerHTML = '';
    
    files.forEach((file, index) => {
        const tab = document.createElement('div');
        tab.className = `tab ${index === activeIndex ? 'active' : ''}`;
        
        // Adiciona o asterisco se não estiver salvo
        tab.innerText = file.name + (file.isSaved ? '' : ' *');
        tab.title = "Duplo clique para renomear";
        
        tab.onclick = () => switchTab(index);
        tab.ondblclick = () => renameTab(index);
        
        tabsContainer.appendChild(tab);
    });
}

// Muda a aba atual
function switchTab(index) {
    if (index < 0 || index >= files.length) return;
    
    activeIndex = index;
    isSwitchingTab = true;
    editor.setValue(files[activeIndex].content);
    isSwitchingTab = false;
    
    renderTabs();
}

// Renomeia um arquivo
function renameTab(index) {
    let newName = prompt("Renomear constelação (arquivo):", files[index].name);
    
    if (newName && newName.trim() !== "") {
        if (!newName.endsWith('.sol')) newName += '.sol';
        files[index].name = newName;
        files[index].isSaved = false; // Marcamos como não salvo pois o nome mudou
        renderTabs();
    }
}

// Salva o arquivo atual no LocalStorage
function saveCurrentFile() {
    files[activeIndex].isSaved = true;
    files[activeIndex].content = editor.getValue();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(files));
    renderTabs();
    
    terminal.innerText += `\n💾 Arquivo '${files[activeIndex].name}' salvo na memória da nave!\n`;
}

// Cria um novo arquivo em branco
function createNewFile() {
    const newName = `nova_orbita_${files.length + 1}.sol`;
    files.push({ name: newName, content: '', isSaved: false });
    switchTab(files.length - 1);
}

// Detecta mudanças no editor para colocar o asterisco
editor.on("change", () => {
    if (isSwitchingTab) return; // Ignora se a mudança foi só uma troca de aba
    
    const currentFile = files[activeIndex];
    const newContent = editor.getValue();
    
    if (currentFile.content !== newContent) {
        currentFile.content = newContent;
        if (currentFile.isSaved) {
            currentFile.isSaved = false;
            renderTabs();
        }
    }
});

// Atalho Ctrl+S para salvar
document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        saveCurrentFile();
    }
});

// Inicialização da primeira renderização
isSwitchingTab = true;
editor.setValue(files[activeIndex].content);
isSwitchingTab = false;
renderTabs();

// =========================================================
// LÓGICA PARA RECEBER/ABRIR ARQUIVOS .SOL
// =========================================================

const fileInput = document.createElement('input');
fileInput.type = 'file';
fileInput.accept = '.sol';
fileInput.style.display = 'none';
document.body.appendChild(fileInput);

fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.sol')) {
        terminal.innerText += `\n⚠️ Atenção: Formato não reconhecido! Apenas arquivos .sol podem ser lidos por esta IDE.\n`;
        return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
        const content = event.target.result;
        
        // Adiciona como uma nova aba
        files.push({ name: file.name, content: content, isSaved: true });
        switchTab(files.length - 1);
        
        // Salva automaticamente no LocalStorage o novo arquivo aberto
        localStorage.setItem(STORAGE_KEY, JSON.stringify(files));

        terminal.innerText += `\n✨ Constelação '${file.name}' lida e anexada às abas!\n`;
    };
    reader.readAsText(file);
    fileInput.value = ''; 
});

// Associa os botões do Menu Lateral
const menuItems = document.querySelectorAll('.sidebar-options li');
menuItems.forEach(item => {
    // ABRIR
    if (item.innerText.includes('Abrir') || item.innerText.includes('Abrir Constelação') || item.innerText.includes('Abrir Projeto')) {
        item.addEventListener('click', () => { fileInput.click(); });
    }
    // NOVO
    if (item.innerText.includes('Novo Arquivo')) {
        item.addEventListener('click', createNewFile);
    }
    // SALVAR
    if (item.innerText.includes('Salvar Projeto') || item.innerText.includes('Salvar Constelação')) {
        item.addEventListener('click', saveCurrentFile);
    }
});

// =========================================================
// LÓGICA DE COMPILAÇÃO
// =========================================================

const btnCompile = document.getElementById("btn-compile");

btnCompile.addEventListener("click", async () => {
    const currentFile = files[activeIndex];
    const code = editor.getValue();
    
    terminal.innerText = "🚀 Iniciando motores de dobra...\n";
    terminal.innerText += `📦 Empacotando a constelação atual: [ ${currentFile.name} ]\n\n`;

    try {
        const response = await fetch('/compile', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ code: code, filename: currentFile.name })
        });

        const result = await response.json();
        
        terminal.innerText += `Status da Missão: ${result.status.toUpperCase()}\n`;
        terminal.innerText += `-------------------------------------------\n`;
        terminal.innerText += result.logs;
        
        if (result.status === "success") {
            terminal.innerText += `\n✅ Processo finalizado! O binário gerado reflete seu arquivo original: compilado_${currentFile.name.replace('.sol', '.bin')}\n`;
        }

    } catch (error) {
        terminal.innerText += "⚠️ Falha de comunicação com a base: " + error.message;
    }
});