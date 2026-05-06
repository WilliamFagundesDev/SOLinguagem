import { state } from './state.js';
import { showCustomPrompt } from './utils.js';

export function setupEditorContextMenu() {
    const editorContextMenu = document.createElement('div');
    editorContextMenu.className = 'custom-context-menu';
    editorContextMenu.innerHTML = `
        <div class="context-menu-item" id="ctx-select-all"><span class="icon">🔍</span> Selecionar Todos</div>
        <div class="context-menu-item" id="ctx-replace-all"><span class="icon">✏️</span> Substituir Todos</div>
        <div class="context-menu-divider"></div>
        <div class="context-menu-item danger" id="ctx-delete-all"><span class="icon">🗑️</span> Apagar Todos</div>
        <div class="context-menu-divider"></div>
        <div class="context-menu-item" id="ctx-copy"><span class="icon">📋</span> Copiar</div>
        <div class="context-menu-item" id="ctx-cut"><span class="icon">✂️</span> Recortar</div>
    `;
    document.body.appendChild(editorContextMenu);

    state.editor.getWrapperElement().addEventListener('contextmenu', (e) => {
        if (state.editor.somethingSelected()) {
            e.preventDefault(); e.stopPropagation();
            editorContextMenu.style.display = 'block';
            editorContextMenu.style.left = e.clientX + 'px';
            editorContextMenu.style.top = e.clientY + 'px';
        }
    });

    document.getElementById('ctx-select-all').onclick = () => {
        const textToFind = state.editor.getSelection();
        if (!textToFind) return;
        const content = state.editor.getValue();
        const safeQuery = textToFind.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
        const regex = new RegExp(safeQuery, 'g');
        let match;
        const selections = [];
        while ((match = regex.exec(content)) !== null) {
            selections.push({
                anchor: state.editor.posFromIndex(match.index),
                head: state.editor.posFromIndex(match.index + textToFind.length)
            });
        }
        if (selections.length > 0) { state.editor.setSelections(selections); state.editor.focus(); }
    };

    document.getElementById('ctx-replace-all').onclick = () => {
        const textToReplace = state.editor.getSelection();
        if (!textToReplace) return;
        showCustomPrompt(`Substituir todas as instâncias de "${textToReplace}" por:`, textToReplace, (newText) => {
            document.getElementById('ctx-select-all').click(); 
            state.editor.replaceSelections(Array(state.editor.listSelections().length).fill(newText));
            state.editor.setCursor(state.editor.getCursor()); 
        });
    };

    document.getElementById('ctx-delete-all').onclick = () => {
        const textToReplace = state.editor.getSelection();
        if (!textToReplace) return;
        document.getElementById('ctx-select-all').click();
        state.editor.replaceSelections(Array(state.editor.listSelections().length).fill(""));
        state.editor.setCursor(state.editor.getCursor());
        if(state.terminal) state.terminal.innerText += `\n> 🗑️ Todas as ocorrências de "${textToReplace}" foram apagadas.\n`;
    };

    document.getElementById('ctx-copy').onclick = () => navigator.clipboard.writeText(state.editor.getSelection());
    document.getElementById('ctx-cut').onclick = () => { navigator.clipboard.writeText(state.editor.getSelection()); state.editor.replaceSelection(""); };

    document.addEventListener('click', () => { editorContextMenu.style.display = 'none'; });
}
