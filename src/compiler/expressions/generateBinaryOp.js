function generateBinaryOp(self, expr, mode) {
    const { left, op, right } = expr;

    self.emit(`; ------------------------------ Start Binary Op (${op}) ------------------------------`);

    const isArithmeticOrRelational = ['+', '-', '*', '/', '%', '<', '>', '<=', '>='].includes(op);

    // left operand, diawal semua dicoba ke condition dlu agar dapat value, tapi kalau masih dapat box lanjut ke if
    const resLeft = self.generateExpression(left, 'condition'); 
    
    // Logic: hasil Left ada di EDX
    if (left.type === 'Literal' && left.value === null) {
        if(isArithmeticOrRelational){ // untuk operasi null
            self.emit(`xor eax, eax             ; Set EAX = 0 untuk memicu panic`);
            self.emit(`call check_null_pointer    ; cek apakah operand kiri null`);
        }
        else { // untuk perbandingan null dengan literal langsung
            self.emit(`mov edx, 0               ; Left operand (null) = 0`);
        }
    }
    else if (resLeft.box) {
        self.emit(`mov eax, ${resLeft.reg || 'eax'}`);
        self.emit(`mov edx, [eax]    ; Unbox left ke EDX`);
    }
    else {
        // Jika child berupa Literal
        if (left.type === 'Literal') {
            self.emit(`mov edx, ecx    ; left harus di edx`);
        } 
        // Jika anak BinaryOp (mode 'condition'), dia sudah return di EDX. Aman.
    }

    self.emit(`push edx    ; simpan left value`);

    // right operand
    const resRight = self.generateExpression(right, 'condition'); // Minta 'condition' juga

    // Logic: hasil Right ada di EBX
    if (right.type === 'Literal' && right.value === null) {
        if(isArithmeticOrRelational){
            self.emit(`xor eax, eax             ; Set EAX = 0 untuk memicu panic`);
            self.emit(`call check_null_pointer    ; cek apakah operand kiri null`);
        }
        else {
            self.emit(`mov ebx, 0               ; Right operand (null) = 0`);
        }
    }
    else if (resRight.box) {
        self.emit(`mov eax, ${resRight.reg || 'eax'}`);
        self.emit(`mov ebx, [eax]    ; Unbox right ke EBX`);
    }
    else {
        if (right.type === 'Literal') {
            self.emit(`mov ebx, ecx    ; right harus di ebx`);
        }
        else {
            self.emit(`mov ebx, edx    ; right harus di ebx`);
        }
    }

    self.emit(`pop edx    ; restore left value ke edx`);

    // =========================================================
    // EKSEKUSI OPERASI (EDX op EBX)
    // =========================================================
    
    switch(op){
        // Aritmatika
        case '+': self.emit(`call runtime_add`); break;
        case '-': self.emit(`call runtime_sub`); break;
        case '*': self.emit(`call runtime_mul`); break;
        case '/': self.emit(`call runtime_div`); break;
        case '%': self.emit(`call runtime_mod`); break;
        case '<': self.emit(`call runtime_eq`); break;
        case '>': self.emit(`call runtime_ne`); break;
        case '==': self.emit(`call runtime_lt`); break;
        case '!=': self.emit(`call runtime_gt`); break;
        case '<=': self.emit(`call runtime_le`); break;
        case '>=': self.emit(`call runtime_ge`); break;
    }


    // return handling
    // KASUS A: Dipanggil oleh IF / WHILE / ELIF
    // Parent membutuhkan hasil di EAX untuk "cmp eax, 0"
    if (mode === 'condition') {
        self.emit(`mov eax, edx    ; Pindahkan hasil (0/1) ke EAX`); 
        return { box: false };
    }

    // KASUS B: Dipanggil oleh Operasi Matematika Lain (Optimasi)
    // Parent membutuhkan Raw Value di EDX untuk dijumlahkan lagi
    if (mode === 'condition') {
        // Biarkan hasil di EDX
        return { box: false };
    }

    // KASUS C: Default (Assignment atau Print)
    // Parent tidak mengirim mode (undefined), berarti butuh BOX (Pointer)
    self.emit(`; simpan hasil di box`);
    self.emit(`push edx`);       // Simpan hasil hitungan
    self.allocBox();             // EAX = pointer box baru
    self.emit(`pop edx`);        // Ambil hasil hitungan
    self.emit(`mov [eax], edx`); // Masukkan ke box
    self.emit(`mov dword [eax + 4], 0`); // Masukkan tipe ke box

    self.emit(`; ------------------------------ End Binary Op ${op} ------------------------------`);


    return { box: true, val: left.val }; 
}

module.exports = generateBinaryOp;