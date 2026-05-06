export const themes = ['dark', 'white', 'sol-modern', 'sol-classic', 'galaxy'];
export let currentThemeIndex = 0;

export function injectStyles() {
    const dynamicStyles = document.createElement('style');
    dynamicStyles.innerHTML = `
        .CodeMirror-cursor { border-left: 2px solid var(--accent-glow, #00e5ff) !important; box-shadow: 0 0 5px var(--accent-glow, #00e5ff); }
        .cm-s-nord .cm-keyword { color: #c678dd !important; font-weight: bold; text-shadow: 0 0 3px rgba(198, 120, 221, 0.4); } 
        .cm-s-nord .cm-def { color: #e5c07b !important; font-weight: bold; } 
        .cm-s-nord .cm-builtin { color: #61afef !important; font-weight: bold;} 
        .cm-s-nord .cm-atom { color: #d19a66 !important; font-style: italic; } 
        .cm-s-nord .cm-string { color: #98c379 !important; } 
        .cm-s-nord .cm-number { color: #d19a66 !important; } 
        .cm-s-nord .cm-operator { color: #56b6c2 !important; } 
        .cm-s-nord .cm-comment { color: #7f848e !important; font-style: italic; } 
        .cm-s-nord .cm-property { color: #ffaa00 !important; font-style: italic; font-weight: bold; }
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
        .context-menu-divider { height: 1px; background: rgba(255,255,255,0.1); margin: 5px 0; }

        .error-underline { text-decoration: underline wavy #ff5f56; background-color: rgba(255, 95, 86, 0.15); }

        .vscode-search-box {
            position: absolute; top: 15px; right: 35px; background: rgba(20, 20, 30, 0.95); border: 1px solid var(--accent-glow);
            padding: 6px 12px; border-radius: 8px; display: flex; align-items: center; gap: 10px; z-index: 1000;
            box-shadow: 0 10px 25px rgba(0,0,0,0.5); backdrop-filter: blur(15px); transform: translateY(-10px);
            opacity: 0; transition: all 0.3s ease; pointer-events: none;
        }
        .vscode-search-box.visible { transform: translateY(0); opacity: 1; pointer-events: auto; }
        .vscode-search-box input {
            background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); border-radius: 4px; color: #fff;
            outline: none; font-family: var(--font-mono); padding: 5px 8px; width: 180px; font-size: 13px; transition: border-color 0.2s;
        }
        .vscode-search-box input:focus { border-color: var(--accent-glow); }
        .search-count { font-size: 12px; color: #aaa; min-width: 50px; text-align: center; font-family: var(--font-mono); }
        .search-btn { background: transparent; border: none; color: #aaa; cursor: pointer; padding: 4px 6px; border-radius: 4px; font-size: 14px; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
        .search-btn:hover { background: rgba(255,255,255,0.1); color: #fff; }
        .search-btn.close { color: #ff5f56; }
        .search-btn.close:hover { background: rgba(255, 95, 86, 0.2); }
        .search-highlight { background-color: rgba(255, 255, 0, 0.3); }
        .search-highlight-active { background-color: rgba(255, 165, 0, 0.7); color: #fff !important; font-weight: bold; border-radius: 2px;}
    `;
    document.head.appendChild(dynamicStyles);
}

export function toggleIDETheme(terminal) {
    currentThemeIndex = (currentThemeIndex + 1) % themes.length;
    const newTheme = themes[currentThemeIndex];
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('sol_ide_theme', newTheme);
    if(terminal) terminal.innerText += `\n✨ Tema alterado para: ${newTheme.toUpperCase()}\n`;
}

export function initTheme() {
    const savedTheme = localStorage.getItem('sol_ide_theme') || 'dark';
    currentThemeIndex = themes.indexOf(savedTheme);
    if (currentThemeIndex === -1) currentThemeIndex = 0;
    document.documentElement.setAttribute('data-theme', themes[currentThemeIndex]);
}
