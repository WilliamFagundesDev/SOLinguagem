import { state } from './state.js';
import { showCustomPrompt } from './utils.js';
import { initialCode, guideContent } from './language.js';

const contextMenu = document.createElement('div');
contextMenu.className = 'custom-context-menu';
document.body.appendChild(contextMenu);
document.addEventListener('click', () => { contextMenu.style.display = 'none'; });

export function loadFiles() {
    let files = JSON.parse(localStorage.getItem(state.STORAGE_KEY));
    if (!files || files.length === 0) {
        files = [{ name: "app.sol", content: initialCode, isSaved: true }];
    }
    state.files = files;
}

export function renderTabs() {
    const tabsContainer = document.querySelector('.file-tabs');
    tabsContainer.innerHTML = '';
    state.files.forEach((file, index) => {
        const tab = document.createElement('div');
        tab.className = `tab ${index === state.activeIndex ? 'active' : ''}`;
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
        <div class="context-menu-divider"></div>
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
                if (action === 'save') { switchTab(index); saveCurrentFile(); }
                if (action === 'rename') renameTab(index);
                if (action === 'export') { switchTab(index); setTimeout(exportCurrentFile, 100); }
                if (action === 'delete') confirmDeleteTab(index);
            }, 10);
        };
    });
}

export function switchTab(index) {
    if (index < 0 || index >= state.files.length) return;
    state.activeIndex = index;
    state.isSwitchingTab = true;
    state.editor.setValue(state.files[state.activeIndex].content);
    state.isSwitchingTab = false;
    renderTabs();
    document.dispatchEvent(new CustomEvent('tabSwitched'));
}

export function saveCurrentFile() {
    state.files[state.activeIndex].isSaved = true;
    state.files[state.activeIndex].content = state.editor.getValue();
    localStorage.setItem(state.STORAGE_KEY, JSON.stringify(state.files));
    renderTabs();
    if(state.terminal) state.terminal.innerText += `\n💾 Arquivo '${state.files[state.activeIndex].name}' salvo!\n`;
}

export function createNewFile() {
    const newName = `script_${state.files.length + 1}.sol`;
    state.files.push({ name: newName, content: '', isSaved: false });
    switchTab(state.files.length - 1);
}

export function renameTab(index) {
    showCustomPrompt("Novo nome para o ficheiro:", state.files[index].name, (newName) => {
        let finalName = newName.trim();
        if (!finalName.endsWith('.sol')) finalName += '.sol';
        state.files[index].name = finalName;
        state.files[index].isSaved = false; 
        localStorage.setItem(state.STORAGE_KEY, JSON.stringify(state.files));
        renderTabs();
    });
}

export function confirmDeleteTab(index) {
    const file = state.files[index];
    showCustomPrompt(`Deseja apagar '${file.name}' permanentemente? (Digite 'sim' para confirmar)`, '', (res) => {
        if(res.toLowerCase() === 'sim') {
            state.files.splice(index, 1);
            if (state.files.length === 0) state.files.push({ name: "script.sol", content: "", isSaved: true });
            state.activeIndex = Math.max(0, state.activeIndex - 1);
            localStorage.setItem(state.STORAGE_KEY, JSON.stringify(state.files));
            switchTab(state.activeIndex);
        }
    });
}

export function exportCurrentFile() {
    const currentFile = state.files[state.activeIndex];
    const content = state.editor.getValue(); 
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = currentFile.name; a.style.display = 'none';
    document.body.appendChild(a); a.click(); 
    document.body.removeChild(a); URL.revokeObjectURL(url);
    if(state.terminal) state.terminal.innerText += `\n📥 Projeto '${currentFile.name}' exportado!\n`;
}

export function openGuideTab() {
    const guideFileName = "Guia_da_Linguagem.sol";
    const existingIndex = state.files.findIndex(f => f.name === guideFileName);
    if (existingIndex !== -1) switchTab(existingIndex);
    else {
        state.files.push({ name: guideFileName, content: guideContent, isSaved: true });
        switchTab(state.files.length - 1);
    }
}

export function loadFromFile() {
    const fileInput = document.createElement('input');
    fileInput.type = 'file'; fileInput.accept = '.sol'; fileInput.style.display = 'none';
    document.body.appendChild(fileInput);
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0]; if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            state.files.push({ name: file.name, content: event.target.result, isSaved: true });
            switchTab(state.files.length - 1);
            localStorage.setItem(state.STORAGE_KEY, JSON.stringify(state.files));
        };
        reader.readAsText(file); document.body.removeChild(fileInput);
    });
    fileInput.click();
}
