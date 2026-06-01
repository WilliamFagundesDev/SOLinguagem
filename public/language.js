export const initialCode = `web
// ==== Exemplo de Construtor UI em SOLinguagem ====
guarda valor = 0

tarefa iniciar[] [
    limpa[]
    tema[]cor["escuro"],
    caixa["visor_caixa"]cor["preto"]tamanho["gigante"]estilo["moderno"],
    texto["visor_txt"]texto["0"]coloca["visor_caixa"],
    caixa["teclas"]estilo["display: flex; gap: 10px; margin-top: 15px;"],
    botao["btn_soma"]texto["+ 10"]cor["azul"]tamanho["medio"]estilo["moderno"]funcao["soma_dez"]coloca["teclas"],
    botao["btn_subtrai"]texto["- 5"]cor["vermelho"]tamanho["medio"]estilo["moderno"]funcao["subtrai_cinco"]coloca["teclas"],
    botao["btn_zerar"]texto["Zerar"]cor["cinza"]tamanho["medio"]estilo["moderno"]funcao["zerar_visor"]
]

tarefa soma_dez[] [ valor = valor + 10; atualiza["visor_txt", valor] ]
tarefa subtrai_cinco[] [ valor = valor - 5; atualiza["visor_txt", valor] ]
tarefa zerar_visor[] [ valor = 0; atualiza["visor_txt", valor] ]
web
`;

// =========================================================
// O NOVO GUIA DA LINGUAGEM (Lindo e formatado para a IDE)
// =========================================================
export const guideContent = `/* ================================================================= *
 * *
 * S O L i n g u a g e m   -   M A N U A L   L É X I C O        *
 * [ Engine de Análise e Tokenização de Alta Performance ]      *
 * *
 * ================================================================= */

// -----------------------------------------------------------------
// 1. ARQUITETURA E RASTREAMENTO ESPACIAL
// -----------------------------------------------------------------
/* O Motor Léxico da SOLinguagem opera em passagem única O(N),
   processando caractere por caractere (Pointer Advancing). 
   Isso garante extrema velocidade e um mapeamento cirúrgico de 
   [Linha] e [Coluna] para um tratamento de erros ultrapreciso. */

// -----------------------------------------------------------------
// 2. DICIONÁRIO DE PALAVRAS-CHAVE (KEYWORDS)
// -----------------------------------------------------------------
/* Estas são as palavras reservadas pelo núcleo do sistema: */

// [ Controle de Fluxo ]
// testa     : Inicia uma estrutura condicional (if).
// falha     : Bloco alternativo da condicional (else).
// enquanto  : Laço de repetição baseado em condição (while).
// para      : Laço de iteração definido (for).
// escolha   : Avaliador de múltiplos caminhos (switch).
// caso      : Condição de um caminho (case).
// padrao    : Caminho padrão do avaliador (default).
// quebra    : Interrompe a execução de um laço/escolha (break).
// continua  : Pula para a próxima iteração do laço (continue).
// retorna   : Devolve um valor na execução de uma tarefa (return).

// [ Declarações de Memória ]
// guarda    : Declara uma variável mutável na memória RAM (let).
// crava     : Declara uma constante imutável Read-Only (const).
// tarefa    : Define uma nova rotina/função no sistema (function).

// [ Escopos do Sistema ]
// web       : Define que o código compila para Interface Web (JS).
// esp       : Define que o código compila para Hardware (C++ / IoT).

// -----------------------------------------------------------------
// 3. CONSTRUTORES DE INTERFACE E EVENTOS
// -----------------------------------------------------------------
/* O sistema ignora parênteses e chaves. A hierarquia e as 
   propriedades visuais são feitas através de colchetes encadeados:
   
   Componentes:   caixa, texto, botao, tema
   Propriedades:  cor, tamanho, estilo, coloca, texto, funcao
   Ações Web:     mostra, atualiza, limpa, envia, manda, gira */

// -----------------------------------------------------------------
// 4. TIPAGEM DE DADOS (LITERAIS)
// -----------------------------------------------------------------
/*
   BOOLEANOS : sim (true), nao (false), nulo (null).
   NUMERAIS  : Suporte robusto a inteiros (42) e flutuantes (3.14).
   TEXTOS    : Delimitados por aspas duplas ("") ou simples ('').
               O Lexer processa nativamente caracteres de escape
               como \\n (quebra), \\t (tabulação), \\" e \\\\ .
*/

// -----------------------------------------------------------------
// 5. MAPA DE OPERADORES
// -----------------------------------------------------------------
/* O motor usa Lookahead seguro para não confundir símbolos:
   -> Comparação : ==, !=, ===, !==, <=, >=, >, <
   -> Aritmética : +, -, *, /, %, **
   -> Atribuição : =, +=, -=, *=, /=
   -> Incremento : ++, --
   -> Lógicos    : && (E), || (OU), ! (NÃO)
*/

// -----------------------------------------------------------------
// 6. CÓDIGO DE EXEMPLO OFICIAL
// -----------------------------------------------------------------
web

// Alocação em Memória Estática e Dinâmica
crava VERSAO_CORE = "2.1.0"
guarda tarefas_concluidas = 0
guarda permissao_acesso = sim

// Escopo Funcional Isolado
tarefa diagnostico[] [
    
    // Validação de Integridade
    testa [permissao_acesso == sim] [
        mostra["Acesso Autorizado. Versão:", VERSAO_CORE]
        
        // Loop de processamento de rotinas
        enquanto [tarefas_concluidas < 3] [
            tarefas_concluidas++
            mostra["Processando bloco...", tarefas_concluidas]
        ]
        
    ] falha [
        mostra["Falha de Segurança: Acesso Negado."]
    ]
]

web
`;

export function setupLanguage(CodeMirror) {
    CodeMirror.defineMode("solinguagem", function() {
        return {
            startState: function() { return { depth: 0, inComment: false }; },
            token: function(stream, state) {
                if (state.inComment) {
                    while (!stream.eol()) {
                        if (stream.match("*/")) { state.inComment = false; return "comment"; }
                        stream.next();
                    }
                    return "comment";
                }
                if (stream.eatSpace()) return null;
                if (stream.match("//")) { stream.skipToEnd(); return "comment"; }
                if (stream.match("/*")) { state.inComment = true; return "comment"; }
                if (stream.match(/^"[^"]*"/)) return "string";
                if (stream.match(/^[0-9]+(\.[0-9]+)?/)) return "number";
                
                const match = stream.match(/^[a-zA-Z_][a-zA-Z0-9_]*/);
                if (match) {
                    const word = match[0];
                    const keywords = ['tarefa', 'testa', 'falha', 'enquanto', 'para', 'escolha', 'caso', 'padrao', 'quebra', 'continua', 'retorna', 'gira', 'manda', 'esp', 'web'];
                    const types = ['guarda', 'crava'];
                    const builtins = ['mostra', 'envia', 'tema', 'caixa', 'texto', 'botao', 'atualiza', 'limpa']; 
                    const properties = ['cor', 'tamanho', 'texto', 'funcao', 'estilo', 'coloca']; 
                    const atoms = ['sim', 'nao', 'nulo'];
                    
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
}
