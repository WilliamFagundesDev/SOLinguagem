// CÓDIGO C++ GERADO PARA HARDWARE

const int pino_led = 5;
void iniciar() {
  while (true) {
  pinMode(pino_led, OUTPUT);
  digitalWrite(pino_led, true);
delay(3000);
pinMode(pino_led, OUTPUT);
  digitalWrite(pino_led, false);
delay(3000);
}
}

void setup() {
  Serial.begin(115200);
  iniciar();
}

void loop() {
  // Lógica principal rola nas tarefas
}