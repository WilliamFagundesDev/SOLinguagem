const { app, BrowserWindow, screen } = require('electron');
const path = require('path');

// Inicializa o seu servidor Express junto com o aplicativo
require('./server.js');

let mainWindow;

function createWindow() {
    // Obtém as dimensões exatas do monitor principal do usuário
    const primaryDisplay = screen.getPrimaryDisplay();
    const { width, height } = primaryDisplay.bounds;

    // Cria a janela usando a largura e altura detectadas
    mainWindow = new BrowserWindow({
        width: width,
        height: height,
        title: "SOL IDE",
        autoHideMenuBar: true, // Esconde a barra de menu padrão do Windows/Linux
        icon: path.join(__dirname, 'icon.png'), // Aqui entra o seu ÍCONE!
        webPreferences: {
            nodeIntegration: true
        }
    });

    // Força a janela a iniciar maximizada para preencher perfeitamente a tela,
    // respeitando a barra de tarefas do sistema operacional.
    mainWindow.maximize();

    // Carrega o servidor local que o seu server.js acabou de subir
    mainWindow.loadURL('http://localhost:3000');

    // Evento disparado quando a janela é fechada
    mainWindow.on('closed', function () {
        mainWindow = null;
    });
}

// Quando o Electron terminar a inicialização, crie a janela
app.whenReady().then(() => {
    createWindow();

    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

// Encerra a aplicação quando todas as janelas forem fechadas
app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit();
});