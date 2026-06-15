function handleFunDecl(self, stmt){
    const { name, params, body } = stmt;
    
    let finalFuncName = name;

    // jika sedang didalam module tambahkan nama module ke nama fungsi
    if (self.module && self.module.length > 0) {
        let modStr = Array.isArray(self.module) ? self.module.join('_') : self.module;
        finalFuncName = `${modStr}_${name}`;
    }
    
    // daftarkan fungsi
    self.registerFunction({
        name: finalFuncName,
        paramCount: params.length,
        paramNames: params
    }, stmt);
    
    self.currentFunction = finalFuncName;
    
    const oldSection = self.textSection; // current section sekarang adalah function body
    const oldSourceMap = self.sourceMap;       // <--- Simpan map utama
    const oldIndent = self.indentLevel;        // <--- Simpan indentasi
    const oldOffset = self.currentOffset;
    
    // arahkan semua statement fungsi ke funcBody
    self.textSection = [];
    self.sourceMap = [];                       // <--- Reset map untuk fungsi ini
    self.indentLevel = 0;                      // <--- Reset indent jadi 0 (biar rapi)
    self.currentOffset = 0;
    
    self.enterScope();
    self.emit(`push ebp    ; buat stack frame baru`);
    self.emit(`mov ebp, esp`);

    self.emit(`call arena_mark    ; Ambil posisi arena saat ini ke eax`);
    self.emit(`push eax           ; Simpan mark ke stack di [ebp - 4]`);
    self.currentOffset += 4;      // Update offset karena [ebp - 4] dipakai mark

    self.blank(1);
    
    // console.log(params);
    
    // bind parameter ke scope
    params.forEach((param, i) => {
        const paramName =
            typeof param === 'string'
                ? param
                : param?.type === 'Identifier'
                    ? param.name
                    : (() => {
                        self.reportError('Invalid parameter', stmt);
                    })();

        const offset = 8 + i * 4;

        self.defineVar(paramName, {
            offset,
            storage: 'stack',
            kind: 'param',
            isArray: 'dynamic'
        }, stmt);
    });
    
    
    for(const innerStmt of body){
        // console.log({innerStmt});
        self.generateStatement(innerStmt);
    }
    
    self.blank(1);
    
    self.textSection.push(`fun_${finalFuncName}_exit:`);

    self.emit(`push eax           ; amankan return value fungsi (di eax)`);
    self.emit(`mov eax, [ebp - 4] ; ambil kembali arena mark khusus fungsi ini`);
    self.emit(`call arena_rewind  ; bersihkan memori arena fungsi ini`);
    self.emit(`pop eax            ; kembalikan return value fungsi`);

    self.exitScope();
    self.blank(2);
    self.sourceMap.push(self.currentSourceLocation);

    self.indentLevel++; // agar sejajar indentnya
    self.emit(`mov esp, ebp    ; bersihkan stack frame saat fungsi selesai`);
    self.emit(`pop ebp`);
    self.emit('ret');
    self.emit(`; ------------------------------ End Deklarasi fungsi ${name} ------------------------------`);    
    self.indentLevel--;

    // baru tulis definisi fungsi
    self.functiontSection.push(`; ------------------------------ Start Deklarasi fungsi ${name} ------------------------------`);
    self.functiontSection.push(`fun_${finalFuncName}:`);
    self.functionSourceMap.push(self.currentSourceLocation);
    
    // Push Code & Map
    self.functiontSection.push(...self.textSection);
    self.functionSourceMap.push(...self.sourceMap); // <--- Simpan map fungsi ke functionSourceMap
    
    // balik lagi ke section lama (_start)
    self.textSection = oldSection;
    self.sourceMap = oldSourceMap;             // <--- Balikin map utama
    self.indentLevel = oldIndent;              // <--- Balikin indentasi
    self.currentOffset = oldOffset;

    // agar bisa mendeteksi return diluar fungsi dengan cara membuat current func na null
    self.currentFunction = null;

    // console.log(self.functionNames);
    
}

module.exports = handleFunDecl;