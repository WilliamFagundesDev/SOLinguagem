// =========================================================
// SISTEMA DE TEMAS DA IDE
// =========================================================
const THEMES = ['dark', 'white', 'sol-modern', 'sol-classic', 'galaxy'];
let currentTheme = localStorage.getItem('sol_ide_theme') || 'dark';

function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('sol_ide_theme', theme);
}

function cycleTheme() {
    let currentIndex = THEMES.indexOf(currentTheme);
    currentIndex = (currentIndex + 1) % THEMES.length;
    currentTheme = THEMES[currentIndex];
    applyTheme(currentTheme);
    
    const terminalElement = document.getElementById("terminal");
    if (terminalElement) {
        terminalElement.innerText += `\n🎨 Tema da IDE alterado para: ${currentTheme.toUpperCase()}\n`;
        terminalElement.scrollTop = terminalElement.scrollHeight;
    }
}

applyTheme(currentTheme);


// =========================================================
// INJEÇÃO DE ESTILOS DINÂMICOS E RAINBOW BRACKETS
// =========================================================
const dynamicStyles = document.createElement('style');
dynamicStyles.innerHTML = `
    .CodeMirror-cursor {
        border-left: 2px solid var(--accent-glow) !important;
        box-shadow: 0 0 5px var(--accent-glow);
    }
    
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
                const builtins = ['mostra', 'envia', 'tema', 'caixa', 'texto', 'botao', 'estilo', 'atualiza', 'limpa', 'coloca']; 
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


// =========================================================
// INICIALIZAÇÃO DA IDE E ARQUIVOS (LOCALSTORAGE)
// =========================================================

const initialCode = `web
// ==== Memória ====
guarda visor_texto = "";
guarda memoria = 0;
guarda operacao = "";
guarda resultado = 0;

// ==== Construtor da Interface ====
tarefa iniciar[] [
    limpa[];
    tema["vermelho"];

    caixa["calc"];      estilo["calc", "chassi"];
    texto["visor", "0"]; coloca["visor", "calc"]; estilo["visor", "visor"];
    caixa["teclado"];   coloca["teclado", "calc"]; estilo["teclado", "grid"];

    // Linha 1 - Tema Futurista
    botao["btn7", "7", "digita_7"]; coloca["btn7", "teclado"]; estilo["btn7", "Futurista"];
    botao["btn8", "8", "digita_8"]; coloca["btn8", "teclado"]; estilo["btn8", "Futurista"];
    botao["btn9", "9", "digita_9"]; coloca["btn9", "teclado"]; estilo["btn9", "Futurista"];
    botao["btnDiv", "/", "op_div"]; coloca["btnDiv", "teclado"]; estilo["btnDiv", "Moderno"];

    // Linha 2 - Tema Primitivo
    botao["btn4", "4", "digita_4"]; coloca["btn4", "teclado"]; estilo["btn4", "Primitivo"];
    botao["btn5", "5", "digita_5"]; coloca["btn5", "teclado"]; estilo["btn5", "Primitivo"];
    botao["btn6", "6", "digita_6"]; coloca["btn6", "teclado"]; estilo["btn6", "Primitivo"];
    botao["btnMult", "*", "op_mult"]; coloca["btnMult", "teclado"]; estilo["btnMult", "Moderno"];

    // Linha 3 - Tema Arcaico
    botao["btn1", "1", "digita_1"]; coloca["btn1", "teclado"]; estilo["btn1", "Arcaico"];
    botao["btn2", "2", "digita_2"]; coloca["btn2", "teclado"]; estilo["btn2", "Arcaico"];
    botao["btn3", "3", "digita_3"]; coloca["btn3", "teclado"]; estilo["btn3", "Arcaico"];
    botao["btnSub", "-", "op_sub"]; coloca["btnSub", "teclado"]; estilo["btnSub", "Moderno"];

    // Linha 4 - Tema Windows XP
    botao["btnC", "C", "limpar_tudo"]; coloca["btnC", "teclado"]; estilo["btnC", "WindowsXP"];
    botao["btn0", "0", "digita_0"]; coloca["btn0", "teclado"]; estilo["btn0", "WindowsXP"];
    botao["btnIgual", "=", "calcular"]; coloca["btnIgual", "teclado"]; estilo["btnIgual", "WindowsXP"];
    botao["btnSoma", "+", "op_soma"]; coloca["btnSoma", "teclado"]; estilo["btnSoma", "Moderno"];
]

