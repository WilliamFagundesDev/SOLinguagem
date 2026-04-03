// =========================================================
// INJEÇÃO DE ESTILOS DINÂMICOS E RAINBOW BRACKETS
// =========================================================
const dynamicStyles = document.createElement('style');
dynamicStyles.innerHTML = `
    .CodeMirror-cursor {
        border-left: 2px solid #00e5ff !important;
        box-shadow: 0 0 5px #00e5ff;
    }
    
    .cm-s-nord .cm-keyword { color: #c678dd !important; font-weight: bold; text-shadow: 0 0 3px rgba(198, 120, 221, 0.4); } 
    .cm-s-nord .cm-def { color: #e5c07b !important; font-weight: bold; } 
    .cm-s-nord .cm-builtin { color: #61afef !important; } 
    .cm-s-nord .cm-atom { color: #d19a66 !important; font-style: italic; } 
    .cm-s-nord .cm-string { color: #98c379 !important; } 
    .cm-s-nord .cm-number { color: #d19a66 !important; } 
    .cm-s-nord .cm-operator { color: #56b6c2 !important; } 
    .cm-s-nord .cm-comment { color: #7f848e !important; font-style: italic; } 

    /* Cores dos Colchetes (Rainbow Brackets) */
    .cm-s-nord .cm-bracket.cm-level-1 { color: #ffd700 !important; font-weight: bold; text-shadow: 0 0 5px rgba(255, 215, 0, 0.4); } /* Amarelo */
    .cm-s-nord .cm-bracket.cm-level-2 { color: #da70d6 !important; font-weight: bold; text-shadow: 0 0 5px rgba(218, 112, 214, 0.4); } /* Rosa */
    .cm-s-nord .cm-bracket.cm-level-3 { color: #1e90ff !important; font-weight: bold; text-shadow: 0 0 5px rgba(30, 144, 255, 0.4); } /* Azul */
    .cm-s-nord .cm-bracket.cm-level-4 { color: #32cd32 !important; font-weight: bold; text-shadow: 0 0 5px rgba(50, 205, 50, 0.4); } /* Verde */
    .cm-s-nord .cm-bracket.cm-level-5 { color: #ff6347 !important; font-weight: bold; text-shadow: 0 0 5px rgba(255, 99, 71, 0.4); } /* Laranja */
    
    .tab { 
        display: flex !important; 
        align-items: center; 
        gap: 10px; 
        user-select: none;
    }
    .close-tab {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 22px;
        height: 22px;
        border-radius: 50%;
        font-size: 16px;
        color: #8b8c91;
        transition: all 0.2s;
    }
    .close-tab:hover {
        background-color: rgba(255, 95, 86, 0.2);
        color: #ff5f56;
    }
`;
document.head.appendChild(dynamicStyles);

// =========================================================
// DEFINIÇÃO DO MODO CUSTOMIZADO NO CODEMIRROR
// =========================================================
CodeMirror.defineMode("solinguagem", function() {
    return {
        startState: function() {
            return { depth: 0 };
        },
        token: function(stream, state) {
            if (stream.eatSpace()) return null;

            if (stream.match("//")) {
                stream.skipToEnd();
                return "comment";
            }

            if (stream.match(/^"[^"]*"/)) {
                return "string";
            }

            if (stream.match(/^[0-9]+(\.[0-9]+)?/)) {
                return "number";
            }

            const match = stream.match(/^[a-zA-Z_][a-zA-Z0-9_]*/);
            if (match) {
                const word = match[0];
                
                const keywords = ['tarefa', 'testa', 'falha', 'gira', 'manda', 'esp', 'web'];
                const types = ['guarda', 'crava'];
                const builtins = ['mostra', 'envia', 'tema']; // "tema" adicionado aqui!
                const atoms = ['sim', 'nao'];

                if (keywords.includes(word)) return "keyword";
                if (types.includes(word)) return "def";
                if (builtins.includes(word)) return "builtin";
                if (atoms.includes(word)) return "atom";
                
                return "variable";
            }

            if (stream.match(/^[+\-*/=<>!&|]+/)) {
                return "operator";
            }

            // RAINBOW BRACKETS LOGIC
            if (stream.match("[")) {
                state.depth++;
                return "bracket level-" + ((state.depth - 1) % 5 + 1);
            }
            if (stream.match("]")) {
                let currentLevel = state.depth;
                if (state.depth > 0) state.depth--;
                return "bracket level-" + ((currentLevel - 1) % 5 + 1);
            }
            
            stream.next();
            return null;
        }
    };
});

