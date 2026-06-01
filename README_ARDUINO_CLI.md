# SOL IDE + Arduino usando Arduino CLI

Esta versão faz o código `arduino ... arduino` virar um sketch `.ino` e chama o Arduino CLI para compilar/enviar, parecido com o Arduino IDE.

## Placa padrão

A placa padrão está configurada como **Arduino Uno**:

```txt
arduino:avr:uno
```

Se você estiver usando Arduino Nano, pode trocar depois usando a variável de ambiente `SOL_ARDUINO_FQBN`, ou alterar diretamente o `DEFAULT_FQBN` no arquivo `arduinoService.js`.

## Comandos no terminal da SOL IDE

```txt
arduino-caminho C:\Program Files\Arduino CLI\arduino-cli.exe
```

Salva o caminho do Arduino CLI, caso o app não enxergue o PATH.

```txt
testar-arduino
```

Testa se o Arduino CLI está funcionando.

```txt
configurar-arduino
```

Instala/configura o core Arduino AVR no Arduino CLI.

```txt
portas
```

Lista as portas detectadas, como `COM6`.

```txt
compilar-arduino
```

Gera o `.ino` e compila para Arduino Uno.

```txt
enviar-arduino COM6
```

Compila e envia para a placa conectada na porta informada.

## Código SOL de teste

```sol
arduino
crava led = 13

tarefa iniciar[] [
    mostra["Arduino iniciou"]
]

tarefa repetir[] [
    envia[led, sim]
    espera[500]
    envia[led, nao]
    espera[500]
]
arduino
```

No Arduino Uno, o LED interno costuma ficar no pino 13.

## Observação

Os comandos antigos `compilar-esp32` e `enviar-esp32` foram mantidos como apelidos, mas agora o recomendado é usar `compilar-arduino` e `enviar-arduino`.
