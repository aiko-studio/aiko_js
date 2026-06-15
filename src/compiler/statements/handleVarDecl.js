function handleVarDecl(self, stmt){
    const { box, val } = self.generateExpression(stmt.initializer);

    let isArrayVar = false;

    if (stmt.initializer.type === 'ArrayLiteral' || stmt.initializer.type === 'ArrayAlloc') {
        // Kasus A: Deklarasi langsung (var x = [1, 2];)
        isArrayVar = true;
    }
    if(stmt.initializer.type === 'Identifier'){
        // Kasus B: Kopi dari variabel lain (var y = x;)
        // Kita harus cek apakah variabel sumbernya adalah array
        const sourceMeta = self.resolveVar(stmt.initializer.name);
        if (sourceMeta && sourceMeta.isArray) {
            isArrayVar = true;
        }

        // ini bisa jadi function saja pakai subroutine
        // Simpan alamat ASAL di stack sementara, karena kita mau panggil alloc (alloc akan menimpa eax)
        self.emit(`push eax            ; Simpan alamat Box Asal di stack`);

        // Alokasi Memori baru
        self.allocBox(1);
        // Sekarang EAX berisi alamat Box BARU (kosong)
        
        // Ambil kembali alamat ASAL dari stack ke register lain (misal EBX)
        self.emit(`pop ebx             ; EBX = Alamat Box Asal`);

        // Copy Value
        self.emit(`mov ecx, [ebx]      ; Ambil value source`);
        self.emit(`mov [eax], ecx      ; Taruh di dest`);
        
        // Copy Type
        self.emit(`mov ecx, [ebx + 4]  ; Ambil type source`);
        self.emit(`mov [eax + 4], ecx  ; Taruh di dest`);
    }
    
    // alokasi 4 byte untuk variabel pointer
    self.currentOffset += 4;


    const offset = Math.abs(self.currentOffset);
    self.emit(`; ------------------------------ Start Deklarasi variabel ${stmt.name} ------------------------------`);
    self.emit(`sub esp, 4`);
    self.emit(`mov dword [ebp - ${offset}], eax    ; pindahkan alamat Box* ke dalam offset ${offset}`);
    self.emit(`; ------------------------------ End Deklarasi variabel ${stmt.name} ------------------------------`);
    self.blank(1);

    // daftarkan ke variables di scope sekarang
    self.defineVar(stmt.name, {
        offset: self.currentOffset,
        storage: 'stack',
        kind: 'box',
        isArray: isArrayVar,
        isConst: stmt.kind === 'val'
    }, stmt);
}

module.exports = handleVarDecl;