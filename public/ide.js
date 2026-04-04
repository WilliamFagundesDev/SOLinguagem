// =========================================================
// INJEÇÃO DE ESTILOS DINÂMICOS E TEMAS (DARK, WHITE, MODERN, CLASSIC, GALAXY)
// =========================================================
const dynamicStyles = document.createElement('style');
dynamicStyles.innerHTML = `
    /* Variáveis Base e Cursor Adaptativo */
    .CodeMirror-cursor {
        border-left: 2px solid var(--accent-glow, #00e5ff) !important;
        box-shadow: 0 0 5px var(--accent-glow, #00e5ff);
    }
    
    /* Configuração padrão do Editor (Nord) */
    .cm-s-nord .cm-keyword { color: #c678dd !important; font-weight: bold; text-shadow: 0 0 3px rgba(198, 120, 221, 0.4); } 
    .cm-s-nord .cm-def { color: #e5c07b !important; font-weight: bold; } 
    .cm-s-nord .cm-builtin { color: #61afef !important; font-weight: bold;} 
    .cm-s-nord .cm-atom { color: #d19a66 !important; font-style: italic; } 
    .cm-s-nord .cm-string { color: #98c379 !important; } 
    .cm-s-nord .cm-number { color: #d19a66 !important; } 
    .cm-s-nord .cm-operator { color: #56b6c2 !important; } 
    .cm-s-nord .cm-comment { color: #7f848e !important; font-style: italic; } 
    .cm-s-nord .cm-property { color: #ffaa00 !important; font-style: italic; font-weight: bold; } /* Nova cor para Propriedades */

    /* Rainbow Brackets Padrão */
    .cm-s-nord .cm-bracket.cm-level-1 { color: #ffd700 !important; font-weight: bold; } 
    .cm-s-nord .cm-bracket.cm-level-2 { color: #da70d6 !important; font-weight: bold; } 
    .cm-s-nord .cm-bracket.cm-level-3 { color: #1e90ff !important; font-weight: bold; } 
    .cm-s-nord .cm-bracket.cm-level-4 { color: #32cd32 !important; font-weight: bold; } 
    .cm-s-nord .cm-bracket.cm-level-5 { color: #ff6347 !important; font-weight: bold; } 
    
    .tab { display: flex !important; align-items: center; gap: 10px; user-select: none; position: relative; }
    .close-tab { display: flex; justify-content: center; align-items: center; width: 22px; height: 22px; border-radius: 50%; font-size: 16px; color: #8b8c91; transition: all 0.2s; }
    .close-tab:hover { background-color: rgba(255, 95, 86, 0.2); color: #ff5f56; }

    .custom-context-menu {
        position: fixed; background: rgba(20, 20, 30, 0.95); backdrop-filter: blur(15px); -webkit-backdrop-filter: blur(15px);
        border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        padding: 8px; z-index: 10000; min-width: 180px; display: none;
    }
    .context-menu-item { padding: 10px 15px; color: #f0f0f5; font-size: 13px; cursor: pointer; border-radius: 8px; display: flex; align-items: center; gap: 10px; transition: background 0.2s; }
    .context-menu-item:hover { background: rgba(255, 255, 255, 0.08); }
    .context-menu-item.danger:hover { background: rgba(255, 95, 86, 0.15); color: #ff5f56; }

    /* --- TEMAS CUSTOMIZADOS --- */

    /* TEMA 2: WHITE */
    :root[data-theme="white"] {
        --bg-base: #f4f4f8;
        --glass-bg: rgba(255, 255, 255, 0.7);
        --glass-border: rgba(0, 0, 0, 0.1);
        --accent-glow: #0055ff;
        --accent-glow-secondary: #ff0055;
        --text-main: #1a1a24;
        --text-muted: #666677;
    }
    :root[data-theme="white"] .CodeMirror { color: #1a1a24 !important; text-shadow: none !important; }
    :root[data-theme="white"] .CodeMirror-gutters { background-color: rgba(0, 0, 0, 0.05) !important; border-right: 1px solid var(--glass-border) !important;}
    :root[data-theme="white"] .CodeMirror-linenumber { color: rgba(0, 0, 0, 0.4) !important; }
    :root[data-theme="white"] #terminal { color: #333 !important; font-weight: 500; text-shadow: none !important; }
    :root[data-theme="white"] .sidebar-brand .brand-text { color: #1a1a24; }
    :root[data-theme="white"] .tab.active { background: rgba(0,0,0,0.05); }
    :root[data-theme="white"] .terminal-container { background: rgba(240, 240, 245, 0.8); }
    :root[data-theme="white"] .editor-container { background: rgba(255, 255, 255, 0.5); }
    :root[data-theme="white"] .sidebar { background: rgba(240, 240, 245, 0.8); }
    :root[data-theme="white"] .cm-s-nord .cm-keyword { color: #c2185b !important; text-shadow: none !important; } 
    :root[data-theme="white"] .cm-s-nord .cm-def { color: #1976d2 !important; text-shadow: none !important; } 
    :root[data-theme="white"] .cm-s-nord .cm-builtin { color: #0288d1 !important; text-shadow: none !important; }
    :root[data-theme="white"] .cm-s-nord .cm-string { color: #2e7d32 !important; text-shadow: none !important; } 
    :root[data-theme="white"] .cm-s-nord .cm-number, :root[data-theme="white"] .cm-s-nord .cm-atom { color: #e65100 !important; text-shadow: none !important; } 
    :root[data-theme="white"] .cm-s-nord .cm-operator { color: #d32f2f !important; text-shadow: none !important; }
    :root[data-theme="white"] .cm-s-nord .cm-comment { color: #757575 !important; text-shadow: none !important; }
    :root[data-theme="white"] .cm-s-nord .cm-variable { color: #202028 !important; text-shadow: none !important; font-weight: 600; }
    :root[data-theme="white"] .cm-s-nord .cm-property { color: #ff6600 !important; font-weight: bold; } 

    /* TEMA 3: SOL MODERN */
    :root[data-theme="sol-modern"] {
        --bg-base: #0a1128;
        --glass-bg: rgba(10, 17, 40, 0.6);
        --glass-border: rgba(0, 229, 255, 0.2);
        --accent-glow: #00e5ff;
        --accent-glow-secondary: #ff8800;
        --text-main: #e0fbfc;
        --text-muted: #8d99ae;
    }
    :root[data-theme="sol-modern"] .cm-s-nord .cm-keyword { color: #ff8800 !important; text-shadow: 0 0 3px rgba(255, 136, 0, 0.4) !important; }
    :root[data-theme="sol-modern"] .cm-s-nord .cm-def { color: #00e5ff !important; }
    :root[data-theme="sol-modern"] .cm-s-nord .cm-builtin { color: #00bfff !important; }
    :root[data-theme="sol-modern"] .cm-s-nord .cm-string { color: #00fa9a !important; }
    :root[data-theme="sol-modern"] .cm-s-nord .cm-number, :root[data-theme="sol-modern"] .cm-s-nord .cm-atom { color: #ffaa00 !important; }
    :root[data-theme="sol-modern"] .cm-s-nord .cm-comment { color: #8d99ae !important; }

    /* TEMA 4: SOL CLASSIC */
    :root[data-theme="sol-classic"] {
        --bg-base: #001a33;
        --glass-bg: rgba(0, 26, 51, 0.6);
        --glass-border: rgba(255, 204, 0, 0.3);
        --accent-glow: #ffcc00;
        --accent-glow-secondary: #0088ff;
        --text-main: #ffffff;
        --text-muted: #b3c6ff;
    }
    :root[data-theme="sol-classic"] .cm-s-nord .cm-keyword { color: #ffcc00 !important; text-shadow: 0 0 5px rgba(255, 204, 0, 0.4) !important; }
    :root[data-theme="sol-classic"] .cm-s-nord .cm-def { color: #0088ff !important; }
    :root[data-theme="sol-classic"] .cm-s-nord .cm-builtin { color: #33aaff !important; }
    :root[data-theme="sol-classic"] .cm-s-nord .cm-string { color: #00ffcc !important; }
    :root[data-theme="sol-classic"] .cm-s-nord .cm-number, :root[data-theme="sol-classic"] .cm-s-nord .cm-atom { color: #ffaa00 !important; }
    :root[data-theme="sol-classic"] .cm-s-nord .cm-comment { color: #6688aa !important; }
    :root[data-theme="sol-classic"] .cm-s-nord .cm-operator { color: #ffffff !important; }

    /* TEMA 5: GALAXY */
    :root[data-theme="galaxy"] {
        --bg-base: #150524;
        --glass-bg: rgba(21, 5, 36, 0.6);
        --glass-border: rgba(200, 100, 255, 0.2);
        --accent-glow: #d400ff;
        --accent-glow-secondary: #00d4ff;
        --text-main: #f3e8ff;
        --text-muted: #a890c2;
    }
    :root[data-theme="galaxy"] .cm-s-nord .cm-keyword { color: #d400ff !important; text-shadow: 0 0 5px rgba(212, 0, 255, 0.4) !important; }
    :root[data-theme="galaxy"] .cm-s-nord .cm-def { color: #00d4ff !important; }
    :root[data-theme="galaxy"] .cm-s-nord .cm-builtin { color: #aa00ff !important; }
    :root[data-theme="galaxy"] .cm-s-nord .cm-string { color: #00ffaa !important; }
    :root[data-theme="galaxy"] .cm-s-nord .cm-number, :root[data-theme="galaxy"] .cm-s-nord .cm-atom { color: #ff00aa !important; }
    :root[data-theme="galaxy"] .cm-s-nord .cm-comment { color: #a890c2 !important; }
    :root[data-theme="galaxy"] .cm-s-nord .cm-operator { color: #f3e8ff !important; }

    /* ESTILIZAÇÃO DO ERRO NO CÓDIGO (Ondulado Vermelho) */
    .error-underline {
        text-decoration: underline wavy #ff5f56;
        background-color: rgba(255, 95, 86, 0.15);
    }
`;
document.head.appendChild(dynamicStyles);