// Código inicial atualizado
const initialCode = `// ==== Configurações Globais de Rede ====
crava broker_mqtt = "test.mosquitto.org";

esp
// ==== Código do Hardware ====
crava wifi_ssid = "MinhaRede_IoT";
crava wifi_senha = "senha_secreta_123";
guarda pino_led = 2; // LED onboard

tarefa iniciar[] [
    mostra["Conectando ao WiFi..."];
]
esp

web
// ==== Interface HTML (Mude o visual com tema!) ====
tema["vermelho"];

tarefa iniciar[] [
    mostra["Painel sincronizado!"];
]

tarefa botao_ligar[] [
    envia["LIGAR"];
    mostra["Sinal enviado!"];
]
web
`;

// Guia da Linguagem
const guideContent = `// =========================================================
// 📖 GUIA OFICIAL DA LINGUAGEM (EDIÇÃO IoT)
// =========================================================
// Uma linguagem limpa focada em comunicação IoT bidirecional.
// Aqui não usamos parênteses () nem chaves {}. Tudo usa [].
//
// 1. AMBIENTES DE EXECUÇÃO
//   esp ... esp : Para o microcontrolador.
//   web ... web : Para a interface web gerada.
//
// 2. VARIÁVEIS E CONSTANTES
//   guarda: Cria uma variável que pode mudar de valor no futuro.
//   crava: Define um valor fixo que nunca mais será alterado.
//
// 3. FLUXO E LÓGICA (Tudo com Colchetes)
//   testa [condição] []: Avalia se algo é verdade.
//   falha []: O que fazer se o teste for mentira.
//
// 4. FUNÇÕES, COMANDOS E VISUAL
//   tarefa nome[argumentos] []: Define um bloco e cria um botão na interface!
//   mostra["texto"]; : Imprime logs no console ou monitor serial.
//   envia["comando"]; : Dispara uma mensagem via MQTT.
//   tema["vermelho"]; : Altera as cores da interface gerada para Vermelho e Preto!
//
`;

const editor = CodeMirror.fromTextArea(document.getElementById("editor"), {
    lineNumbers: true,
    theme: "nord", 
    mode: "solinguagem",
    indentUnit: 4,
    matchBrackets: true 
});

const STORAGE_KEY = 'sol_ide_files';
const terminal = document.getElementById("terminal");

let files = JSON.parse(localStorage.getItem(STORAGE_KEY));
if (!files || files.length === 0) {
    files = [
        { name: "main.sol", content: initialCode, isSaved: true }
    ];
}

let activeIndex = 0;
let isSwitchingTab = false; 

const tabsContainer = document.querySelector('.file-tabs');
tabsContainer.style.overflowX = 'auto';
tabsContainer.style.overflowY = 'hidden';
tabsContainer.style.display = 'flex';
tabsContainer.style.whiteSpace = 'nowrap';

const sidebarOptionsList = document.querySelector('.sidebar-options');
if (sidebarOptionsList) {
    const guideItem = document.createElement('li');
    guideItem.innerHTML = '<span class="icon">📖</span> Guia da Linguagem';
    guideItem.className = 'menu-category-action'; 
    guideItem.style.color = '#00e5ff';
    guideItem.style.marginTop = '15px';
    
    guideItem.onclick = openGuideTab;
    sidebarOptionsList.appendChild(guideItem);
}

function openGuideTab() {
    const guideFileName = "Guia_da_Linguagem.sol";
    const existingIndex = files.findIndex(f => f.name === guideFileName);
    
    if (existingIndex !== -1) {
        switchTab(existingIndex);
    } else {
        files.push({ name: guideFileName, content: guideContent, isSaved: true });
        switchTab(files.length - 1);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(files));
    }
}

function renderTabs() {
    tabsContainer.innerHTML = '';
    
    files.forEach((file, index) => {
        const tab = document.createElement('div');
        tab.className = `tab ${index === activeIndex ? 'active' : ''}`;
        
        const tabText = document.createElement('span');
        tabText.innerText = file.name + (file.isSaved ? '' : ' *');
        tabText.title = "Duplo clique para renomear";
        tabText.style.cursor = 'pointer';
        
        tabText.onclick = (e) => {
            e.stopPropagation();
            switchTab(index);
        };
        tabText.ondblclick = (e) => {
            e.stopPropagation();
            renameTab(index);
        };

        const closeBtn = document.createElement('span');
        closeBtn.className = 'close-tab';
        closeBtn.innerHTML = '&times;';
        closeBtn.title = "Apagar Arquivo";
        closeBtn.onclick = (e) => {
            e.stopPropagation();
            confirmDeleteTab(index);
        };
        
        tab.appendChild(tabText);
        tab.appendChild(closeBtn);
        tabsContainer.appendChild(tab);
    });
}

