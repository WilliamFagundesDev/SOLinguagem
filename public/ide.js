// =========================================================
// INJEÇÃO DE ESTILOS DINÂMICOS (ABAS, CURSOR E HIGHLIGHT DA LINGUAGEM)
// =========================================================
const dynamicStyles = document.createElement('style');
dynamicStyles.innerHTML = `
    /* Força a barrinha de digitação a aparecer com um brilho neon */
    .CodeMirror-cursor {
        border-left: 2px solid #00e5ff !important;
        box-shadow: 0 0 5px #00e5ff;
    }
    
    /* Cores personalizadas para os Tokens da SOLinguagem (Estilo VSCode) */
    .cm-s-nord .cm-keyword { color: #c678dd !important; font-weight: bold; text-shadow: 0 0 3px rgba(198, 120, 221, 0.4); } /* constelacao, orbita, etc */
    .cm-s-nord .cm-def { color: #e5c07b !important; font-weight: bold; } /* estrela, planeta */
    .cm-s-nord .cm-builtin { color: #61afef !important; } /* supernova */
    .cm-s-nord .cm-atom { color: #d19a66 !important; font-style: italic; } /* materia, antimateria */
    .cm-s-nord .cm-string { color: #98c379 !important; } /* Textos em aspas */
    .cm-s-nord .cm-number { color: #d19a66 !important; } /* Números */
    .cm-s-nord .cm-operator { color: #56b6c2 !important; } /* Operadores matemáticos */
    .cm-s-nord .cm-comment { color: #7f848e !important; font-style: italic; } /* Comentários */
    
    /* Organização das abas e botão de fechar */
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
// DEFINIÇÃO DO MODO CUSTOMIZADO DA SOLINGUAGEM NO CODEMIRROR
// =========================================================
CodeMirror.defineMode("solinguagem", function() {
    return {
        token: function(stream) {
            // Ignora espaços em branco
            if (stream.eatSpace()) return null;

            // Comentários de uma linha (//)
            if (stream.match("//")) {
                stream.skipToEnd();
                return "comment";
            }

            // Strings (Textos entre aspas duplas)
            if (stream.match(/^"[^"]*"/)) {
                return "string";
            }

            // Números
            if (stream.match(/^[0-9]+(\.[0-9]+)?/)) {
                return "number";
            }

            // Palavras e Tokens Especiais
            const match = stream.match(/^[a-zA-Z_][a-zA-Z0-9_]*/);
            if (match) {
                const word = match[0];
                
                // Nossos arrays de Tokens Temáticos
                const keywords = ['constelacao', 'orbita', 'eclipse', 'pulsar', 'buraco_negro'];
                const types = ['estrela', 'planeta'];
                const builtins = ['supernova'];
                const atoms = ['materia', 'antimateria'];

                // Classifica o Token retornado para o CSS colorir
                if (keywords.includes(word)) return "keyword";
                if (types.includes(word)) return "def";
                if (builtins.includes(word)) return "builtin";
                if (atoms.includes(word)) return "atom";
                
                // Variáveis comuns que o usuário criar
                return "variable";
            }

            // Operadores Matemáticos e Lógicos
            if (stream.match(/^[+\-*/=<>!&|]+/)) {
                return "operator";
            }
            
            // Qualquer outro caractere
            stream.next();
            return null;
        }
    };
});

// Código inicial temático focando no ESP32 e MQTT
const initialCode = `// ==== Configurações do Universo (Rede e MQTT) ====
planeta wifi_ssid = "Base_Estelar_WiFi";
planeta wifi_senha = "buraco_negro_123";

planeta broker_mqtt = "test.mosquitto.org";
planeta topico_sinal = "galaxia/esp32/comando";

// ==== Hardware do ESP32 ====
estrela pino_led = 2; // LED onboard do ESP32

// ==== Constelação principal de inicialização ====
constelacao iniciar_espaco() {
    supernova("Iniciando propulsores do ESP32...");
    // A linguagem fará o setup do WiFi e MQTT em C++ por trás dos panos
    supernova("Conectado ao Broker Estelar: " + broker_mqtt);
}