const contextMenu = document.createElement('div');
contextMenu.className = 'custom-context-menu';
document.body.appendChild(contextMenu);
document.addEventListener('click', () => { contextMenu.style.display = 'none'; });

// =========================================================
// DEFINIÇÃO DO MODO CUSTOMIZADO NO CODEMIRROR
// =========================================================
CodeMirror.defineMode("solinguagem", function() {
    return {
        startState: function() { return { depth: 0 }; },
        token: function(stream, state) {
            if (stream.eatSpace()) return null;
            if (stream.match("//")) { stream.skipToEnd(); return "comment"; }
            if (stream.match(/^"[^"]*"/)) return "string";
            if (stream.match(/^[0-9]+(\.[0-9]+)?/)) return "number";
            const match = stream.match(/^[a-zA-Z_][a-zA-Z0-9_]*/);
            if (match) {
                const word = match[0];
                const keywords = ['tarefa', 'testa', 'falha', 'gira', 'manda', 'esp', 'web'];
                const types = ['guarda', 'crava'];
                const builtins = ['mostra', 'envia', 'tema', 'caixa', 'botao', 'atualiza', 'limpa']; 
                const properties = ['cor', 'tamanho', 'texto', 'funcao', 'estilo', 'coloca']; // Novas propriedades
                const atoms = ['sim', 'nao'];
                
                if (keywords.includes(word)) return "keyword";
                if (types.includes(word)) return "def";
                if (builtins.includes(word)) return "builtin";
                if (properties.includes(word)) return "property";
                if (atoms.includes(word)) return "atom";
                return "variable";
            }
            if (stream.match(/^[+\-*/=<>!&|]+/)) return "operator";
            if (stream.match("[")) { state.depth++; return "bracket level-" + ((state.depth - 1) % 5 + 1); }
            if (stream.match("]")) { let currentLevel = state.depth; if (state.depth > 0) state.depth--; return "bracket level-" + ((currentLevel - 1) % 5 + 1); }
            stream.next(); return null;
        }
    };
});

// === SINTAXE LIMPA E ENCADEADA ===
const initialCode = `web
// ==== Exemplo de Construtor UI em SOLinguagem ====
guarda valor = 0

tarefa iniciar[] [
    limpa[]
    tema[]cor["escuro"],
    
    // Construtor Encadeado (Muito mais limpo!)
    caixa["visor_caixa"]cor["preto"]tamanho["gigante"]estilo["moderno"],
    texto["visor_txt"]texto["0"]coloca["visor_caixa"],
    
    caixa["teclas"]estilo["display: flex; gap: 10px; margin-top: 15px;"],
    
    botao["btn_soma"]texto["+ 10"]cor["azul"]tamanho["medio"]estilo["moderno"]funcao["soma_dez"]coloca["teclas"],
    botao["btn_subtrai"]texto["- 5"]cor["vermelho"]tamanho["medio"]estilo["moderno"]funcao["subtrai_cinco"]coloca["teclas"],
    
    botao["btn_zerar"]texto["Zerar"]cor["cinza"]tamanho["medio"]estilo["moderno"]funcao["zerar_visor"]
]

tarefa soma_dez[] [
    valor = valor + 10
    atualiza["visor_txt", valor]
]

tarefa subtrai_cinco[] [
    valor = valor - 5
    atualiza["visor_txt", valor]
]

tarefa zerar_visor[] [
    valor = 0
    atualiza["visor_txt", valor]
]
web
`;

const guideContent = `// =========================================================
// 📖 GUIA DE UI BUILDER EM SOLINGUAGEM
// =========================================================
`;

const editor = CodeMirror.fromTextArea(document.getElementById("editor"), {
    lineNumbers: true, theme: "nord", mode: "solinguagem", indentUnit: 4, matchBrackets: true 
});

const STORAGE_KEY = 'sol_ide_files';
const terminal = document.getElementById("terminal");

let files = JSON.parse(localStorage.getItem(STORAGE_KEY));
if (!files || files.length === 0) {
    files = [{ name: "app.sol", content: initialCode, isSaved: true }];
}

let activeIndex = 0;
let isSwitchingTab = false; 
const tabsContainer = document.querySelector('.file-tabs');

function renderTabs() {
    tabsContainer.innerHTML = '';
    files.forEach((file, index) => {
        const tab = document.createElement('div');
        tab.className = `tab ${index === activeIndex ? 'active' : ''}`;
        tab.style.cursor = 'pointer';
        tab.onclick = () => switchTab(index);
        tab.oncontextmenu = (e) => { e.preventDefault(); e.stopPropagation(); showTabContextMenu(e, index); };

        const tabText = document.createElement('span');
        tabText.innerText = file.name + (file.isSaved ? '' : ' *');
        
        const closeBtn = document.createElement('span');
        closeBtn.className = 'close-tab';
        closeBtn.innerHTML = '&times;';
        closeBtn.onclick = (e) => { e.stopPropagation(); confirmDeleteTab(index); };
        
        tab.appendChild(tabText);
        tab.appendChild(closeBtn);
        tabsContainer.appendChild(tab);
    });
}

function showTabContextMenu(e, index) {
    contextMenu.innerHTML = `
        <div class="context-menu-item" data-action="save"><span class="icon">💾</span> Salvar Arquivo</div>
        <div class="context-menu-item" data-action="rename"><span class="icon">✏️</span> Renomear</div>
        <div class="context-menu-item" data-action="export"><span class="icon">⤓</span> Exportar (.sol)</div>
        <div style="height: 1px; background: rgba(255,255,255,0.1); margin: 5px 0;"></div>
        <div class="context-menu-item danger" data-action="delete"><span class="icon">🗑️</span> Apagar Definitivamente</div>
    `;
    contextMenu.style.top = `${e.clientY}px`;
    contextMenu.style.left = `${e.clientX}px`;
    contextMenu.style.display = 'block';

    contextMenu.querySelectorAll('.context-menu-item').forEach(item => {
        item.onclick = (ev) => {
            ev.stopPropagation(); 
            const action = item.getAttribute('data-action');
            contextMenu.style.display = 'none';
            setTimeout(() => {
                if (action === 'save') saveCurrentFile();
                if (action === 'rename') renameTab(index);
                if (action === 'export') { switchTab(index); setTimeout(exportCurrentFile, 100); }
                if (action === 'delete') confirmDeleteTab(index);
            }, 10);
        };
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

function showCustomPrompt(title, defaultValue, onConfirm) {
    const overlay = document.createElement('div');
    overlay.style = `position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(5,5,8,0.8); backdrop-filter:blur(10px); display:flex; align-items:center; justify-content:center; z-index:9999;`;
    overlay.innerHTML = `
        <div style="background:rgba(20,20,30,0.9); border:1px solid var(--accent-glow); padding:30px; border-radius:20px; width:400px; text-align:center;">
            <p style="color:#f0f0f5; margin-bottom:20px;">${title}</p>
            <input type="text" id="prompt-input" value="${defaultValue}" style="width:100%; padding:12px; border-radius:10px; border:1px solid rgba(255,255,255,0.1); background:rgba(0,0,0,0.3); color:#fff; text-align:center; outline:none; border-color:var(--accent-glow);">
            <div style="display:flex; gap:12px; margin-top:20px;">
                <button id="prompt-cancel" style="flex:1; padding:10px; border-radius:10px; border:1px solid #444; background:transparent; color:#ccc; cursor:pointer;">Cancelar</button>
                <button id="prompt-confirm" style="flex:1; padding:10px; border-radius:10px; border:none; background:var(--accent-glow); color:#000; cursor:pointer; font-weight:bold;">Confirmar</button>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);
    const input = document.getElementById('prompt-input');
    input.focus(); input.select();
    const close = () => document.body.removeChild(overlay);
    document.getElementById('prompt-cancel').onclick = close;
    document.getElementById('prompt-confirm').onclick = () => { onConfirm(input.value); close(); };
    input.onkeydown = (e) => { if (e.key === 'Enter') document.getElementById('prompt-confirm').click(); if (e.key === 'Escape') close(); };
}

function renameTab(index) {
    showCustomPrompt("Novo nome para o ficheiro:", files[index].name, (newName) => {
        let finalName = newName.trim();
        if (!finalName.endsWith('.sol')) finalName += '.sol';
        files[index].name = finalName;
        files[index].isSaved = false; 
        localStorage.setItem(STORAGE_KEY, JSON.stringify(files));
        renderTabs();
    });
}

const themes = ['dark', 'white', 'sol-modern', 'sol-classic', 'galaxy'];
let currentThemeIndex = 0;

function toggleIDETheme() {
    currentThemeIndex = (currentThemeIndex + 1) % themes.length;
    const newTheme = themes[currentThemeIndex];
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('sol_ide_theme', newTheme);
    terminal.innerText += `\n✨ Tema alterado para: ${newTheme.toUpperCase()}\n`;
}

window.onload = () => {
    const savedTheme = localStorage.getItem('sol_ide_theme') || 'dark';
    currentThemeIndex = themes.indexOf(savedTheme);
    if (currentThemeIndex === -1) currentThemeIndex = 0;
    document.documentElement.setAttribute('data-theme', themes[currentThemeIndex]);
};

function saveCurrentFile() {
    files[activeIndex].isSaved = true;
    files[activeIndex].content = editor.getValue();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(files));
    renderTabs();
    terminal.innerText += `\n💾 Arquivo '${files[activeIndex].name}' salvo!\n`;
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
    a.href = url; a.download = currentFile.name; a.style.display = 'none';
    document.body.appendChild(a); a.click(); 
    document.body.removeChild(a); URL.revokeObjectURL(url);
    terminal.innerText += `\n📥 Projeto '${currentFile.name}' exportado!\n`;
}

function confirmDeleteTab(index) {
    const file = files[index];
    const overlay = document.createElement('div');
    overlay.style = `position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(5,5,8,0.8); backdrop-filter:blur(10px); display:flex; align-items:center; justify-content:center; z-index:9999;`;
    overlay.innerHTML = `
        <div style="background:rgba(20,20,30,0.9); border:1px solid #ff5f56; padding:35px; border-radius:20px; max-width:400px; text-align:center;">
            <p style="color:#fff; margin-bottom:25px;">Deseja apagar '${file.name}' permanentemente?</p>
            <div style="display:flex; gap:10px;">
                <button id="cancel-del" style="flex:1; padding:10px; border-radius:10px; border:1px solid #444; background:transparent; color:#ccc; cursor:pointer;">Cancelar</button>
                <button id="confirm-del" style="flex:1; padding:10px; border-radius:10px; border:none; background:#ff5f56; color:#fff; cursor:pointer; font-weight:bold;">Apagar</button>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);
    document.getElementById('cancel-del').onclick = () => document.body.removeChild(overlay);
    document.getElementById('confirm-del').onclick = () => {
        files.splice(index, 1);
        if (files.length === 0) files.push({ name: "script.sol", content: "", isSaved: true });
        activeIndex = Math.max(0, activeIndex - 1);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(files));
        switchTab(activeIndex);
        document.body.removeChild(overlay);
    };
}

editor.on("change", () => {
    if (isSwitchingTab) return; 
    const currentFile = files[activeIndex];
    const newContent = editor.getValue();
    if (currentFile.content !== newContent) {
        currentFile.content = newContent;
        if (currentFile.isSaved) { currentFile.isSaved = false; renderTabs(); }
    }
});

document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) { e.preventDefault(); saveCurrentFile(); }
});

