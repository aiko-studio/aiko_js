function generateView(self, stmt) {
    const { argument } = stmt; 
    
    self.emit(`; ------------------------------ Start View (Address Of) ------------------------------`);
    
    // 1. Cek apakah target yang di-view adalah sebuah Identifier (Variabel lokal)
    if (argument.type === 'Identifier') {
        // Cari posisi offset variabel di stack berdasarkan namanya
        // Catatan: sesuaikan 'self.getVariableOffset' atau 'self.environment' dengan nama fungsi pencari offset di compiler Anda.
        // Umumnya di compiler x86 JS kodenya mirip seperti: self.getOffset(argument.name) atau self.lookup(argument.name)
        const offset = self.getOffset ? self.getOffset(argument.name) : null; 
        
        if (offset !== null) {
            self.emit(`; Ambil alamat slot stack variabel ${argument.name} (bukan isi box-nya)`);
            self.emit(`lea eax, [ebp - ${offset}] ; EAX = Alamat stack variabel`);
        } else {
            // Fallback jika global atau menggunakan mekanisme pencarian lain bawaan compiler Anda
            self.generateExpression(argument);
        }
    } else {
        // Jika target adalah ekspresi lain atau array access
        self.generateExpression(argument);
    }

    // 2. Amankan alamat asli tersebut ke stack sebelum mengalokasikan box baru
    self.emit(`push eax    ; Simpan alamat target yang mau di-view`);

    // 3. Alokasikan Box baru untuk menampung HASIL dari view
    self.emit(`; Alokasikan 8 byte untuk Box baru hasil view`);
    self.allocBox(); 

    // 4. Ambil kembali alamat target dari stack ke register EBX
    self.emit(`pop ebx     ; EBX = Alamat asli yang di-view`);

    // 5. Masukkan alamat tersebut ke dalam VALUE dari Box BARU ([EAX])
    self.emit(`mov [eax], ebx ; Simpan alamat ke dalam value Box hasil`);

    // 6. Set tipe data Box BARU menjadi INT
    const TYPE_PTR = 4; 
    self.emit(`mov dword [eax + 4], ${TYPE_PTR} ; Set tipe Box hasil menjadi INT`);
    
    self.emit(`; ------------------------------ End View ------------------------------`);
    self.blank(1);

    return { box: true, val: 0 };
}

module.exports = generateView;