import { state } from './state.js';
import { injectStyles, initTheme, toggleIDETheme } from './theme.js';
import { setupLanguage } from './language.js';
import { initSearchBox } from './search.js';
import { loadFiles, renderTabs, saveCurrentFile, createNewFile, exportCurrentFile, openGuideTab, loadFromFile } from './tabs.js';
import { setupEditorContextMenu } from './editorMenu.js';
import { setupTerminalAndCompiler } from './terminal.js';

// 1. Estilos Básicos
injectStyles();

// 2. Setup do Léxico no CodeMirror
setupLanguage(window.CodeMirror);

// 3. Inicializar Estado Global e Arquivos
state.terminal = document.getElementById("terminal");
loadFiles();

// 4. Instanciar Editor CodeMirror e Caixa de Pesquisa
const toggleSearchBox = initSearchBox();
state.editor = window.CodeMirror.fromTextArea(document.getElementById("editor"), {
    lineNumbers: true, 
    theme: "nord", 
    mode: "solinguagem", 
    indentUnit: 4, 
    matchBrackets: true,
    extraKeys: {
        "Ctrl-F": function() { toggleSearchBox(); },
        "Cmd-F": function() { toggleSearchBox(); }
    }
});

// 5. Interface Gráfica, Temas e Menus de Contexto
initTheme();
setupEditorContextMenu();

// 6. Atualização de Conteúdo do Editor (Auto-sync memory)
state.editor.on("change", () => {
    if (state.isSwitchingTab) return; 
    const currentFile = state.files[state.activeIndex];
    const newContent = state.editor.getValue();
    if (currentFile.content !== newContent) {
        currentFile.content = newContent;
        if (currentFile.isSaved) { currentFile.isSaved = false; renderTabs(); }
    }
});

// 7. Atalhos de Teclado Globais (Ctrl+S)
document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) { 
        e.preventDefault(); 
        saveCurrentFile(); 
    }
});

// 8. Injetar o Conteúdo da Aba Ativa na Primeira Carga
state.isSwitchingTab = true;
state.editor.setValue(state.files[state.activeIndex].content);
state.isSwitchingTab = false;
renderTabs();

// 9. Handlers do Menu Lateral (Sidebar)
const sidebarOptionsList = document.querySelector('.sidebar-options');
if (sidebarOptionsList) {
    const guideItem = document.createElement('li');
    guideItem.innerHTML = '<span class="icon">📖</span> Guia da Linguagem';
    guideItem.style.color = '#00e5ff';
    guideItem.style.marginTop = '15px';
    guideItem.onclick = openGuideTab;
    sidebarOptionsList.appendChild(guideItem);
}

const menuItems = document.querySelectorAll('.sidebar-options li');
menuItems.forEach(item => {
    const text = item.innerText;
    if (text.includes('Importar Projeto')) item.onclick = loadFromFile;
    if (text.includes('Novo Arquivo')) item.onclick = createNewFile;
    if (text.includes('Salvar Projeto')) item.onclick = saveCurrentFile;
    if (text.includes('Exportar Projeto')) item.onclick = exportCurrentFile;
    if (text.includes('Trocar Tema')) item.onclick = () => toggleIDETheme(state.terminal);
});

// 10. Conectar Terminal e Sistema de Compilação Web/ESP
setupTerminalAndCompiler();