; untuk algoritma algoritma pindahkan ke file masing masing, misal aray ke array, linkedlist ke linkedlist, jangan digabung, tapi buat mereka support ke final stdio

; keknya lebih baik menetapkan ukuran:
; char 1 byte
; float, int 4 byte

section .data
    msg db "hello", 0
    nwln db 0xA, 0
    msg_oob db "Error: Array Index Out of Bounds: index = ", 0
    msg_oob_arr_len db ", length = ", 0
    msg_oob_newline db 10, 0

section .bss
    buffer_itoa resb 11
    temp_byte resb 1         ; alokasi 1 byte untuk penyimpanan sementara

    ARENA_BASE resd 1
    ARENA_CAPACITY resd 1
    ARENA_OFFSET resd 1

section .text
    global newline
    global strlen
    global strcmp
;    global print_str
;    global itoa
;    global print_int
    global scan_int
    global scan_str
    global alloc
    global dealloc
    global string_equal
    global print_generic
    global typeof
    global check_bound


; ======================================== NEWLINE ========================================
newline:
    mov eax, 4
    mov ebx, 1
    mov ecx, nwln
    mov edx, 1
    int 0x80
    ret


; ======================================== STRLEN ========================================
strlen:
    push esi
    xor edx, edx
    mov esi, [esp + 8]          ; kalau esp + 4  itu untuk esi, makanya pakai 8, ingat esp letaknya dipaling atas stack

.search_len:
    mov al, byte [esi + edx]
    cmp al, 0
    je .exit_len

    inc edx
    jmp .search_len

.exit_len:
    pop esi
    ret





; ======================================== STRCMP ========================================
strcmp:
    push ebp
    mov ebp, esp
    push esi
    push edi

    mov esi, [ebp + 12]                     ; arg 1
    mov edi, [ebp + 8]                      ; arg 2
    xor eax, eax

.compare:
    mov al, [esi]
    mov bl, [edi]
    cmp al, bl
    jne .not_equal                                  ; tidak sama

    test al, al                                     ; apakah sudah  \0
    jz .equal                                      ; sama

    inc esi
    inc edi
    jmp .compare

.not_equal:
    movzx eax, al
    movzx ebx, bl
    sub eax, ebx                                    ; s1[i] - s2[i]
    jmp .exit_cmp

.equal:
    xor eax, eax

.exit_cmp:
    pop edi
    pop esi
    mov esp, ebp
    pop ebp
    ret





; ======================================== PRINT STR ========================================
print_str:
    push ecx
    call strlen
    pop ecx

    mov eax, 4
    mov ebx, 1
    int 0x80
    ret





; ======================================== ITOA ========================================
itoa:
    push ebp
    mov ebp, esp
    push esi

    mov esi, 9
    mov eax,[ebp + 8]                      ; ebp + 8 untuk parameter pertama karena ebp + 4 return address
    mov ebx, 10

    mov [buffer_itoa + 11], byte 0

.loop_itoa:
    xor edx, edx
    div ebx
    add dl, '0'
    mov [buffer_itoa + esi], dl

    dec esi
    cmp eax, 0
    jne .loop_itoa

    inc esi
    lea eax, [buffer_itoa + esi]            ; menunjuk ke alamat awal string

    pop esi
    mov esp, ebp
    pop ebp
    ret






; ======================================== PRINT INT ========================================
print_int:
    mov eax, [esp + 4]                      ; Ambil parameter dari stack, soalnya esp saat pemanggilan print int itu menunjuk ke return address print int
    push eax                                ; Siapkan parameter untuk itoa
    call itoa
    add esp, 4                              ; Bersihkan stack dari parameter untuk itoa
    mov ecx, eax
    call print_str
    ret









; ======================================== SCAN_STR ========================================
scan_str:
    push ebp
    mov ebp, esp
    push esi

    mov eax, 3
    mov ebx, 0
    mov ecx, [ebp + 12]                             ; variabel
    mov edx, [ebp + 8]                              ; len
    int 0x80

    ; cek apakah ukuran 0, karna ukuran akan disimpan di eax
    test eax, eax
    jle .exit_scan_str

    mov esi, ecx
    add esi, eax
    dec esi                                         ; akhir buffer, cari \n, ubah jadi \0

    cmp byte [esi], 0xA
    jne .exit_scan_str
    mov byte [esi], 0

.exit_scan_str:
    pop esi
    mov esp, ebp
    pop ebp
    ret



; ======================================== STOI ========================================
stoi:
    push ebp
    mov ebp, esp
    push esi

    xor edx, edx
    xor ecx, ecx
    mov esi, [ebp + 8]
    
.loop_stoi:
    mov al, [esi + ecx]
    cmp al, 0
    je .exit_stoi

    sub al, '0'
    imul edx, edx, 10
    add edx, eax                                 ; edx = edx * 10 + al
    
    inc ecx
    jmp .loop_stoi

.exit_stoi:
    mov eax, edx
    pop esi
    mov esp, ebp
    pop ebp
    ret




