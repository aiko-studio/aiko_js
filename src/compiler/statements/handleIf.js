function handleIf(self, stmt) {
    const ifId = self.ifCounter++;

    const thenLabel = `if_${ifId}_then`;
    const endLabel  = `if_${ifId}_end`;
    const elseLabel = stmt.else_block ? `if_${ifId}_else` : endLabel;

    const elifCondLabels = stmt.elifs.map(
        (_, i) => `if_${ifId}_elif_${i}_cond`
    );
    const elifThenLabels = stmt.elifs.map(
        (_, i) => `if_${ifId}_elif_${i}_then`
    );

    self.emit(`; ------------------------------ Start Kondisi if ${ifId} ------------------------------`);
    const resIfCond = self.generateExpression(stmt.condition, 'condition');
    if (resIfCond && resIfCond.box) {
        // Jika compiler mengembalikan info offset stack (seperti val: 4 atau nama register)
        if (typeof resIfCond.val === 'number') {
            // Paksa ambil alamat Box dari stack [ebp - val] masuk ke EAX
            self.emit(`mov eax, [ebp - ${resIfCond.val}]    ; Ambil Box* dari stack frame`);
        }
        else {
            self.emit(`mov eax, ${resIfCond.reg || 'eax'}`);
        }
        
        // Ambil nilai primitif boolean dari dalam Box Heap
        self.emit(`mov eax, [eax]                         ; Unbox nilai asli (0/1) dari Heap`);
    } else {
        // Jika berupa nilai mentah hasil komparasi biner (box: false)
        if(resIfCond && resIfCond.reg && resIfCond.reg !== 'eax') {
            self.emit(`mov eax, ${resIfCond.reg}`);
        }
    }
    
    self.emit(`; jika false maka lanjut kondisi selanjutnya`);
    self.emit(`cmp eax, 0`);
    self.emit(`je ${stmt.elifs.length > 0 ? elifCondLabels[0] : elseLabel}`);
    self.emit(`jmp ${thenLabel}`);

    // IF THEN
    self.emit(`${thenLabel}:`);
    self.enterScope();
    for (const s of stmt.then_block) {
        self.generateStatement(s);
    }

    
    self.exitScope();
    self.emit(`jmp ${endLabel}`);
    self.emit(`; ------------------------------ End Kondisi if ${ifId} ------------------------------`);
    self.blank(1);

    // ELIF
    for (let i = 0; i < stmt.elifs.length; i++) {
        self.updateLocation(stmt.elifs[i]);

        self.emit(`; ------------------------------ Start Kondisi else if ke-${i} dari if${ifId} ------------------------------`);
        const nextFalse =
            i + 1 < stmt.elifs.length
                ? elifCondLabels[i + 1]
                : elseLabel;

        self.emit(`${elifCondLabels[i]}:`);
        const resElifCond = self.generateExpression(stmt.elifs[i].condition, 'condition');

        if(resElifCond && resElifCond.box) {
            if(typeof resElifCond.val === 'number') {
                self.emit(`mov eax, [ebp - ${resElifCond.val}]`);
            }
            else {
                self.emit(`mov eax, ${resElifCond.reg || 'eax'}`);
            }
            self.emit(`mov eax, [eax]    ; Unbox nilai asli boolean dari Box Elif`);
        } else if (resElifCond && resElifCond.reg && resElifCond.reg !== 'eax') {
            self.emit(`mov eax, ${resElifCond.reg}`);
        }

        self.emit(`cmp dword eax, 0`,);
        self.emit(`je ${nextFalse}`,);
        self.emit(`jmp ${elifThenLabels[i]}`);
        self.blank(1);

        self.emit(`${elifThenLabels[i]}:`);
        self.enterScope();
        for (const s of stmt.elifs[i].block) {
            self.generateStatement(s);
        }

        
        self.exitScope();
        self.emit(`jmp ${endLabel}`);
        self.emit(`; ------------------------------ End Kondisi else if ke-${i} dari if ${ifId} ------------------------------`);
        self.blank(1);
    }

    // ELSE
    if (stmt.else_block) {
        self.updateLocation(stmt);
        self.emit(`; ------------------------------ Start Kondisi else ${ifId} ------------------------------`);
        self.emit(`${elseLabel}:`);
        self.enterScope();
        for (const s of stmt.else_block) {
            self.generateStatement(s);
        }

        self.exitScope();
        self.emit(`; ------------------------------ End Kondisi else ${ifId} ------------------------------`);
    }

    self.emit(`${endLabel}:`);
    self.blank(1);
}


module.exports = handleIf;