// ==== Lógica Básica ====
tarefa digita_7[] [ visor_texto = visor_texto + "7"; atualiza["visor", visor_texto]; ]
tarefa digita_8[] [ visor_texto = visor_texto + "8"; atualiza["visor", visor_texto]; ]
tarefa digita_9[] [ visor_texto = visor_texto + "9"; atualiza["visor", visor_texto]; ]

tarefa digita_4[] [ visor_texto = visor_texto + "4"; atualiza["visor", visor_texto]; ]
tarefa digita_5[] [ visor_texto = visor_texto + "5"; atualiza["visor", visor_texto]; ]
tarefa digita_6[] [ visor_texto = visor_texto + "6"; atualiza["visor", visor_texto]; ]

tarefa digita_1[] [ visor_texto = visor_texto + "1"; atualiza["visor", visor_texto]; ]
tarefa digita_2[] [ visor_texto = visor_texto + "2"; atualiza["visor", visor_texto]; ]
tarefa digita_3[] [ visor_texto = visor_texto + "3"; atualiza["visor", visor_texto]; ]
tarefa digita_0[] [ visor_texto = visor_texto + "0"; atualiza["visor", visor_texto]; ]

tarefa op_soma[] [ memoria = visor_texto * 1; operacao = "soma"; visor_texto = ""; atualiza["visor", "+"]; ]
tarefa op_sub[]  [ memoria = visor_texto * 1; operacao = "sub";  visor_texto = ""; atualiza["visor", "-"]; ]
tarefa op_mult[] [ memoria = visor_texto * 1; operacao = "mult"; visor_texto = ""; atualiza["visor", "*"]; ]
tarefa op_div[]  [ memoria = visor_texto * 1; operacao = "div";  visor_texto = ""; atualiza["visor", "/"]; ]

tarefa calcular[] [
    guarda atual = visor_texto * 1;
    
    testa [operacao == "soma"] [ resultado = memoria + atual; ]
    testa [operacao == "sub"]  [ resultado = memoria - atual; ]
    testa [operacao == "mult"] [ resultado = memoria * atual; ]
    testa [operacao == "div"]  [ resultado = memoria / atual; ]
    
    visor_texto = resultado + "";
    atualiza["visor", visor_texto];
]

tarefa limpar_tudo[] [
    visor_texto = ""; memoria = 0; operacao = ""; resultado = 0;
    atualiza["visor", "0"];
]
web
`;

const guideContent = `// =========================================================
// 📖 GUIA DE ESTILOS DA SOLINGUAGEM E IDE
// =========================================================
// Chega de escrever CSS na mão! A SOLinguagem possui temas 
// pré-prontos integrados no comando 'estilo'.
//
// 1. TEMAS PARA BOTÕES E ELEMENTOS
//    estilo["meu_botao", "Moderno"]; -> Estilo clean/iOS
//    estilo["meu_botao", "Futurista"]; -> Neon Cyberpunk
//    estilo["meu_botao", "Primitivo"]; -> Rústico/Terra
//    estilo["meu_botao", "Arcaico"]; -> Terminal Verde/Preto
//    estilo["meu_botao", "WindowsXP"]; -> Estilo retrô clássico
//
// 2. TEMAS PARA LAYOUTS
//    estilo["minha_caixa", "chassi"]; -> Cria um contêiner bonito.
//    estilo["meu_painel", "visor"]; -> Cria um painel LCD escuro.
//    estilo["minha_grid", "grid"]; -> Organiza os itens de 4 em 4.
//
// 3. TEMAS DA IDE
//    Você pode clicar em "Trocar Tema" no menu lateral para 
//    alternar as cores do seu ambiente de desenvolvimento. 
//    Opções: Dark, White, SOL Modern, SOL Classic e Galaxy!
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
        { name: "calculadora_magica.sol", content: initialCode, isSaved: true }
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


