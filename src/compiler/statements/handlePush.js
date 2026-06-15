function handlePush(self, stmt) {
  const { arrayRef, value } = stmt;

  self.emit(`; ------------------------------ Start PUSH Statement ------------------------------`);
  
  // 1. Evaluasi nilai yang ingin dimasukkan -> Hasil berada di EAX
  const valResult = self.generateExpression(value);
  if (!valResult) return;

  // Nilai di EAX saat ini adalah Box Primitif (8 byte: value + type)
  self.emit(`push dword [eax + 4]      ; Push tipe data dari nilai baru`);
  self.emit(`push dword [eax]          ; Push value dari nilai baru`);
  self.blank(1);

  // 2. Evaluasi target array -> Hasil berada di EAX (Pointer Base Array)
  const arrayResult = self.generateExpression(arrayRef);
  if (!arrayResult) return;

  // 3. Panggil fungsi pembantu runtime asm
  self.emit(`call array_push           ; Panggil fungsi runtime push`);
  self.emit(`add esp, 8                ; Bersihkan argumen nilai baru dari stack`);
  self.emit(`; ------------------------------ End PUSH Statement ------------------------------`);
  self.blank(1);
}

module.exports = handlePush;