// ==== Reagindo aos comandos da Página Web ====
constelacao receber_sinal(mensagem) {
    orbita (mensagem == "LUZ") {
        // Envia energia para o pino 2
        pino_led = materia; // materia = true/HIGH
        supernova("Sinal da Web recebido: Emitindo luz!");
        
    } eclipse {
        // Corta a energia do pino 2
        pino_led = antimateria; // antimateria = false/LOW
        supernova("Sinal da Web recebido: Apagando luz.");
    }
}
`;

// Conteúdo do Guia da Linguagem
const guideContent = `// =========================================================
// 📖 GUIA OFICIAL DA SOLINGUAGEM
// =========================================================
// Bem-vindo ao manual da linguagem de programação mais
// brilhante do universo! Aqui você aprenderá como
// mapear as estrelas e programar seu ESP32 com facilidade.
//
// 1. ANÁLISE LÉXICA (TOKENS E PALAVRAS RESERVADAS)
// A linguagem ignora espaços em branco e utiliza palavras
// reservadas focadas na temática de galáxias e universo.
//
// ✦ Variáveis e Constantes
//   estrela: Define uma variável mutável (ex: let/var).
//   planeta: Define uma constante imutável (ex: const).
//
// ✦ Tipos de Dados (Átomos)
//   materia: Representa o valor Booleano Verdadeiro (True/HIGH).
//   antimateria: Representa o valor Booleano Falso (False/LOW).
//   Inteiros (1, 2, 3) e Strings ("texto") são suportados nativamente.
//
// ✦ Estruturas de Controle
//   orbita (condição) {}: Equivale à estrutura IF.
//   eclipse {}: Equivale à estrutura ELSE.
//   pulsar (condição) {}: Equivale ao laço de repetição WHILE.
//
// ✦ Funções e Rotinas
//   constelacao nome() {}: Define um novo bloco de função.
//   buraco_negro valor;: Retorna um valor da função (Return).
//
// ✦ Comandos Nativos (Built-ins)
//   supernova("texto"): Imprime no terminal / Console da nave.
//
// 2. EXPRESSÕES REGULARES (REGEX NO LEXER)
// O sistema reconhece os padrões em C++ / JS utilizando:
// - Strings: /"[^"]*"/
// - Números: /^[0-9]+(\\.[0-9]+)?/
// - Identificadores: /^[a-zA-Z_][a-zA-Z0-9_]*/
//
// 3. EXEMPLO PRÁTICO (Piscar LED)
//
estrela contador = 0;