; ======================================== SCAN_INT ========================================
scan_int:
    push ebp
    mov ebp, esp

    ; input string
    push buffer_itoa
    push 11
    call scan_str
    add esp, 8                                      ; untuk menghapus 2 args

    ; stack :
    ; new new ebp
    ; return scan str
    ; push len (disini 11)
    ; push buffer itoa (untuk buffer str)
    ; new ebp
    ; return scan int
    ; addr angka



    ; stoi
    ; ubah ke angka, hasil di eax
    ; karna hasil buffer_itoa di ecx, langsung push saja
    push ecx
    call stoi
    add esp, 4                                      ; menghapus 1 args, hasil di eax
    

    ; stack :
    ; new new ebp
    ; return scan stoi
    ; push buffer itoa (untuk buffer str)
    ; new ebp
    ; return scan int
    ; addr angka


    mov [ebp + 8], eax                             ; pindahkan nilai di eax ke alamat variabel int

    mov esp, ebp
    pop ebp
    ret






; ======================================== STRCPY ========================================
strcpy:
    push ebp
    mov ebp, esp
    push esi
    push edi

    mov esi, [ebp + 12]                 ; arg 1 : destination
    mov edi, [ebp + 8]                  ; source

.loop_cpy:
    mov al, [edi]                       ; ambil perhuruf
    cmp al, 0
    je .exit_cpy

    mov [esi], al

    inc esi
    inc edi
    jmp .loop_cpy

.exit_cpy:
    pop edi
    pop esi
    mov esp, ebp
    pop ebp
    ret







; ======================================== ALLOC ========================================
alloc:
    push ebp
    mov ebp, esp
    
    push ebx    ; Amankan ebx
    push ecx    ; Amankan ecx
    push edx    ; Amankan edx
    push esi    ; Amankan esi
    push edi    ; Amankan edi
    
    mov eax, 192                ; sys_mmap2
    xor ebx, ebx                ; addr = 0 (os pilih lokasi)
    mov ecx, [ebp + 8]          ; panjang dalam byte
    mov edx, 0x3                ; read write
    mov esi, 0x22
    mov edi, -1
    int 0x80

    pop edi     ; Kembalikan nilai asli
    pop esi
    pop edx
    pop ecx
    pop ebx

    mov esp, ebp
    pop ebp
    ret



; ======================================== DEALLOC ========================================
dealloc:
    push ebp
    mov ebp, esp

    mov eax, 91
    mov ebx, [ebp + 8]
    mov ecx, [ebp + 12]
    int 0x80

    mov esp, ebp
    pop ebp
    ret



string_equal:
    push ebp
    mov ebp, esp
    mov esi, [ebp+8]  ; arg1
    mov edi, [ebp+12] ; arg2

.loop:
    mov al, [esi]
    mov bl, [edi]
    cmp al, bl
    jne .not_equal
    test al, al
    je .equal
    inc esi
    inc edi
    jmp .loop

.equal:
    mov eax, 1
    pop ebp
    ret

.not_equal:
    mov eax, 0
    pop ebp
    ret






typeof:
    push ebp
    mov ebp, esp

    mov esi, [ebp + 8]
    cmp esi, 0
    je .is_int

    cmp esi, 1
    je .is_str

    cmp esi, 2
    je .is_bool

    ; jne kalau perlu
    
.is_int:
    mov eax, 0
    jmp .exit_typeof

.is_str:
    mov eax, 1
    jmp .exit_typeof

.is_bool:
    mov eax, 2

.exit_typeof:
    mov esp, ebp
    pop ebp
    ret




input_string:
    push ebp
    mov ebp, esp

    mov esi, [ebp+8]    ; buffer pointer
    mov edi, esi        ; simpan pointer awal

.loop:
    mov eax, 3          ; syscall read
    mov ebx, 0          ; stdin
    mov ecx, temp_byte  ; baca ke byte sementara
    mov edx, 1
    int 0x80

    cmp byte [temp_byte], 10  ; apakah \n?
    je .done

    mov al, [temp_byte] ; ambil byte hasil baca
    mov [esi], al       ; simpan ke buffer
    inc esi             ; maju ke byte selanjutnya
    jmp .loop

.done:
    mov byte [esi], 0   ; tambahkan null terminator
    sub esi, edi        ; hitung panjang string
    mov eax, esi        ; kembalikan panjang
    pop ebp
    ret











print_generic:
    mov eax, [esp + 4]  ; value
    mov bl, [esp + 8]   ; type tag
    cmp bl, 0
    je .do_int
    cmp bl, 1
    je .do_str
    cmp bl, 2
    je .do_bool
    ret

.do_int:
    push eax
    call print_int
    add esp, 4
    ret

.do_str:
    mov ecx, eax
    call print_str
    ret

.do_bool:
    push eax
    call print_int
    add esp, 4
    ret


















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




arena_init:
    push ebp
    mov ebp, esp

    push 67108864
    call alloc
    add esp, 4

    mov [ARENA_BASE], eax
    mov dword [ARENA_CAPACITY], 67108864
    mov dword [ARENA_OFFSET], 0

    mov esp, ebp
    pop ebp
    ret


arena_alloc:
    push ebp
    mov ebp, esp

    push ebx
    mov eax, [ebp + 8]

    mov ebx, [ARENA_OFFSET]
    add ebx, eax
    cmp ebx, [ARENA_CAPACITY]
    ja .fail

    mov edx, [ARENA_BASE]
    add edx, [ARENA_OFFSET] ; lokasi pointer terakhir

    mov [ARENA_OFFSET], ebx
    mov eax, edx

    pop ebx
    mov esp, ebp
    pop ebp
    ret

.fail:
    mov eax, [ebp + 8]
    push eax
    call alloc
    add esp, 4

    pop ebx
    mov esp, ebp
    pop ebp
    ret


arena_rewind:
    mov [ARENA_OFFSET], eax
    ret


arena_mark:
    mov eax, [ARENA_OFFSET]
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