isSwitchingTab = true;
editor.setValue(files[activeIndex].content);
isSwitchingTab = false;
renderTabs();

const sidebarOptionsList = document.querySelector('.sidebar-options');
if (sidebarOptionsList) {
    const guideItem = document.createElement('li');
    guideItem.innerHTML = '<span class="icon">📖</span> Guia da Linguagem';
    guideItem.style.color = '#00e5ff';
    guideItem.style.marginTop = '15px';
    guideItem.onclick = openGuideTab;
    sidebarOptionsList.appendChild(guideItem);
}

function openGuideTab() {
    const guideFileName = "Guia_da_Linguagem.sol";
    const existingIndex = files.findIndex(f => f.name === guideFileName);
    if (existingIndex !== -1) switchTab(existingIndex);
    else {
        files.push({ name: guideFileName, content: guideContent, isSaved: true });
        switchTab(files.length - 1);
    }
}

const fileInput = document.createElement('input');
fileInput.type = 'file'; fileInput.accept = '.sol'; fileInput.style.display = 'none';
document.body.appendChild(fileInput);
fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
        files.push({ name: file.name, content: event.target.result, isSaved: true });
        switchTab(files.length - 1);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(files));
    };
    reader.readAsText(file); fileInput.value = ''; 
});

const menuItems = document.querySelectorAll('.sidebar-options li');
menuItems.forEach(item => {
    const text = item.innerText;
    if (text.includes('Importar Projeto')) item.onclick = () => fileInput.click();
    if (text.includes('Novo Arquivo')) item.onclick = createNewFile;
    if (text.includes('Salvar Projeto')) item.onclick = saveCurrentFile;
    if (text.includes('Exportar Projeto')) item.onclick = exportCurrentFile;
    if (text.includes('Trocar Tema')) item.onclick = toggleIDETheme;
});

