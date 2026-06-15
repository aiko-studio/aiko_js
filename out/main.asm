%include "/home/hamm/Documents/aiko_js_fullstack/aiko_js/runtime/runtime.inc"
section .data

section .bss

section .text
    global _start

_start:
    push ebp
    mov ebp, esp
    call arena_init

    ; ------------------------------ Start Literal ------------------------------
    push 8    ; ------------------------------ alokasi untuk 1 element ------------------------------
    call arena_alloc
    add esp, 4
    mov dword [eax], 19    ; alamat dalam register eax = 19
    mov dword [eax + 4], 0    ; tipe data = angka sebagai 0
    ; ------------------------------ End Literal ------------------------------


    ; ------------------------------ Start Deklarasi variabel x ------------------------------
    sub esp, 4
    mov dword [ebp - 4], eax    ; pindahkan alamat Box* ke dalam offset 4
    ; ------------------------------ End Deklarasi variabel x ------------------------------


    ; ------------------------------ Start Ambil offset variabel x ------------------------------
    mov eax, [ebp - 4]    ; eax = Box*
    ; ------------------------------ End Ambil offset variabel x ------------------------------


    ; --- Pass-by-Value: Copying argument 0 ---
    push eax            ; Simpan alamat Box asli sementara
    push 8    ; ------------------------------ alokasi untuk 1 element ------------------------------
    call arena_alloc
    add esp, 4
    pop ebx             ; EBX = Alamat Box asli
    mov ecx, [ebx]      ; Ambil value
    mov [eax], ecx      ; Masukkan ke Box baru
    mov ecx, [ebx + 4]  ; Ambil type
    mov [eax + 4], ecx  ; Masukkan ke Box baru
    push eax    ; push arg 0
    call fun_checkAddr
    add esp, 4    ; bersihkan dari stack
    ; ------------------------------ Start View (Address Of) ------------------------------
    ; ------------------------------ Start Ambil offset variabel x ------------------------------
    mov eax, [ebp - 4]    ; eax = Box*
    ; ------------------------------ End Ambil offset variabel x ------------------------------


    push eax    ; Simpan alamat target yang mau di-view
    ; Alokasikan 8 byte untuk Box baru hasil view
    push 8    ; ------------------------------ alokasi untuk 1 element ------------------------------
    call arena_alloc
    add esp, 4
    pop ebx     ; EBX = Alamat asli yang di-view
    mov [eax], ebx ; Simpan alamat ke dalam value Box hasil
    mov dword [eax + 4], 4 ; Set tipe Box hasil menjadi INT
    ; ------------------------------ End View ------------------------------


    ; ------------------------------ Start Print ------------------------------
    push dword [eax + 4]    ; push tipe data 
    cmp dword [eax + 4], 3  ; Cek apakah tipe datanya = 3 (Array)?
    je .is_array_print_11922          ; Jika Ya, lompat ke penanganan Array


    push dword [eax]        ; push nilai primitif (literal)
    jmp .do_print_11922         ; lewati blok array, langsung print


    .is_array_print_11922:
    push eax                ; push POINTER referensi (literal)


    .do_print_11922:
    call print_generic    ; panggil fungsi untuk menampilkan nilai
    add esp, 8    ; pop argument dari stack
    call newline    ; untuk memanggil enter
    ; ------------------------------ End Print ------------------------------



    mov esp, ebp
    pop ebp

exit_program:
    mov eax, 1
    xor ebx, ebx
    int 0x80

; ------------------------------ Start Deklarasi fungsi checkAddr ------------------------------
fun_checkAddr:
    push ebp    ; buat stack frame baru
    mov ebp, esp
    call arena_mark    ; Ambil posisi arena saat ini ke eax
    push eax           ; Simpan mark ke stack di [ebp - 4]


    ; ------------------------------ Start View (Address Of) ------------------------------
    ; ------------------------------ Start Ambil offset variabel x ------------------------------
    mov eax, [ebp - 4]    ; eax = Box*
    ; ------------------------------ End Ambil offset variabel x ------------------------------


    push eax    ; Simpan alamat target yang mau di-view
    ; Alokasikan 8 byte untuk Box baru hasil view
    push 8    ; ------------------------------ alokasi untuk 1 element ------------------------------
    call arena_alloc
    add esp, 4
    pop ebx     ; EBX = Alamat asli yang di-view
    mov [eax], ebx ; Simpan alamat ke dalam value Box hasil
    mov dword [eax + 4], 4 ; Set tipe Box hasil menjadi INT
    ; ------------------------------ End View ------------------------------


    ; ------------------------------ Start Print ------------------------------
    push dword [eax + 4]    ; push tipe data 
    cmp dword [eax + 4], 3  ; Cek apakah tipe datanya = 3 (Array)?
    je .is_array_print_76094          ; Jika Ya, lompat ke penanganan Array


    push dword [eax]        ; push nilai primitif (literal)
    jmp .do_print_76094         ; lewati blok array, langsung print


    .is_array_print_76094:
    push eax                ; push POINTER referensi (literal)


    .do_print_76094:
    call print_generic    ; panggil fungsi untuk menampilkan nilai
    add esp, 8    ; pop argument dari stack
    call newline    ; untuk memanggil enter
    ; ------------------------------ End Print ------------------------------




fun_checkAddr_exit:
    push eax           ; amankan return value fungsi (di eax)
    mov eax, [ebp - 4] ; ambil kembali arena mark khusus fungsi ini
    call arena_rewind  ; bersihkan memori arena fungsi ini
    pop eax            ; kembalikan return value fungsi
    ; free alamat heap variabel value




    mov esp, ebp    ; bersihkan stack frame saat fungsi selesai
    pop ebp
    ret
    ; ------------------------------ End Deklarasi fungsi checkAddr ------------------------------