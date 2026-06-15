function handleAssign(self, stmt){
    const { variable, initializer } = stmt;

    if (variable.type === 'ArrayAccess') {
        const { array_name, index } = variable;
        
        // cari alamat pointer array
        const meta = self.resolveVar(array_name.name);
        if (!meta){
            self.reportError(`Undefined variable ${array_name.name}`, stmt);
            return;
        }

        // CEK APAKAH VARIABEL TERSEBUT ADALAH ARRAY
        // console.log({meta});
        
        if (meta.isArray !== true && meta.isArray !== 'dynamic') { 
            self.reportError(`Variabel '${array_name.name}' bukan sebuah array.`, stmt);
            return;
        }

        // 2. Hitung Alamat Slot Array (Logika sama persis dengan generateArrayAccess)
        // Logika index variabel (i)
        self.emit(`; ------------------------------ Start Assign Array ------------------------------`);
        if(variable.index.type === 'Literal'){
            self.generateExpression(index, 'condition');      // EAX = Address variabel i
        }
        else {
            self.generateExpression(index);
            self.emit(`mov ecx, [eax]    ; pindahkan nilai ke ecx`); // Sekarang ECX berisi value indeks (misal: 2)
        }
        self.generateExpression(array_name); // EAX = Base Address Array

        // if (meta.isArray === 'dynamic') {
        //     self.emit(`cmp dword [eax + 4], 3      ; Cek type tag di offset 4`);
        //     self.emit(`jne exit_program ; Lompat ke error jika bukan array`);
        // }

        self.emit(`call check_bound`);
        self.emit(`imul ecx, 8`);            // ECX = Offset data
        
        self.emit(`add eax, ecx`);           // EAX + Offset Index
        self.emit(`add eax, 8`);             // EAX + Header (8 byte)

        // 3. PENTING: Simpan alamat tujuan (EAX) ke Stack dulu
        // Karena kita mau pakai EAX untuk generate value di kanan sama dengan
        self.emit(`push eax ; simpan alamat slot array tujuan`);

        // 4. Generate Value Baru (initializer)
        // Hasilnya ada di EAX berupa Pointer ke Box baru
        self.generateExpression(initializer);

        // 5. Ambil kembali alamat tujuan ke register lain (misal EDX)
        self.emit(`pop edx ; EDX sekarang menunjuk ke slot array arr[i]`);

        // 6. COPY DATA (Unboxing)
        // Kita salin isi Box baru (EAX) ke dalam Slot Array (EDX)
        
        // Copy Value (Offset 0)
        self.emit(`mov ecx, [eax]      ; ambil value dari box baru`);
        self.emit(`mov [edx], ecx      ; masukkan ke slot array`);

        // Copy Type (Offset 4)
        self.emit(`mov ecx, [eax + 4]  ; ambil type dari box baru`);
        self.emit(`mov [edx + 4], ecx  ; masukkan ke slot array`);
        
        self.emit(`; ------------------------------ End Assign Array ------------------------------`);
    }
    else {
        const meta = self.resolveVar(variable.name);
        if (!meta){
            self.reportError(`Undefined variable ${variable.name}`, stmt);
            return;
        }

        if (meta.isConst) {
            self.reportError(`Compile Error: Tidak dapat mengubah nilai konstanta '${variable.name}'.`, stmt);
            return;
        }

        self.emit(`; ------------------------------ Start Assign Variable ------------------------------`);
        const pointerOp = meta.kind === 'param' ? '+' : '-';

        // In-place hanya untuk number, bool, dan BinaryOp (bukan string)
        const isInPlaceable = 
            initializer.type === 'BinaryOp' ||
            (initializer.type === 'Literal' && typeof initializer.value !== 'string');

        if (isInPlaceable) {
            self.emit(`; [IN-PLACE] tulis langsung ke box lama tanpa alloc baru`);
            
            // Fix: konversi boolean literal ke 1/0 sebelum generate
            let patchedInitializer = initializer;
            if (initializer.type === 'Literal' && typeof initializer.value === 'boolean') {
                patchedInitializer = {
                    ...initializer,
                    value: initializer.value ? 1 : 0
                };
            }

            // 1. Generate nilai mentah ke Ecx
            self.generateExpression(patchedInitializer, 'condition');
            
            // agar logika penyimpanan di bawahnya tetap seragam dan EAX aman dipakai untuk alamat.
            if (patchedInitializer.type === 'BinaryOp') {
                self.emit(`mov ecx, eax    ; pindahkan hasil BinaryOp dari EAX ke ECX`);
            }

            // 2. Load alamat box lama
            self.emit(`mov eax, [ebp ${pointerOp} ${meta.offset}]  ; load alamat box lama`);
            
            // 3. Tulis nilai ke box lama
            self.emit(`mov dword [eax], ecx       ; update value in-place`);
            
            // 4. Update type tag
            if (initializer.type === 'Literal') {
                let typeTag = 0;
                if (typeof initializer.value === 'boolean') typeTag = 2;
                self.emit(`mov dword [eax + 4], ${typeTag}  ; update type in-place`);
            }
        }
        else {
            // String literal, Identifier, FunctionCall, dsb → alloc box baru
            self.generateExpression(initializer); // EAX = box baru

            self.emit(`; ------------------------------ Start Assign ke variabel ${variable.name} ------------------------------`);
            self.emit(`mov dword [ebp ${pointerOp} ${meta.offset}], eax    ; ${variable.name} diperbarui menunjuk ke box baru`);
        }

        self.emit(`; ------------------------------ End Assign ke variabel ${variable.name} ------------------------------`);
        self.blank(1);
    }
}

module.exports = handleAssign;