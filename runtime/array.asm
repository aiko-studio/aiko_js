section .data
    msg_oob db "Error: Array Index Out of Bounds: index = ", 0
    msg_oob_arr_len db ", length = ", 0
    msg_oob_newline db 10, 0

section .text
    global check_bound
    global get_element
    global return_copy_value
    global init_array_elements
    global array_push
    global array_pop

    extern print_str
    extern print_int

    extern arena_alloc

; -----------------------------------------------------------
; Fungsi: check_bound
; Argumen: 
;   EAX = Alamat Base Array (yang ada Header Size-nya)
;   ECX = Index yang mau diakses
; -----------------------------------------------------------
check_bound:
    push edx        ; Simpan EDX karena kita mau pakai, nanti dikembalikan
    
    ; 1. Ambil Size dari Header Array (offset 0)
    mov edx, [eax]  
    
    ; 2. Cek apakah Index < 0 (Signed check)
    cmp ecx, 0
    jl .panic_oob   ; Jika kurang dari 0, error
    
    ; 3. Cek apakah Index >= Size
    cmp ecx, edx
    jge .panic_oob  ; Jika index lebih besar/sama dengan size, error
    
    ; 4. Jika aman, kembalikan register dan return
    pop edx
    ret

.panic_oob:
    push edx
    push ecx
    ; Print Error Message
    mov ecx, msg_oob    
    call print_str 
    
    call print_int
    add esp, 4

    mov ecx, msg_oob_arr_len    
    call print_str 

    call print_int
    add esp, 4

    mov ecx, msg_oob_newline
    call print_str
    
    ; Exit Program (Syscall Exit)
    mov eax, 1      ; sys_exit
    mov ebx, 1      ; error code 1
    int 0x80








; -----------------------------------------------------------
; Fungsi: get_element
; Argumen: 
;   EAX = Alamat Box (Array Base atau String Base)
;   ECX = Index yang mau diakses
; Output:
;   EAX = Alamat Box baru (berisi karakter) ATAU elemen array
; -----------------------------------------------------------
get_element:
    push ebp
    mov ebp, esp
    
    push ebx        ; Simpan EBX karena kita mau pakai untuk menampung ASCII
    push edx        ; Simpan EDX untuk pointer data

    ; Cek tipe data dari Box Base (offset 4)
    cmp dword [eax + 4], 1
    je .is_string   ; Jika tipe = 1 (String), lompat ke logika string

.is_array:
    ; Logika jika tipe adalah Array
    call check_bound    ; Pengecekan batas array (akan panic jika out-of-bounds)
    
    imul ecx, 8         ; Hitung offset (Index * 8 byte per elemen)
    add eax, ecx        ; EAX = Base Array + Offset
    add eax, 8          ; Lewati Header Size Array (8 byte pertama)
    jmp .done           ; Selesai, langsung lompat ke akhir

.is_string:
    ; Logika jika tipe adalah String
    mov edx, [eax]          ; Ambil pointer ke awal literal string ("tes12")
    add edx, ecx            ; Tambahkan index ke pointer string (Base + Index)
    movzx ebx, byte [edx]   ; Ambil 1 byte karakter (ASCII) dan masukkan ke EBX
    
    ; Persiapan alokasi memori untuk karakter yang diambil
    push ebx                ; Amankan nilai ASCII di stack
    push ecx                ; Amankan index di stack

    ; Alokasi 8 byte untuk Box baru menggunakan Arena
    push 8           
    call arena_alloc
    add esp, 4              ; Bersihkan argumen arena_alloc dari stack

pop ecx                 ; Kembalikan index
    pop ebx                 ; Kembalikan nilai ASCII

    mov byte [eax], bl      ; Byte ke-0: karakter ASCII
    mov byte [eax + 1], 0   ; Byte ke-1: null-terminator (0)

    push eax                ; Amankan pointer string baru yang ada di EAX ke stack
    
    push 8                  ; Alokasi 8 byte untuk Box
    call arena_alloc
    add esp, 4              ; Stack cleanup

    pop edx                 ; Ambil kembali pointer string baru dari stack ke EDX

    ; Isi Box baru dengan data karakter
    mov dword [eax], edx    ; Masukkan nilai ASCII ke dalam nilai Box
    mov dword [eax + 4], 1  ;

