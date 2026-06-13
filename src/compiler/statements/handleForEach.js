function handleForEach({
    self, iterator,
    step, block,
    forId, checkLabel,
    endLabel, updateLabel
}){
    // Setup Loop Stack (agar break/continue bekerja)
    self.loopStack.push({
        breakLabel: endLabel,
        continueLabel: updateLabel
    });

    self.enterScope();
    self.generateStatement(iterator); // ambil alamat array + buat variabel item

    self.emit(`; ------------------------------ Start Looping For-In ${forId} ------------------------------`);

    // ✅ FIX: Setelah generateStatement(iterator), eax sudah tertimpa oleh item box.
    // Kita perlu reload pointer array dari variabelnya langsung.
    const varName = iterator.value || iterator.name;
    const varEntry = self.variables.find(obj => obj && obj[varName]);
    if (varEntry) varEntry[varName].isArray = false;
    const varOffset = self.resolveVar(varName).offset;

    // Tapi varName di sini adalah "item" (loop var), bukan array.
    // Kita butuh nama array aslinya dari iterator node.
    // Asumsikan iterator.source atau iterator.array menyimpan nama array.
    const arrName = iterator.initializer.name;
    const arrOffset = self.resolveVar(arrName).offset;

    self.emit(`mov eax, [ebp - ${arrOffset}]    ; ✅ reload pointer ke array '${arrName}'`);
    self.emit(`push eax    ; simpan pointer array di stack untuk dipakai loop`);
    self.emit(`xor esi, esi    ; inisialisasi counter i = 0`);

    // --- Start Loop Check ---
    self.emit(`${checkLabel}:`);

    self.emit(`; Load Array Info`);
    self.emit(`mov edx, [esp]    ; edx = pointer ke array`);
    self.emit(`cmp esi, [edx]    ; bandingkan i dengan length array`);
    self.emit(`jge ${endLabel}    ; jika i >= length, selesai`);

    self.emit(`; Loop Body`);
    self.emit(`lea edi, [edx + 8 + esi * 8]    ; edi = alamat elemen ke-i`);

    self.emit(`; Assign current element address to loop variable '${varName}'`);
    self.emit(`mov dword [ebp - ${varOffset}], edi`);

    // Filter (when clause) jika ada
    if(step){
        self.emit(`; --- Start Filter Check (when clause) ---`);
        self.generateExpression(step, 'condition');
        self.emit(`cmp eax, 0`);
        self.emit(`je ${updateLabel}    ; jika false, skip body`);
        self.emit(`; --- End Filter Check ---`);
    }

    // Generate isi body loop
    for(const s of block){
        self.generateStatement(s);
    }

    // Update counter
    self.emit(`${updateLabel}:`);
    self.emit(`add esi, 1    ; increment counter`);
    self.emit(`jmp ${checkLabel}    ; ulangi loop`);

    self.emit(`${endLabel}:`);
    self.emit(`add esp, 4    ; bersihkan pointer array dari stack`);

    self.emit(`; ------------------------------ End Looping For-In ${forId} ------------------------------`);
    self.exitScope();
    self.loopStack.pop();
}

module.exports = handleForEach;