constelacao piscar_led() {
    pulsar (contador < 5) {
        estrela_led = materia; // Liga
        supernova("Explosão estelar " + contador);
        contador = contador + 1;
    }
}
`;

// Inicializa o editor CodeMirror usando nosso novo modo customizado
const editor = CodeMirror.fromTextArea(document.getElementById("editor"), {
    lineNumbers: true,
    theme: "nord", 
    mode: "solinguagem", // <-- MODO EXCLUSIVO ATIVADO AQUI!
    indentUnit: 4
});

// =========================================================
// GERENCIAMENTO DE ESTADO E ABAS (LOCALSTORAGE)
// =========================================================

const STORAGE_KEY = 'sol_ide_files';
const terminal = document.getElementById("terminal");

// Tenta carregar os arquivos do LocalStorage, se não houver, carrega o padrão
let files = JSON.parse(localStorage.getItem(STORAGE_KEY));
if (!files || files.length === 0) {
    files = [
        { name: "missao_alpha.sol", content: initialCode, isSaved: true }
    ];
}

let activeIndex = 0;
let isSwitchingTab = false; // Previne que a troca de aba acione o evento de "change" do CodeMirror

const tabsContainer = document.querySelector('.file-tabs');
tabsContainer.style.overflowX = 'auto';
tabsContainer.style.overflowY = 'hidden';
tabsContainer.style.display = 'flex';
tabsContainer.style.whiteSpace = 'nowrap';

// Adiciona dinamicamente o botão do "Guia da Linguagem" na Sidebar do HTML
const sidebarOptionsList = document.querySelector('.sidebar-options');
if (sidebarOptionsList) {
    const guideItem = document.createElement('li');
    guideItem.innerHTML = '<span class="icon">📖</span> Guia da Linguagem';
    guideItem.className = 'menu-category-action'; // Uma classe custom para hover
    guideItem.style.color = '#00e5ff';
    guideItem.style.marginTop = '15px';
    
    guideItem.onclick = openGuideTab;
    sidebarOptionsList.appendChild(guideItem);
}

// Abre ou foca na aba do Guia da Linguagem
function openGuideTab() {
    const guideFileName = "Guia_da_Linguagem.sol";
    const existingIndex = files.findIndex(f => f.name === guideFileName);
    
    if (existingIndex !== -1) {
        // Se a aba já existe, apenas troca para ela
        switchTab(existingIndex);
    } else {
        // Se não existe, cria uma nova e preenche com o conteúdo
        files.push({ name: guideFileName, content: guideContent, isSaved: true });
        switchTab(files.length - 1);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(files));
    }
}

// Função para renderizar as abas na tela
function renderTabs() {
    tabsContainer.innerHTML = '';
    
    files.forEach((file, index) => {
        const tab = document.createElement('div');
        tab.className = `tab ${index === activeIndex ? 'active' : ''}`;
        
        // Texto da aba
        const tabText = document.createElement('span');
        tabText.innerText = file.name + (file.isSaved ? '' : ' *');
        tabText.title = "Duplo clique para renomear";
        tabText.style.cursor = 'pointer';
        
        // Eventos de clique apenas no texto
        tabText.onclick = (e) => {
            e.stopPropagation();
            switchTab(index);
        };
        tabText.ondblclick = (e) => {
            e.stopPropagation();
            renameTab(index);
        };

        // Botão de fechar aba (X)
        const closeBtn = document.createElement('span');
        closeBtn.className = 'close-tab';
        closeBtn.innerHTML = '&times;';
        closeBtn.title = "Apagar Constelação";
        closeBtn.onclick = (e) => {
            e.stopPropagation();
            confirmDeleteTab(index);
        };
        
        tab.appendChild(tabText);
        tab.appendChild(closeBtn);
        tabsContainer.appendChild(tab);
    });
}

// Muda a aba atual
function switchTab(index) {
    if (index < 0 || index >= files.length) return;
    
    activeIndex = index;
    isSwitchingTab = true;
    editor.setValue(files[activeIndex].content);
    isSwitchingTab = false;
    
    renderTabs();
}

// Renomeia um arquivo
function renameTab(index) {
    let newName = prompt("Renomear constelação (arquivo):", files[index].name);
    
    if (newName && newName.trim() !== "") {
        if (!newName.endsWith('.sol')) newName += '.sol';
        files[index].name = newName;
        files[index].isSaved = false; // Marcamos como não salvo pois o nome mudou
        renderTabs();
    }
}

// Salva o arquivo atual no LocalStorage
function saveCurrentFile() {
    files[activeIndex].isSaved = true;
    files[activeIndex].content = editor.getValue();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(files));
    renderTabs();
    
    terminal.innerText += `\n💾 Arquivo '${files[activeIndex].name}' salvo na memória da nave!\n`;
}

// Cria um novo arquivo em branco
function createNewFile() {
    const newName = `nova_orbita_${files.length + 1}.sol`;
    files.push({ name: newName, content: '', isSaved: false });
    switchTab(files.length - 1);
}

// =========================================================
// MODAL BONITINHO DE CONFIRMAÇÃO (ESTILO APPLE/GLASS)
// =========================================================

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
    btnConfirm.innerText = 'Apagar Constelação';
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

    // Ativa as animações de entrada
    requestAnimationFrame(() => {
        overlay.style.opacity = '1';
        box.style.transform = 'scale(1)';
    });
}

function confirmDeleteTab(index) {
    const file = files[index];
    showCustomConfirm(
        `⚠️ Alerta Crítico: Você está prestes a apagar a constelação '${file.name}'. Esta ação destruirá os dados permanentemente. Deseja prosseguir?`, 
        () => {
            files.splice(index, 1);
            
            // Se fechou tudo, cria um arquivo em branco
            if (files.length === 0) {
                files.push({ name: "nova_orbita.sol", content: "", isSaved: true });
                activeIndex = 0;
            } else if (activeIndex >= index) {
                // Ajusta o index ativo para não quebrar a lógica
                activeIndex = Math.max(0, activeIndex - 1);
            }
            
            localStorage.setItem(STORAGE_KEY, JSON.stringify(files));
            
            isSwitchingTab = true;
            editor.setValue(files[activeIndex].content);
            isSwitchingTab = false;
            
            renderTabs();
            terminal.innerText += `\n🗑️ Arquivo apagado da memória da nave.\n`;
        }
    );
}

// Detecta mudanças no editor para colocar o asterisco
editor.on("change", () => {
    if (isSwitchingTab) return; // Ignora se a mudança foi só uma troca de aba
    
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

// Atalho Ctrl+S para salvar
document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        saveCurrentFile();
    }
});

// Inicialização da primeira renderização
isSwitchingTab = true;
editor.setValue(files[activeIndex].content);
isSwitchingTab = false;
renderTabs();

// =========================================================
// LÓGICA PARA RECEBER/ABRIR ARQUIVOS .SOL
// =========================================================

const fileInput = document.createElement('input');
fileInput.type = 'file';
fileInput.accept = '.sol';
fileInput.style.display = 'none';
document.body.appendChild(fileInput);

fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.sol')) {
        terminal.innerText += `\n⚠️ Atenção: Formato não reconhecido! Apenas arquivos .sol podem ser lidos por esta IDE.\n`;
        return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
        const content = event.target.result;
        
        // Adiciona como uma nova aba
        files.push({ name: file.name, content: content, isSaved: true });
        switchTab(files.length - 1);
        
        // Salva automaticamente no LocalStorage o novo arquivo aberto
        localStorage.setItem(STORAGE_KEY, JSON.stringify(files));

        terminal.innerText += `\n✨ Constelação '${file.name}' lida e anexada às abas!\n`;
    };
    reader.readAsText(file);
    fileInput.value = ''; 
});

// Associa os botões do Menu Lateral
const menuItems = document.querySelectorAll('.sidebar-options li');
menuItems.forEach(item => {
    // ABRIR
    if (item.innerText.includes('Abrir') || item.innerText.includes('Abrir Constelação') || item.innerText.includes('Abrir Projeto')) {
        item.addEventListener('click', () => { fileInput.click(); });
    }
    // NOVO
    if (item.innerText.includes('Novo Arquivo')) {
        item.addEventListener('click', createNewFile);
    }
    // SALVAR
    if (item.innerText.includes('Salvar Projeto') || item.innerText.includes('Salvar Constelação')) {
        item.addEventListener('click', saveCurrentFile);
    }
});

// =========================================================
// LÓGICA DE COMPILAÇÃO
// =========================================================

const btnCompile = document.getElementById("btn-compile");

btnCompile.addEventListener("click", async () => {
    const currentFile = files[activeIndex];
    const code = editor.getValue();
    
    terminal.innerText = "🚀 Iniciando motores de dobra...\n";
    terminal.innerText += `📦 Empacotando a constelação atual: [ ${currentFile.name} ]\n\n`;

    try {
        const response = await fetch('/compile', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ code: code, filename: currentFile.name })
        });

        const result = await response.json();
        
        terminal.innerText += `Status da Missão: ${result.status.toUpperCase()}\n`;
        terminal.innerText += `-------------------------------------------\n`;
        terminal.innerText += result.logs;
        
        if (result.status === "success") {
            terminal.innerText += `\n✅ Processo finalizado! O binário gerado reflete seu arquivo original: compilado_${currentFile.name.replace('.sol', '.bin')}\n`;
        }

    } catch (error) {
        terminal.innerText += "⚠️ Falha de comunicação com a base: " + error.message;
    }
});