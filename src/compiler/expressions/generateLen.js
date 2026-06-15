function handleLen(self, expr) {
    const expression = expr.expression; 
    // console.log(expr);
    
    // Cek ke Symbol Table apakah variabel ini terdaftar dan benar-benar array
    const meta = self.resolveVar(expression.name);
    if (!meta) {
        self.reportError(`Undefined variable '${expression.name}'`, expr);
        return;
    }
    // console.log({meta});
    
    if (meta.isArray !== true && meta.isArray !== 'dynamic') {
        self.reportError(`Type Error: Fungsi len() hanya bisa digunakan untuk tipe data Array. Variabel '${expression.name}' bukan array.`, expr);
        return;
    }

    self.emit(`; ------------------------------ Start len(${expression.name}) ------------------------------`);
    
    // Jalankan ekspresi array_name agar EAX berisi Base Address dari Array tersebut
    const {_, val} = self.generateExpression(expression);     

    // Sekarang EAX = Alamat basis array (menunjuk ke Header)
    // Berdasarkan strukturmu, [eax] adalah nilai mentah dari panjang array (misal: 5)
    
    // ambil nilai panjangnya ke register EDX sementara
    self.emit(`mov edx, dword [eax]        ; Ambil nilai mentah len dari header array`);

    // kita harus mengalokasikan Box baru di Arena untuk menampung angka panjang ini
    self.emit(`push edx                    ; Amankan nilai len ke stack sebelum panggil arena`);
    self.allocBox(1);
    self.emit(`pop edx                     ; Kembalikan nilai len dari stack ke EDX`);

    // Sekarang EAX berisi alamat Box baru hasil arena_alloc
    // Masukkan nilai len dan tipe datanya (0 = angka/int) ke dalam Box baru tersebut
    self.emit(`mov dword [eax], edx        ; Masukkan nilai panjang array ke Box`);
    self.emit(`mov dword [eax + 4], 0      ; Set tipe data Box sebagai Angka (0)`);

    self.emit(`; ------------------------------ End len(${expression.name}) ------------------------------`);
    
    // Kembalikan metadata info bahwa hasil dari len() ini adalah sebuah value bertipe number
    return { box: true, value: val };
}

module.exports = handleLen;