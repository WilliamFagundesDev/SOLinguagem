import { state } from './state.js';

export function initSearchBox() {
    const searchBox = document.createElement('div');
    searchBox.className = 'vscode-search-box';
    searchBox.innerHTML = `
        <input type="text" id="search-input" placeholder="Pesquisar..." autocomplete="off"/>
        <span id="search-count" class="search-count">0 de 0</span>
        <button id="search-prev" class="search-btn" title="Anterior (Shift+Enter)">↑</button>
        <button id="search-next" class="search-btn" title="Próximo (Enter)">↓</button>
        <button id="search-close" class="search-btn close" title="Fechar (Esc)">✕</button>
    `;
    document.querySelector('.editor-container').appendChild(searchBox);

    const searchInput = document.getElementById('search-input');
    const searchCount = document.getElementById('search-count');

    function clearSearch() {
        state.searchMarks.forEach(m => m.clear());
        state.searchMarks = [];
        state.searchMatches = [];
        state.currentSearchIndex = -1;
        searchCount.innerText = '0 de 0';
    }

    function performSearch(query) {
        clearSearch();
        if (!query) return;

        const content = state.editor.getValue();
        const safeQuery = query.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
        const regex = new RegExp(safeQuery, 'gi');
        let match;

        while ((match = regex.exec(content)) !== null) {
            const from = state.editor.posFromIndex(match.index);
            const to = state.editor.posFromIndex(match.index + match[0].length);
            state.searchMatches.push({from, to});
            const mark = state.editor.markText(from, to, {className: 'search-highlight'});
            state.searchMarks.push(mark);
        }

        if (state.searchMatches.length > 0) {
            focusSearchMatch(0);
        } else {
            searchCount.innerText = '0 de 0';
        }
    }

    function focusSearchMatch(index) {
        if (state.searchMatches.length === 0) return;
        state.searchMarks.forEach(m => { if(m.className !== 'search-highlight') m.clear(); });
        
        state.currentSearchIndex = (index + state.searchMatches.length) % state.searchMatches.length;
        searchCount.innerText = `${state.currentSearchIndex + 1} de ${state.searchMatches.length}`;

        const match = state.searchMatches[state.currentSearchIndex];
        state.editor.scrollIntoView({from: match.from, to: match.to}, 100);
        
        state.searchMarks[state.currentSearchIndex].clear();
        state.searchMarks[state.currentSearchIndex] = state.editor.markText(match.from, match.to, {className: 'search-highlight-active'});
    }

    function toggleSearchBox() {
        if (searchBox.classList.contains('visible')) {
            searchBox.classList.remove('visible');
            clearSearch();
            state.editor.focus();
        } else {
            searchBox.classList.add('visible');
            searchInput.focus();
            if(state.editor.somethingSelected()) searchInput.value = state.editor.getSelection();
            performSearch(searchInput.value);
        }
    }

    searchInput.addEventListener('input', (e) => performSearch(e.target.value));
    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            if (e.shiftKey) focusSearchMatch(state.currentSearchIndex - 1);
            else focusSearchMatch(state.currentSearchIndex + 1);
        }
        if (e.key === 'Escape') toggleSearchBox();
    });

    document.getElementById('search-next').onclick = () => focusSearchMatch(state.currentSearchIndex + 1);
    document.getElementById('search-prev').onclick = () => focusSearchMatch(state.currentSearchIndex - 1);
    document.getElementById('search-close').onclick = toggleSearchBox;

    // Refaz pesquisa ao trocar de aba se a caixa estiver aberta
    document.addEventListener('tabSwitched', () => {
        if (searchBox.classList.contains('visible')) performSearch(searchInput.value);
    });

    return toggleSearchBox;
}
