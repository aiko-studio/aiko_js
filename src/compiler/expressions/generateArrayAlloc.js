function generateArrayAlloc(self, expr) {
    self.emit(`; ------------------------------ Start Array Alloc ------------------------------`);
    
    self.generateExpression(expr.size, 'condition'); 
    
    // Hitung total Box yang dibutuhkan: (Jumlah Elemen + 1 untuk Header)
    self.emit(`mov edx, ecx`);
    self.emit(`add edx, 1                  ; edx = total Box (n + 1)`);

    self.emit(`shl edx, 3                  ; edx = edx * 8 (geser kiri 3 bit sama dengan dikali 8)`);
    self.blank(1);

    // Amankan ECX (nilai n) ke stack sebelum melakukan pemanggilan fungsi/macro arena
    self.emit(`push ecx`);
    
    // Panggil fungsi allocator milikmu (disesuaikan dengan arsitektur compiler-mu)
    // Di sini kita asumsikan self.allocBox bisa menerima jumlah box secara dinamis, 
    // atau jika menggunakan system call/helper assembly:
    self.emit(`push edx                    ; kirim total Box sebagai argumen`);
    self.emit(`call arena_alloc            ; panggil alokasi arena heap`);
    self.emit(`add esp, 4                  ; bersihkan argumen dari stack`);
    
    // Sekarang EAX berisi Base Address (alamat awal) dari Array baru di Arena Heap!
    self.emit(`pop ecx                     ; kembalikan nilai ukuran array (n) ke ECX`);
    self.blank(1);

    self.emit(`mov dword [eax], ecx        ; masukkan nilai panjang`);
    self.emit(`mov dword [eax + 4], 3      ; masukkan tipe data array sebagai 3`);

    self.emit(`; Delegasikan pembersihan sisa slot elemen kosong ke runtime`);
    self.emit(`call init_array_elements    ; EAX = base array, ECX = panjang`);
    self.blank(1);

    self.emit(`; ------------------------------ End Array Alloc ------------------------------`);

    // Kembalikan metadata info bahwa hasilnya adalah objek boxed (Array Dinamis)
    return { box: true, val: null };
}

module.exports = generateArrayAlloc;