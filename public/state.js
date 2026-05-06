// Gerenciamento de Estado Global
export const state = {
    files: [],
    activeIndex: 0,
    isSwitchingTab: false,
    editor: null,
    terminal: null,
    STORAGE_KEY: 'sol_ide_files',
    currentErrorMarks: [],
    searchMarks: [],
    searchMatches: [],
    currentSearchIndex: -1
};