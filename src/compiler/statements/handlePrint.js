function handlePrint(self, stmt){
  const { expression } = stmt;
  
  const result = self.generateExpression(expression);
  if (!result) {
    return; // Berhenti di sini, jangan lanjut ke emit assembly agar tidakk error ganda
  }
  
  // console.log(self.variables);
  const varName = self.findVarNameByOffset(result.val);
  const varComment = varName ? `(variabel: ${varName})` : '(literal)';

  // ID unik untuk label assembly agar tidak bentrok
  const uid = Math.floor(Math.random() * 100000); 
  const lblArray = `.is_array_print_${uid}`;
  const lblPrint = `.do_print_${uid}`;
  
  self.emit(`; ------------------------------ Start Print ------------------------------`);
  self.emit(`push dword [eax + 4]    ; push tipe data ${varName ? 'variabel: ' + varName : ''}`);
  
  // cek diruntime
  self.emit(`cmp dword [eax + 4], 3  ; Cek apakah tipe datanya = 3 (Array)?`);
  self.emit(`je ${lblArray}          ; Jika Ya, lompat ke penanganan Array`);
  self.blank(1);
  
  // Blok jika BUKAN Array (Primitif: Int, Bool, String)
  self.emit(`push dword [eax]        ; push nilai primitif ${varComment}`);
  self.emit(`jmp ${lblPrint}         ; lewati blok array, langsung print`);
  self.blank(1);

  // Blok jika ARRAY
  self.emit(`${lblArray}:`);
  self.emit(`push eax                ; push POINTER referensi ${varComment}`);
  self.blank(1);

  // Pemanggilan Print Generic
  self.emit(`${lblPrint}:`);
    
  self.emit(`call print_generic    ; panggil fungsi untuk menampilkan nilai`);
  self.emit(`add esp, 8    ; pop argument dari stack`);
  self.emit(`call newline    ; untuk memanggil enter`);
  self.emit(`; ------------------------------ End Print ------------------------------`);
  self.blank(1);
}

module.exports = handlePrint;