function switchTab(index) {
    if (index < 0 || index >= files.length) return;
    
    activeIndex = index;
    isSwitchingTab = true;
    editor.setValue(files[activeIndex].content);
    isSwitchingTab = false;
    
    renderTabs();
}

function renameTab(index) {
    let newName = prompt("Renomear arquivo:", files[index].name);
    
    if (newName && newName.trim() !== "") {
        if (!newName.endsWith('.sol')) newName += '.sol';
        files[index].name = newName;
        files[index].isSaved = false; 
        renderTabs();
    }
}

function saveCurrentFile() {
    files[activeIndex].isSaved = true;
    files[activeIndex].content = editor.getValue();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(files));
    renderTabs();
    
    terminal.innerText += `\n💾 Arquivo '${files[activeIndex].name}' salvo na IDE!\n`;
}

function createNewFile() {
    const newName = `script_${files.length + 1}.sol`;
    files.push({ name: newName, content: '', isSaved: false });
    switchTab(files.length - 1);
}

function exportCurrentFile() {
    const currentFile = files[activeIndex];
    const content = editor.getValue(); 
    
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = currentFile.name; 
    a.style.display = 'none';
    
    document.body.appendChild(a);
    a.click(); 
    
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    terminal.innerText += `\n📥 Projeto '${currentFile.name}' exportado para a sua máquina!\n`;
}

function showCustomConfirm(msg, onConfirm) {
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100vw';
    overlay.style.height = '100vh';
    overlay.style.backgroundColor = 'rgba(5, 5, 8, 0.8)';
    overlay.style.backdropFilter = 'blur(10px)';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.zIndex = '9999';
    overlay.style.opacity = '0';
    overlay.style.transition = 'opacity 0.3s ease';

    const box = document.createElement('div');
    box.style.background = 'rgba(20, 20, 30, 0.9)';
    box.style.border = '1px solid rgba(255, 95, 86, 0.4)';
    box.style.padding = '35px';
    box.style.borderRadius = '20px';
    box.style.maxWidth = '420px';
    box.style.textAlign = 'center';
    box.style.boxShadow = '0 15px 50px rgba(0, 0, 0, 0.5)';
    box.style.transform = 'scale(0.9)';
    box.style.transition = 'transform 0.3s cubic-bezier(0.25, 1, 0.5, 1)';

    const text = document.createElement('p');
    text.innerText = msg;
    text.style.color = '#f0f0f5';
    text.style.marginBottom = '30px';
    text.style.lineHeight = '1.6';
    text.style.fontSize = '15px';

    const btnContainer = document.createElement('div');
    btnContainer.style.display = 'flex';
    btnContainer.style.justifyContent = 'center';
    btnContainer.style.gap = '15px';

    const btnCancel = document.createElement('button');
    btnCancel.innerText = 'Cancelar';
    btnCancel.style.padding = '12px 24px';
    btnCancel.style.borderRadius = '12px';
    btnCancel.style.border = '1px solid #444';
    btnCancel.style.background = 'transparent';
    btnCancel.style.color = '#ccc';
    btnCancel.style.cursor = 'pointer';
    btnCancel.style.transition = 'background 0.2s';
    btnCancel.onmouseover = () => btnCancel.style.background = 'rgba(255,255,255,0.05)';
    btnCancel.onmouseout = () => btnCancel.style.background = 'transparent';
    btnCancel.onclick = () => {
        overlay.style.opacity = '0';
        setTimeout(() => document.body.removeChild(overlay), 300);
    };

    const btnConfirm = document.createElement('button');
    btnConfirm.innerText = 'Apagar Arquivo';
    btnConfirm.style.padding = '12px 24px';
    btnConfirm.style.borderRadius = '12px';
    btnConfirm.style.border = 'none';
    btnConfirm.style.background = '#ff5f56';
    btnConfirm.style.color = '#fff';
    btnConfirm.style.cursor = 'pointer';
    btnConfirm.style.fontWeight = 'bold';
    btnConfirm.style.transition = 'transform 0.2s';
    btnConfirm.onmousedown = () => btnConfirm.style.transform = 'scale(0.95)';
    btnConfirm.onmouseup = () => btnConfirm.style.transform = 'scale(1)';
    btnConfirm.onclick = () => {
        onConfirm();
        overlay.style.opacity = '0';
        setTimeout(() => document.body.removeChild(overlay), 300);
    };

    btnContainer.appendChild(btnCancel);
    btnContainer.appendChild(btnConfirm);
    box.appendChild(text);
    box.appendChild(btnContainer);
    overlay.appendChild(box);
    document.body.appendChild(overlay);

    requestAnimationFrame(() => {
        overlay.style.opacity = '1';
        box.style.transform = 'scale(1)';
    });
}

