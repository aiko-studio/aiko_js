function handlePrint(self, stmt){
  const { expression } = stmt;
  
  const result = self.generateExpression(expression);
  if (!result) {
    return; // Berhenti di sini, jangan lanjut ke emit assembly agar tidakk error ganda
  }
  const { box, val } = result;
  // console.log(self.variables);
  const varName = self.findVarNameByOffset(val);
  // Cari data variabel di dalam array self.variables
  const varData = self.variables.find(obj => obj && obj[varName])?.[varName];
  const isArray = varData && varData.isArray === true;
  const offsetType = isArray ? 12 : 4;
  
  
  self.emit(`; ------------------------------ Start Print ------------------------------`);
  self.emit(`push dword [eax + ${offsetType}]    ; push tipe data ${varName ? 'variabel: ' + varName : ''}`);
  self.emit(`push dword [eax${isArray ? ' + 8' : ''}]    ; push nilai ${varName ? 'variabel: ' +  varName : ''}`);
  self.emit(`call print_generic    ; panggil fungsi untuk menampilkan nilai`);
  self.emit(`add esp, 8    ; pop argument dari stack`);
  self.emit(`call newline    ; untuk memanggil enter`);
  self.emit(`; ------------------------------ End Print ------------------------------`);
  self.blank(1);
}

module.exports = handlePrint;