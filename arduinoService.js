// =========================================================
// SERVIÇO ARDUINO CLI - compilar, listar placas e enviar
// =========================================================
// Requer o Arduino CLI instalado. Se o PATH do Windows/Electron não enxergar
// o comando, use no terminal da SOL IDE:
// arduino-caminho C:\\caminho\\para\\arduino-cli.exe

const fs = require('fs');
const path = require('path');
const { execFile } = require('child_process');

// Alvo padrão: Arduino Uno.
// Para Nano, você pode usar SOL_ARDUINO_FQBN=arduino:avr:nano no ambiente.
const DEFAULT_FQBN = process.env.SOL_ARDUINO_FQBN || 'arduino:avr:uno';
const ARDUINO_AVR_CORE = 'arduino:avr';
const ESP32_PACKAGE_URL = 'https://espressif.github.io/arduino-esp32/package_esp32_index.json';
const CONFIG_PATH = path.join(__dirname, '.sol-config.json');

function readConfig() {
    try {
        if (!fs.existsSync(CONFIG_PATH)) return {};
        return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8')) || {};
    } catch (_) {
        return {};
    }
}

function writeConfig(config) {
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf8');
}

function cleanCliPath(value = '') {
    return String(value)
        .trim()
        .replace(/^['"]/, '')
        .replace(/['"]$/, '');
}

function fileExists(filePath) {
    try {
        return !!filePath && fs.existsSync(filePath) && fs.statSync(filePath).isFile();
    } catch (_) {
        return false;
    }
}

function dirExists(dirPath) {
    try {
        return !!dirPath && fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory();
    } catch (_) {
        return false;
    }
}

function findInDirectoryTree(rootDir, fileName, maxDepth = 5) {
    const results = [];
    const seen = new Set();

    function walk(current, depth) {
        if (depth > maxDepth || results.length >= 20 || !dirExists(current)) return;
        let entries = [];
        try {
            entries = fs.readdirSync(current, { withFileTypes: true });
        } catch (_) {
            return;
        }

        for (const entry of entries) {
            const full = path.join(current, entry.name);
            if (seen.has(full)) continue;
            seen.add(full);

            if (entry.isFile() && entry.name.toLowerCase() === fileName.toLowerCase()) {
                results.push(full);
                if (results.length >= 20) return;
            }
        }

        for (const entry of entries) {
            if (results.length >= 20) return;
            if (!entry.isDirectory()) continue;
            const name = entry.name.toLowerCase();
            // Evita pastas gigantes que não costumam conter o executável.
            if (['node_modules', '.git', 'appdata\\local\\temp'].includes(name)) continue;
            walk(path.join(current, entry.name), depth + 1);
        }
    }

    walk(rootDir, 0);
    return results;
}

function getConfiguredArduinoCliPath() {
    const config = readConfig();
    return cleanCliPath(process.env.ARDUINO_CLI_PATH || config.arduinoCliPath || '');
}

function getArduinoCliCommand() {
    return getConfiguredArduinoCliPath() || 'arduino-cli';
}

function getCandidateArduinoCliPaths() {
    const candidates = [];
    const configured = getConfiguredArduinoCliPath();

    if (configured) candidates.push(configured);
    candidates.push('arduino-cli');
    candidates.push('arduino-cli.exe');

    if (process.platform === 'win32') {
        const programFiles = [
            process.env.ProgramFiles,
            process.env['ProgramFiles(x86)'],
            process.env.LOCALAPPDATA,
            process.env.USERPROFILE,
        ].filter(Boolean);

        for (const base of programFiles) {
            candidates.push(path.join(base, 'Arduino CLI', 'arduino-cli.exe'));
            candidates.push(path.join(base, 'Arduino', 'arduino-cli.exe'));
            candidates.push(path.join(base, 'Arduino15', 'arduino-cli.exe'));
            candidates.push(path.join(base, 'Microsoft', 'WinGet', 'Packages', 'ArduinoSA.CLI_Microsoft.Winget.Source_8wekyb3d8bbwe', 'arduino-cli.exe'));
        }

        // Procura em locais comuns do winget/instalador sem varrer o disco inteiro.
        const searchRoots = [
            process.env.LOCALAPPDATA && path.join(process.env.LOCALAPPDATA, 'Microsoft', 'WinGet', 'Packages'),
            process.env.LOCALAPPDATA && path.join(process.env.LOCALAPPDATA, 'Programs'),
            process.env.ProgramFiles,
            process.env['ProgramFiles(x86)'],
        ].filter(Boolean);

        for (const root of searchRoots) {
            if (dirExists(root)) {
                candidates.push(...findInDirectoryTree(root, 'arduino-cli.exe', 4));
            }
        }
    }

    return [...new Set(candidates.filter(Boolean).map(cleanCliPath))];
}

function runFile(command, args, options = {}) {
    return new Promise((resolve) => {
        execFile(command, args, {
            cwd: options.cwd || process.cwd(),
            timeout: options.timeout || 120000,
            maxBuffer: 1024 * 1024 * 20,
            windowsHide: true
        }, (error, stdout, stderr) => {
            resolve({
                ok: !error,
                code: error && typeof error.code !== 'undefined' ? error.code : 0,
                stdout: stdout || '',
                stderr: stderr || '',
                command: `${command} ${args.join(' ')}`,
                errorMessage: error ? error.message : ''
            });
        });
    });
}

async function runArduinoCli(args, options = {}) {
    const command = options.cliPath || getArduinoCliCommand();
    return runFile(command, args, options);
}

async function autoFindWorkingArduinoCli() {
    const attempts = [];
    for (const candidate of getCandidateArduinoCliPaths()) {
        const result = await runFile(candidate, ['version'], { timeout: 15000 });
        attempts.push({ candidate, ok: result.ok, errorMessage: result.errorMessage, stdout: result.stdout, stderr: result.stderr });
        if (result.ok) {
            const config = readConfig();
            config.arduinoCliPath = candidate;
            writeConfig(config);
            return { ok: true, cliPath: candidate, result, attempts };
        }
    }
    return { ok: false, attempts };
}

function sanitizeSketchName(name = 'SolSketch') {
    const base = String(name)
        .replace(/\.[^.]+$/, '')
        .replace(/[^a-zA-Z0-9_]/g, '_')
        .replace(/^\d/, '_$&')
        .slice(0, 48);
    return base || 'SolSketch';
}

function createSketchFolder(generatedCpp, filename = 'SolSketch.sol') {
    const sketchName = sanitizeSketchName(filename);
    const buildRoot = path.join(__dirname, '.sol-build');
    const sketchDir = path.join(buildRoot, sketchName);
    const inoPath = path.join(sketchDir, `${sketchName}.ino`);

    fs.mkdirSync(sketchDir, { recursive: true });
    fs.writeFileSync(inoPath, generatedCpp, 'utf8');

    return { sketchName, sketchDir, inoPath };
}

function formatResult(title, result) {
    let output = `\n===== ${title} =====\n`;
    output += `$ ${result.command}\n`;
    if (result.stdout.trim()) output += `${result.stdout.trim()}\n`;
    if (result.stderr.trim()) output += `${result.stderr.trim()}\n`;
    if (!result.ok) output += `❌ Falhou: ${result.errorMessage}\n`;
    return output;
}

async function checkArduinoCli() {
    let result = await runArduinoCli(['version'], { timeout: 15000 });
    if (result.ok) {
        return { ok: true, logs: formatResult('ARDUINO CLI', result) };
    }

    const firstError = result.errorMessage;
    const found = await autoFindWorkingArduinoCli();
    if (found.ok) {
        return {
            ok: true,
            logs:
`⚠️ O comando padrão não funcionou, mas encontrei o Arduino CLI automaticamente.\n` +
`✅ Caminho salvo: ${found.cliPath}\n` +
formatResult('ARDUINO CLI', found.result)
        };
    }

    const configured = getConfiguredArduinoCliPath();
    const tried = found.attempts.map(a => `- ${a.candidate}: ${a.ok ? 'OK' : a.errorMessage}`).join('\n');

    return {
        ok: false,
        logs:
`❌ Arduino CLI não foi encontrado pelo Node/Electron.\n\n` +
`O Windows pode reconhecer no PowerShell, mas o app não enxergar o mesmo PATH.\n\n` +
`Caminho configurado atualmente: ${configured || '(nenhum)'}\n` +
`Erro inicial: ${firstError}\n\n` +
`Tentativas feitas:\n${tried || '(nenhuma)'}\n\n` +
`✅ Solução mais garantida:\n` +
`1) No PowerShell, rode: where.exe arduino-cli\n` +
`2) Copie o caminho completo que aparecer, por exemplo C:\\...\\arduino-cli.exe\n` +
`3) Aqui na SOL IDE, rode:\n` +
`   arduino-caminho C:\\caminho\\completo\\arduino-cli.exe\n`
    };
}

async function setArduinoCliPath(cliPath) {
    const cleaned = cleanCliPath(cliPath);
    if (!cleaned) {
        return { ok: false, logs: '❌ Informe o caminho. Exemplo: arduino-caminho C:\\Users\\SeuNome\\...\\arduino-cli.exe\n' };
    }

    if (process.platform === 'win32' && !cleaned.toLowerCase().endsWith('.exe')) {
        return { ok: false, logs: '❌ No Windows, o caminho deve terminar em arduino-cli.exe\n' };
    }

    if (!fileExists(cleaned)) {
        return {
            ok: false,
            logs:
`❌ Não encontrei esse arquivo:\n${cleaned}\n\n` +
`Dica: no PowerShell rode:\nwhere.exe arduino-cli\n\n` +
`Depois use exatamente o caminho que aparecer.`
        };
    }

    const result = await runFile(cleaned, ['version'], { timeout: 15000 });
    if (!result.ok) {
        return {
            ok: false,
            logs:
`❌ Encontrei o arquivo, mas ele não executou como Arduino CLI.\n` +
formatResult('TESTE DO CAMINHO', result)
        };
    }

    const config = readConfig();
    config.arduinoCliPath = cleaned;
    writeConfig(config);

    return {
        ok: true,
        logs:
`✅ Caminho do Arduino CLI salvo com sucesso:\n${cleaned}\n` +
formatResult('ARDUINO CLI', result) +
`\nAgora tente: configurar-esp32\n`
    };
}

async function diagnoseArduinoCli() {
    const configured = getConfiguredArduinoCliPath();
    const candidates = getCandidateArduinoCliPaths();
    let logs = '';

    logs += '===== DIAGNÓSTICO ARDUINO CLI =====\n';
    logs += `Sistema: ${process.platform}\n`;
    logs += `Node está usando este PATH:\n${process.env.PATH || '(PATH vazio)'}\n\n`;
    logs += `Caminho configurado na SOL IDE: ${configured || '(nenhum)'}\n\n`;
    logs += 'Testando candidatos:\n';

    for (const candidate of candidates) {
        const result = await runFile(candidate, ['version'], { timeout: 15000 });
        logs += `\n- ${candidate}\n`;
        logs += result.ok ? `  ✅ OK: ${(result.stdout || result.stderr).trim()}\n` : `  ❌ ${result.errorMessage}\n`;
    }

    logs += '\nSe todos falharem, rode no PowerShell: where.exe arduino-cli\n';
    logs += 'Depois cole aqui: arduino-caminho CAMINHO_COMPLETO_DO_EXE\n';

    return { ok: true, logs };
}

async function listBoards() {
    const check = await checkArduinoCli();
    if (!check.ok) return check;

    const result = await runArduinoCli(['board', 'list'], { timeout: 30000 });
    return {
        ok: result.ok,
        logs: check.logs + formatResult('PLACAS/PORTAS DETECTADAS', result)
    };
}

async function configureArduinoAvr() {
    const check = await checkArduinoCli();
    if (!check.ok) return check;

    let logs = check.logs;

    // config init falha se o arquivo já existe. Isso não impede a instalação do core.
    const init = await runArduinoCli(['config', 'init'], { timeout: 30000 });
    logs += formatResult('CONFIG INIT', init);

    const update = await runArduinoCli(['core', 'update-index'], { timeout: 120000 });
    logs += formatResult('UPDATE INDEX ARDUINO AVR', update);

    const install = await runArduinoCli(['core', 'install', ARDUINO_AVR_CORE], { timeout: 300000 });
    logs += formatResult('INSTALL CORE ARDUINO AVR', install);

    const ok = update.ok && install.ok;
    logs += ok ? '\n✅ Arduino AVR configurado no Arduino CLI. Placas como Uno/Nano já podem compilar.\n' : '\n❌ Não consegui configurar o Arduino AVR. Veja o erro acima.\n';
    return { ok, logs };
}

// Mantido por compatibilidade com versões anteriores do terminal.
async function configureEsp32() {
    return configureArduinoAvr();
}

function getCompileArgs(fqbn, sketchDir) {
    const args = ['compile', '--fqbn', fqbn];
    if (String(fqbn).startsWith('esp32:')) {
        args.push('--additional-urls', ESP32_PACKAGE_URL);
    }
    args.push(sketchDir);
    return args;
}

async function compileSketch(generatedCpp, options = {}) {
    const check = await checkArduinoCli();
    if (!check.ok) return check;

    const fqbn = options.fqbn || DEFAULT_FQBN;
    const { sketchDir, inoPath } = createSketchFolder(generatedCpp, options.filename);

    const result = await runArduinoCli(getCompileArgs(fqbn, sketchDir), { timeout: 300000 });

    return {
        ok: result.ok,
        sketchDir,
        inoPath,
        fqbn,
        logs: check.logs + `\n📄 Sketch gerado em: ${inoPath}\n` + formatResult('COMPILAÇÃO ARDUINO', result) + (result.ok ? '\n✅ Compilou igual ao Arduino IDE.\n' : '\n❌ Erro de compilação. Corrija o código ou confira a placa/FQBN.\n')
    };
}

async function uploadSketch(generatedCpp, options = {}) {
    const port = options.port;
    if (!port) {
        return { ok: false, logs: '❌ Informe a porta. Exemplo: enviar-arduino COM3 ou enviar-arduino /dev/ttyUSB0\n' };
    }

    const fqbn = options.fqbn || DEFAULT_FQBN;
    const compile = await compileSketch(generatedCpp, options);
    if (!compile.ok) return compile;

    const upload = await runArduinoCli([
        'upload',
        '-p', port,
        '--fqbn', fqbn,
        compile.sketchDir
    ], { timeout: 300000 });

    return {
        ok: upload.ok,
        sketchDir: compile.sketchDir,
        inoPath: compile.inoPath,
        fqbn,
        port,
        logs: compile.logs + formatResult('UPLOAD ARDUINO', upload) + (upload.ok ? '\n✅ Código enviado para a placa.\n' : '\n❌ Erro ao enviar para a placa. Confira cabo, porta e driver USB.\n')
    };
}

module.exports = {
    DEFAULT_FQBN,
    ARDUINO_AVR_CORE,
    ESP32_PACKAGE_URL,
    checkArduinoCli,
    setArduinoCliPath,
    diagnoseArduinoCli,
    listBoards,
    configureArduinoAvr,
    configureEsp32,
    compileSketch,
    uploadSketch
};