// =========================================================
// LÓGICA DO MENU DE CONTEXTO (Botão Direito nas Abas)
// =========================================================
const contextMenu = document.getElementById('tab-context-menu');
let contextMenuTabIndex = -1;

function showContextMenu(x, y, index) {
    contextMenuTabIndex = index;
    contextMenu.style.display = 'flex';
    
    const menuWidth = contextMenu.offsetWidth;
    const menuHeight = contextMenu.offsetHeight;
    
    let left = x;
    let top = y;
    
    if (left + menuWidth > window.innerWidth) {
        left = window.innerWidth - menuWidth - 10;
    }
    if (top + menuHeight > window.innerHeight) {
        top = window.innerHeight - menuHeight - 10;
    }
    
    contextMenu.style.left = `${left}px`;
    contextMenu.style.top = `${top}px`;
}

document.addEventListener('click', (e) => {
    if (e.target.closest('.context-menu')) return;
    contextMenu.style.display = 'none';
});

// Ações do Menu de Contexto
document.getElementById('ctx-rename').addEventListener('click', () => {
    contextMenu.style.display = 'none';
    if (contextMenuTabIndex !== -1) renameTab(contextMenuTabIndex);
});

document.getElementById('ctx-duplicate').addEventListener('click', () => {
    contextMenu.style.display = 'none';
    if (contextMenuTabIndex !== -1) {
        const file = files[contextMenuTabIndex];
        let newName = `copia_${file.name}`;
        files.push({ name: newName, content: file.content, isSaved: false });
        switchTab(files.length - 1);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(files));
    }
});

document.getElementById('ctx-export').addEventListener('click', () => {
    contextMenu.style.display = 'none';
    if (contextMenuTabIndex !== -1) exportSpecificFile(contextMenuTabIndex);
});

document.getElementById('ctx-delete').addEventListener('click', () => {
    contextMenu.style.display = 'none';
    if (contextMenuTabIndex !== -1) confirmDeleteTab(contextMenuTabIndex);
});


// =========================================================
// RENDERIZAÇÃO DAS ABAS
// =========================================================

