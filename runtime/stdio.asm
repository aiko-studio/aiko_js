; untuk algoritma algoritma pindahkan ke file masing masing, misal aray ke array, linkedlist ke linkedlist, jangan digabung, tapi buat mereka support ke final stdio

; keknya lebih baik menetapkan ukuran:
; char 1 byte
; float, int 4 byte

section .data
    nwln db 0xA, 0
    nulltxt db "null", 0
    str_open_bracket  db "[", 0
    str_close_bracket db "]", 0
    str_comma         db ", ", 0

    prefix_hex db "0x", 0


section .bss
    buffer_itoa resb 11
    temp_byte resb 1         ; alokasi 1 byte untuk penyimpanan sementara

    buffer_hex resb 9   ; 8 karakter untuk 32-bit hex + 1 null terminator


section .text
    global newline
    global print_str
    global print_int
    global scan_int
    global scan_str
    global input_string
    global print_generic
    global itoa
    global stoi
    global print_array
    global print_hex


    extern strlen

; ======================================== NEWLINE ========================================
newline:
    mov eax, 4
    mov ebx, 1
    mov ecx, nwln
    mov edx, 1
    int 0x80
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
    push edi

    mov esi, 9
    mov eax,[ebp + 8]                      ; ebp + 8 untuk parameter pertama karena ebp + 4 return address
    mov ebx, 10

    xor edi, edi

    cmp eax, 0
    jge .set_null                          ; Jika lebih besar/sama dengan 0, langsung ke set_null
    mov edi, 1                             ; Set flag EDI = 1 (Tandai bahwa ini negatif)
    neg eax                                ; Ubah angka negatif jadi positif agar 'div' bekerja normal

.set_null:
    mov [buffer_itoa + 11], byte 0

.loop_itoa:
    xor edx, edx
    div ebx
    add dl, '0'
    mov [buffer_itoa + esi], dl

    dec esi
    cmp eax, 0
    jne .loop_itoa

    cmp edi, 1                             ; Cek apakah flag negatif tadi aktif?
    jne .done                              ; Kalau tidak, langsung selesai
    mov [buffer_itoa + esi], byte '-'      ; Sisipkan karakter '-'
    dec esi

.done:
    inc esi
    lea eax, [buffer_itoa + esi]            ; menunjuk ke alamat awal string

    pop edi
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
    cmp bl, 3
    je .do_array
    cmp bl, 4
    je .do_ptr

    cmp bl, 9
    je .do_null

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

.do_array:
    push eax
    call print_array
    add esp, 4
    ret

.do_ptr:                
    push eax
    call print_hex
    add esp, 4
    ret

.do_null:
    mov ecx, nulltxt
    call print_str
    ret



print_array:
    push ebp
    mov ebp, esp
    sub esp, 8          ; [ebp-4] = index, [ebp-8] = len
    push esi

    mov esi, [ebp + 8]      ; esi = alamat array (Box*)
    mov eax, [esi]
    mov [ebp - 8], eax       ; simpan len
    mov dword [ebp - 4], 0   ; index = 0

    mov ecx, str_open_bracket
    call print_str

.loop_elem:
    mov eax, [ebp - 4]
    cmp eax, [ebp - 8]
    jge .end_loop

    imul eax, eax, 8
    add eax, 8

    mov ecx, [esi + eax]
    mov edx, [esi + eax + 4]

    push edx
    push ecx
    call print_generic
    add esp, 8

    inc dword [ebp - 4]
    mov eax, [ebp - 4]
    cmp eax, [ebp - 8]
    jge .skip_comma

    mov ecx, str_comma
    call print_str

.skip_comma:
    jmp .loop_elem

.end_loop:
    mov ecx, str_close_bracket
    call print_str

    pop esi
    mov esp, ebp
    pop ebp
    ret








print_hex:
    push ebp
    mov ebp, esp
    push esi
    push edi
    push ebx

    ; 1. Cetak prefix "0x" terlebih dahulu
    mov ecx, prefix_hex
    call print_str

    ; 2. Ambil nilai alamat dari parameter stack
    mov eax, [ebp + 8]  
    mov edi, buffer_hex
    mov ecx, 8          ; Kita akan memproses 8 digit hex (32-bit)

.loop_hex:
    ; Ambil 4 bit paling kiri (High Nibble) dengan berputar memanfaatkan ror
    ror eax, 4
    mov ebx, eax
    and ebx, 0x0F       ; Masking ambil nilai 4 bit saja (0 - 15)

    ; Konversi nilai ke karakter ASCII
    cmp ebx, 10
    jge .letter
    add bl, '0'         ; Jika 0-9
    jmp .store

.letter:
    add bl, 'A' - 10    ; Jika A-F

.store:
    mov [edi], bl       ; Simpan ke buffer_hex
    inc edi
    dec ecx
    jnz .loop_hex

    mov byte [edi], 0   ; Beri null terminator di akhir string

    ; 3. Cetak hasil konversi string hexadecimal-nya
    mov ecx, buffer_hex
    call print_str

    pop ebx
    pop edi
    pop esi
    mov esp, ebp
    pop ebp
    ret