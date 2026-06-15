function handleFunCall(self, stmt){
    const { name, args } = stmt;
    
    let funcName;
    let modulePrefix = null;

    if (typeof name === 'string') funcName = name;
    else if (name?.type === 'Identifier'){
        funcName = name.name;
        modulePrefix = name.modulePrefix;
    }
    else throw new Error('Invalid function name in call');
    
    let finalAsmName = funcName; // Default bawaan lamamu
    let registryName = funcName;          // Nama untuk dicari di self.functionNames

    if (modulePrefix) {
        // Cek buku catatan compiler apakah alias ini valid
        const realModule = self.moduleAliases[modulePrefix];
        
        if (realModule) {
            // Ubah instruksi Call di Assembly
            // Contoh: prefix 'math' -> realModule 'std_math' -> 'aiko_std_math_min'
            finalAsmName = `${realModule}_${funcName}`;
            // console.log({finalAsmName});
            
            // Nama di registry juga kemungkinan besar sudah di-mangling saat FunctionDecl
            registryName = finalAsmName; 
        } else {
            throw new Error(`Module atau alias '${modulePrefix}' belum di-import!`);
        }
    }

    const fn = self.resolveFunction(registryName);
    if (!fn) {
        throw new Error(`Function "${registryName}" not defined`);
    }

    if (args.length !== fn.paramCount) {
        throw new Error(
            `Function "${registryName}" expects ${fn.paramCount} args, got ${args.length}`
        );
    }

    //  push argumen dari kanan ke kiri
    for (let i = args.length - 1; i >= 0; i--) {
        const argExpr = args[i];

        // generateExpression WAJIB mengembalikan Box*
        const { box } = self.generateExpression(argExpr);

        let isArrayArgument = false;
        let varMeta = null;

        // CEK MELALUI SYMBOL TABLE
        if (argExpr.type === 'Identifier') {
            varMeta = self.resolveVar(argExpr.name); 
            
            // Kalau variabelnya ketemu dan properti isArray-nya ada (true/'dynamic'/dll)
            if (varMeta && varMeta.isArray) {
                isArrayArgument = true;
            }
        }

        if(isArrayArgument){
            // console.log({pointer: argExpr.name});
            
            self.emit(`push eax    ; push pointer arg ${i}`);
        }
        else {
            // console.log({value: argExpr.name});
            
            self.emit(`; --- Pass-by-Value: Copying argument ${i} ---`);
            self.emit(`push eax            ; Simpan alamat Box asli sementara`);
    
            // 2. Alokasi Box baru untuk parameter (8 byte)
            // Pastikan self.allocBox(1) menghasilkan EAX = Alamat Box Baru
            self.allocBox(1); 
            
            self.emit(`pop ebx             ; EBX = Alamat Box asli`);
    
            // 3. Salin data dari Box Asli (EBX) ke Box Baru (EAX)
            self.emit(`mov ecx, [ebx]      ; Ambil value`);
            self.emit(`mov [eax], ecx      ; Masukkan ke Box baru`);
            self.emit(`mov ecx, [ebx + 4]  ; Ambil type`);
            self.emit(`mov [eax + 4], ecx  ; Masukkan ke Box baru`);
    
            // eax = Box*
            self.emit(`push eax    ; push arg ${i}`);
        }
    }

    // panggil
    self.emit(`call fun_${finalAsmName}`);

    // bersihkan argumen (cdecl)
    if (args.length > 0) {
        self.emit(`add esp, ${args.length * 4}    ; bersihkan dari stack`);
    }

    return { box: true, val: null };
}

module.exports = handleFunCall;