function renderTabs() {
    tabsContainer.innerHTML = '';
    
    files.forEach((file, index) => {
        const tab = document.createElement('div');
        tab.className = `tab ${index === activeIndex ? 'active' : ''}`;
        
        const tabText = document.createElement('span');
        tabText.innerText = file.name + (file.isSaved ? '' : ' *');
        tabText.title = "Duplo clique para renomear, Botão direito para opções";
        tabText.style.cursor = 'pointer';
        
        tabText.onclick = (e) => {
            e.stopPropagation();
            switchTab(index);
        };
        tabText.ondblclick = (e) => {
            e.stopPropagation();
            renameTab(index);
        };

        // Escutador do Menu de Contexto
        tabText.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            e.stopPropagation();
            showContextMenu(e.clientX, e.clientY, index);
        });

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

function exportSpecificFile(index) {
    const file = files[index];
    
    let exportContent = file.content;
    if(index === activeIndex) {
        exportContent = editor.getValue();
    }
    
    const blob = new Blob([exportContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name; 
    a.style.display = 'none';
    
    document.body.appendChild(a);
    a.click(); 
    
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    terminal.innerText += `\n📥 Projeto '${file.name}' exportado para a sua máquina!\n`;
}


// =========================================================
// SISTEMA DE ALERTAS E PROMPTS CUSTOMIZADOS (MODALS)
// =========================================================

// NOVO: Modal Customizado de Renomear (Resolve o bug do navegador bloquear o prompt nativo)
function showCustomPrompt(title, defaultValue, onConfirm) {
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0'; overlay.style.left = '0';
    overlay.style.width = '100vw'; overlay.style.height = '100vh';
    overlay.style.backgroundColor = 'rgba(5, 5, 8, 0.8)';
    overlay.style.backdropFilter = 'blur(10px)';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center'; overlay.style.justifyContent = 'center';
    overlay.style.zIndex = '999999';
    overlay.style.opacity = '0';
    overlay.style.transition = 'opacity 0.3s ease';

    const box = document.createElement('div');
    box.style.background = 'rgba(20, 20, 30, 0.9)';
    box.style.border = '1px solid rgba(0, 229, 255, 0.4)';
    box.style.padding = '35px';
    box.style.borderRadius = '20px';
    box.style.maxWidth = '420px';
    box.style.width = '90%';
    box.style.textAlign = 'center';
    box.style.boxShadow = '0 15px 50px rgba(0, 0, 0, 0.5)';
    box.style.transform = 'scale(0.9)';
    box.style.transition = 'transform 0.3s cubic-bezier(0.25, 1, 0.5, 1)';

    const text = document.createElement('p');
    text.innerText = title;
    text.style.color = '#f0f0f5';
    text.style.marginBottom = '15px';
    text.style.fontSize = '16px';
    text.style.fontWeight = 'bold';

    const input = document.createElement('input');
    input.type = 'text';
    input.value = defaultValue;
    input.style.width = '100%';
    input.style.padding = '12px';
    input.style.marginBottom = '25px';
    input.style.borderRadius = '10px';
    input.style.border = '1px solid rgba(0, 229, 255, 0.5)';
    input.style.background = 'rgba(0, 0, 0, 0.5)';
    input.style.color = '#fff';
    input.style.fontFamily = 'monospace';
    input.style.fontSize = '14px';
    input.style.outline = 'none';
    
    input.onfocus = () => input.style.borderColor = '#00e5ff';
    input.onblur = () => input.style.borderColor = 'rgba(0, 229, 255, 0.5)';

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
    btnCancel.onclick = () => {
        overlay.style.opacity = '0';
        setTimeout(() => document.body.removeChild(overlay), 300);
    };

    const btnConfirm = document.createElement('button');
    btnConfirm.innerText = 'Salvar';
    btnConfirm.style.padding = '12px 24px';
    btnConfirm.style.borderRadius = '12px';
    btnConfirm.style.border = 'none';
    btnConfirm.style.background = '#00e5ff';
    btnConfirm.style.color = '#000';
    btnConfirm.style.cursor = 'pointer';
    btnConfirm.style.fontWeight = 'bold';
    btnConfirm.style.transition = 'transform 0.2s';
    btnConfirm.onclick = () => {
        onConfirm(input.value);
        overlay.style.opacity = '0';
        setTimeout(() => document.body.removeChild(overlay), 300);
    };

    // Confirma no "Enter"
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') btnConfirm.click();
    });

    btnContainer.appendChild(btnCancel);
    btnContainer.appendChild(btnConfirm);
    box.appendChild(text);
    box.appendChild(input);
    box.appendChild(btnContainer);
    overlay.appendChild(box);
    document.body.appendChild(overlay);

    requestAnimationFrame(() => {
        overlay.style.opacity = '1';
        box.style.transform = 'scale(1)';
        input.focus();
        
        // Seleciona o nome do arquivo sem a extensão
        const dotIndex = input.value.lastIndexOf('.');
        if(dotIndex > 0) input.setSelectionRange(0, dotIndex);
        else input.select();
    });
}

// Substituindo o prompt nativo pelo nosso Modal Bonitão
function renameTab(index) {
    showCustomPrompt("Renomear arquivo:", files[index].name, (newName) => {
        if (newName && newName.trim() !== "") {
            if (!newName.endsWith('.sol')) newName += '.sol';
            files[index].name = newName;
            files[index].isSaved = false; 
            
            // Agora salvamos no LocalStorage para a mudança ser definitiva!
            localStorage.setItem(STORAGE_KEY, JSON.stringify(files));
            renderTabs();
        }
    });
}

function showCustomConfirm(msg, onConfirm) {
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0'; overlay.style.left = '0';
    overlay.style.width = '100vw'; overlay.style.height = '100vh';
    overlay.style.backgroundColor = 'rgba(5, 5, 8, 0.8)';
    overlay.style.backdropFilter = 'blur(10px)';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center'; overlay.style.justifyContent = 'center';
    overlay.style.zIndex = '999999';
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

// =========================================================
// EVENTOS GLOBAIS E INICIALIZAÇÃO
// =========================================================

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
        item.addEventListener('click', () => exportSpecificFile(activeIndex));
    }
    if (item.innerText.includes('Trocar Tema')) {
        item.addEventListener('click', cycleTheme);
    }
});

// Lógica de Compilação
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