.done:
    ; Kembalikan register awal dan return
    pop edx
    pop ebx
    mov esp, ebp
    pop ebp
    ret








; ============================================
; return_copy_value (Versi Flat Memory Box)
; In : ESI = pointer Box lama (sumber)
;      EDI = pointer Box baru (tujuan, sudah dialokasikan)
; Out : Box baru terisi penuh (termasuk seluruh elemen jika array)
; Clobbers: EAX, EBX, ECX, EDX
; Preserved: ESI, EDI
; ============================================
return_copy_value:
    push ebx
    push ecx
    push edx
    push esi                ; Amankan ESI original
    push edi                ; Amankan EDI original

    mov ecx, [esi+4]        ; Ambil len_type / type dari box lama
    cmp ecx, 3              ; Apakah tipe data = 3 (Array)?
    je .is_array

    ; --- NON-ARRAY (Primitive standard 8 byte: val + type) ---
    mov ecx, [esi]          ; Salin value
    mov [edi], ecx
    mov ecx, [esi+4]        ; Salin type
    mov [edi+4], ecx
    jmp .done

.is_array:
    ; --- FLAT ARRAY DEEP COPY ---
    ; Karena Box Baru (EDI) saat di handleReturn cuma dialokasikan 8 byte,
    ; padahal kita butuh space sebesar TOTAL UKURAN ARRAY LAMA,
    ; maka kita harus mengalokasikan ulang memori yang pas untuk EDI!

    mov ebx, [esi]          ; ebx = jumlah elemen (len)
    imul ebx, 8             ; ebx = len * 8 (ukuran seluruh elemen)
    add ebx, 8              ; ebx = (len * 8) + 8 (ditambah header len & len_type)
    ; Sekarang EBX berisi total bytes dari seluruh struktur array lama

    push ebx                ; Push ukuran total sebagai argumen arena_alloc
    call arena_alloc
    add esp, 4
    ; EAX sekarang berisi alamat memori BARU yang ukurannya muat untuk array ini

    ; Salin alamat memori baru ini ke tempat EDI yang asli
    ; Agar fungsi pemanggil (handleReturn) mendapatkan pointer yang benar di EAX
    mov edx, [esp]          ; Mengambil nilai EDI original dari stack tanpa pop (esp menunjuk ke EDI)
    ; Catatan: Karena kita ingin mengembalikan EAX sebagai alamat array baru, 
    ; kita simpan dulu EAX ke slot EDI di stack agar saat 'pop edi' nanti, EDI/EAX sinkron.
    mov [esp], eax          

    mov edi, eax            ; EDI sekarang menunjuk ke block baru hasil alloc
    mov ecx, ebx            ; ECX = total bytes yang akan di-copy
    cld
    rep movsb               ; Salin total bytes dari ESI ke EDI secara linear
    
.done:
    pop edi                 ; Mengembalikan EDI (sekarang berisi alamat array baru jika array)
    pop esi
    pop edx
    pop ecx
    pop ebx
    
    ; Pastikan EAX selalu berisi alamat Box Baru agar bersahabat dengan handleReturn
    mov eax, edi            
    ret







; -----------------------------------------------------------------------------
; Fungsi: init_array_elements
; Input:
;    EAX = Alamat Base Array (Pointer hasil arena_alloc)
;    ECX = Jumlah elemen array (n)
; Output:
;    EAX = Tetap dipertahankan berisi Alamat Base Array
; Clobbers: EDX
; -----------------------------------------------------------------------------
init_array_elements:
    push ebp
    mov ebp, esp
    push edx

    mov edx, 1                  ; edx = counter indeks loop (mulai dari box ke-1)

.loop:
    cmp edx, ecx                ; Apakah counter edx > jumlah elemen (ecx)?
    jg .done                    ; Jika iya, keluar dari loop

    ; Hitung offset memori dinamis saat runtime: [eax + edx * 8]
    mov dword [eax + edx * 8], 0     ; set nilai default elemen = 0
    mov dword [eax + edx * 8 + 4], 0 ; set tipe default elemen = angka/null (0)

    inc edx                     ; edx++
    jmp .loop