function confirmDeleteTab(index) {
    const file = files[index];
    showCustomConfirm(
        `⚠️ Atenção: Você está prestes a apagar o arquivo '${file.name}'. Esta ação destruirá os dados permanentemente. Deseja prosseguir?`, 
        () => {
            files.splice(index, 1);
            
            if (files.length === 0) {
                files.push({ name: "script.sol", content: "", isSaved: true });
                activeIndex = 0;
            } else if (activeIndex >= index) {
                activeIndex = Math.max(0, activeIndex - 1);
            }
            
            localStorage.setItem(STORAGE_KEY, JSON.stringify(files));
            
            isSwitchingTab = true;
            editor.setValue(files[activeIndex].content);
            isSwitchingTab = false;
            
            renderTabs();
            terminal.innerText += `\n🗑️ Arquivo apagado do sistema.\n`;
        }
    );
}

editor.on("change", () => {
    if (isSwitchingTab) return; 
    
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

document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        saveCurrentFile();
    }
});

isSwitchingTab = true;
editor.setValue(files[activeIndex].content);
isSwitchingTab = false;
renderTabs();

const fileInput = document.createElement('input');
fileInput.type = 'file';
fileInput.accept = '.sol';
fileInput.style.display = 'none';
document.body.appendChild(fileInput);

fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.sol')) {
        terminal.innerText += `\n⚠️ Atenção: Formato não reconhecido! Apenas arquivos .sol podem ser lidos.\n`;
        return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
        const content = event.target.result;
        
        files.push({ name: file.name, content: content, isSaved: true });
        switchTab(files.length - 1);
        
        localStorage.setItem(STORAGE_KEY, JSON.stringify(files));

        terminal.innerText += `\n✨ Arquivo '${file.name}' carregado no editor!\n`;
    };
    reader.readAsText(file);
    fileInput.value = ''; 
});

const menuItems = document.querySelectorAll('.sidebar-options li');
menuItems.forEach(item => {
    if (item.innerText.includes('Abrir') || item.innerText.includes('Importar Projeto') || item.innerText.includes('Abrir Projeto')) {
        item.addEventListener('click', () => { fileInput.click(); });
    }
    if (item.innerText.includes('Novo Arquivo')) {
        item.addEventListener('click', createNewFile);
    }
    if (item.innerText.includes('Salvar Projeto') || item.innerText.includes('Salvar Constelação')) {
        item.addEventListener('click', saveCurrentFile);
    }
    if (item.innerText.includes('Exportar Projeto')) {
        item.addEventListener('click', exportCurrentFile);
    }
});

const btnCompile = document.getElementById("btn-compile");

btnCompile.addEventListener("click", async () => {
    const currentFile = files[activeIndex];
    const code = editor.getValue();
    
    terminal.innerText = "🚀 Iniciando compilação do script...\n";
    terminal.innerText += `📦 Processando arquivo atual: [ ${currentFile.name} ]\n\n`;

    try {
        const response = await fetch('/compile', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ code: code, filename: currentFile.name })
        });

        const result = await response.json();
        
        terminal.innerText += `Status do Processo: ${result.status.toUpperCase()}\n`;
        terminal.innerText += `-------------------------------------------\n`;
        terminal.innerText += result.logs;
        
        if (result.status === "success") {
            if (result.generatedWeb) {
                const blob = new Blob([result.generatedWeb], { type: 'text/html;charset=utf-8' });
                const url = URL.createObjectURL(blob);
                
                const a = document.createElement('a');
                a.href = url;
                a.download = `app_${currentFile.name.replace('.sol', '.html')}`; 
                a.style.display = 'none';
                
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                
                terminal.innerText += `\n🌐 Interface Web gerada com sucesso! O download de "app_${currentFile.name.replace('.sol', '.html')}" começou.\n`;
            } else {
                terminal.innerText += `\n✅ Arquivo compilado, mas nenhum bloco 'web' detectado para exportação HTML.\n`;
            }
        }

    } catch (error) {
        terminal.innerText += "⚠️ Falha de comunicação com o servidor: " + error.message;
    }
});