// Vetor global para manter as marcações de erro da IDE
let currentErrorMarks = [];

const btnCompile = document.getElementById("btn-compile");
btnCompile.addEventListener("click", async () => {
    const currentFile = files[activeIndex];
    const code = editor.getValue();
    terminal.innerText = "🚀 Iniciando compilação...\n";
    
    // Limpa os sublinhados vermelhos antigos antes de tentar compilar
    currentErrorMarks.forEach(mark => mark.clear());
    currentErrorMarks = [];

    try {
        const response = await fetch('/compile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: code, filename: currentFile.name })
        });
        const result = await response.json();
        terminal.innerText += result.logs;
        
        if (result.status === "success" && result.generatedWeb) {
            const blob = new Blob([result.generatedWeb], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url; a.download = `app_${currentFile.name.replace('.sol', '.html')}`; a.click();
            URL.revokeObjectURL(url);
            
        } else if (result.status === "error" && result.errorDetails && result.errorDetails.length > 0) {
            
            // Agora varre a LISTA INTEIRA de erros e desenha todos de uma vez
            result.errorDetails.forEach(err => {
                const lineIdx = err.line - 1; // CodeMirror usa index base 0
                
                const mark = editor.markText(
                    { line: lineIdx, ch: 0 }, 
                    { line: lineIdx, ch: 999 }, // Seleciona a linha toda
                    // Define o Title usando o tipo para que o desenvolvedor saiba diferenciar ao passar o rato (hover)
                    { className: 'error-underline', title: `[${err.type}] ${err.message}` } 
                );
                currentErrorMarks.push(mark);
            });
            
        }
    } catch (error) { terminal.innerText += "⚠️ Erro: " + error.message; }
});

// =========================================================
// LÓGICA DO TERMINAL INTERATIVO
// =========================================================
const terminalInput = document.getElementById("terminal-input");
if (terminalInput) {
    terminalInput.addEventListener("keydown", async (e) => {
        if (e.key === "Enter") {
            const comando = terminalInput.value.trim();
            if (!comando) return;
            
            terminalInput.value = "";
            
            // Dá feedback imediato na tela
            terminal.innerText += `\n$ ${comando}\n`;

            try {
                const response = await fetch('/terminal', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        command: comando, 
                        code: editor.getValue() 
                    })
                });
                
                const result = await response.json();
                
                // Responde baseado no backend
                if (result.action === 'clear') {
                    terminal.innerText = "Conexão com a base estabelecida.\nAguardando comandos...\n";
                } else if (result.action === 'print') {
                    terminal.innerText += result.output + "\n";
                }
                
                terminal.scrollTop = terminal.scrollHeight;
            } catch (error) {
                terminal.innerText += `⚠️ Erro de rede ao executar comando: ${error.message}\n`;
            }
        }
    });
}