.done:
    pop edx
    mov esp, ebp
    pop ebp
    ret














; -----------------------------------------------------------------------------
; Fungsi: array_push
; Input:
;    EAX = Alamat Base Array (Flat Memory Box)
;    [ESP + 4] = Nilai baru (Value)
;    [ESP + 8] = Tipe nilai baru (Type)
; Output:
;    Mengubah struktur array secara in-place (ukuran bertambah)
; -----------------------------------------------------------------------------
array_push:
    push ebp
    mov ebp, esp
    push ebx
    push ecx
    push edx
    push esi
    push edi

    mov ebx, eax                ; EBX = Alamat Base Array
    mov ecx, [ebx]              ; ECX = Current Length (dari header offset 0)

    ; Catatan Penting: Karena ini adalah model flat memory, 
    ; penambahan elemen secara dinamis idealnya membutuhkan realloc / penambahan kapasitas memori arena.
    ; Di bawah ini adalah logika penulisan langsung pada ruang kosong setelah elemen terakhir:
    
    ; Hitung offset target elemen baru: (Current Length * 8) + 8 (header)
    mov edx, ecx
    shl edx, 3                  ; EDX = Current Length * 8
    add edx, ebx                ; EDX = Alamat Base Array + Offset Elemen
    add edx, 8                  ; EDX = Lewati Header (8 byte pertama)

    ; Ambil parameter nilai baru dari stack frame [ebp + 8] dan [ebp + 12]
    mov esi, [ebp + 8]          ; ESI = Value baru
    mov edi, [ebp + 12]         ; EDI = Type baru

    ; Tulis nilai ke memori flat array
    mov [edx], esi              ; data[current_length].value = value
    mov [edx + 4], edi          ; data[current_length].type = type

    ; Increment Header Size Array
    inc ecx
    mov [ebx], ecx              ; Update Header Size baru

    pop edi
    pop esi
    pop edx
    pop ecx
    pop ebx
    mov esp, ebp
    pop ebp
    ret





















; -----------------------------------------------------------------------------
; Fungsi: array_pop
; Input:
;    EAX = Alamat Base Array (Flat Memory Box)
; Output:
;    EAX = Alamat Box Baru hasil alokasi baru yang berisi nilai elemen terakhir
; -----------------------------------------------------------------------------
array_pop:
    push ebp
    mov ebp, esp
    push ebx
    push ecx
    push edx

    mov ebx, eax                ; EBX = Alamat Base Array
    mov ecx, [ebx]              ; ECX = Current Length dari header

    ; Proteksi jika array kosong (Length == 0)
    cmp ecx, 0
    je .pop_empty

    ; Index elemen terakhir adalah (Length - 1)
    dec ecx
    mov [ebx], ecx              ; Kurangi dan update ukuran di header array

    ; Hitung lokasi memori elemen terakhir tersebut: (Index * 8) + 8
    mov edx, ecx
    shl edx, 3                  ; EDX = Index * 8
    add edx, ebx
    add edx, 8                  ; EDX = Alamat elemen terakhir di flat array

    ; Ambil data value dan type dari elemen tersebut
    mov ebx, [edx]              ; EBX = Value
    mov ecx, [edx + 4]          ; ECX = Type

    ; Alokasikan Flat Box Baru berukuran 8 byte untuk membungkus nilai return
    push ecx                    ; Amankan type
    push ebx                    ; Amankan value
    push 8                      ; Argument ukuran alokasi arena
    call arena_alloc
    add esp, 4                  ; Bersihkan argument 8 byte
    pop ebx                     ; Kembalikan value
    pop ecx                     ; Kembalikan type

    ; Isi Box Baru hasil alokasi arena_alloc (alamat di EAX)
    mov [eax], ebx              ; Box baru value
    mov [eax + 4], ecx          ; Box baru type
    jmp .pop_done

.pop_empty:
    ; Jika array kosong, buat Box Null/0 standard
    push 8
    call arena_alloc
    add esp, 4
    mov dword [eax], 0          ; Value default 0
    mov dword [eax + 4], 0      ; Type default 0 (Integer/Null)

.pop_done:
    pop edx
    pop ecx
    pop ebx
    mov esp, ebp
    pop ebp
    ret