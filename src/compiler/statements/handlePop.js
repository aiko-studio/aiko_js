function handlePop(self, stmt) {
  const { arrayRef } = stmt;

  self.emit(`; ------------------------------ Start POP Statement ------------------------------`);
  
  // 1. Evaluasi target array -> Hasil berada di EAX (Pointer Base Array)
  const arrayResult = self.generateExpression(arrayRef);
  if (!arrayResult) return;

  // 2. Panggil fungsi pembantu runtime asm
  self.emit(`call array_pop            ; Panggil fungsi runtime pop (Hasil di EAX)`);
  self.emit(`; ------------------------------ End POP Statement ------------------------------`);
  self.blank(1);
}

module.exports = handlePop;