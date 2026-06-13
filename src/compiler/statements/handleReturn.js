function handleReturn(self, stmt){
    if (!self.currentFunction) {
        self.reportError("'return' digunakan di luar fungsi.", stmt);
        return; 
    }

    let exprVal;
    self.emit(`; ------------------------------ Start Return ------------------------------`);
    if(stmt.value.type === 'Identifier'){
        const { box, val } = self.generateExpression(stmt.value, 'condition');
        exprVal = val;
    }
    else {
        const { box, val } = self.generateExpression(stmt.value);
        exprVal = val;        
    }

    self.emit(`push eax`);
    self.allocBox();
    self.emit(`pop edx`);
    // Sekarang: EAX = Box Baru (Kosong), EDX = Box Lama (Isi Data)

    // // 4. Salin Value (Offset 0)
    // self.emit(`mov ecx, [edx]      ; Ambil value dari Box Lama`);
    // self.emit(`mov [eax], ecx      ; Masukkan ke Box Baru`);

    // // 5. Salin Type (Offset 4)
    // self.emit(`mov ecx, [edx+4]    ; Ambil type dari Box Lama`);
    // self.emit(`mov [eax+4], ecx    ; Masukkan ke Box Baru`);

    // ganti dengan ini kalau mau deep copy arr:
    self.emit(`mov esi, edx        ; ESI = Box lama`);
    self.emit(`mov edi, eax        ; EDI = Box baru`);
    self.emit(`call return_copy_value`);
    
    self.emit(`jmp fun_${self.currentFunction}_exit`);
    self.emit(`; ------------------------------ End Return ------------------------------`);

    return { box: false, val: exprVal };
}

module.exports = handleReturn;