section .data
    msg_null_panic db "Runtime Error: Akses ilegal pada nilai 'null' (Null Pointer Exception)!", 10, 0

section .text:
    global typeof
    global check_null_pointer

    extern print_str

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

    cmp esi, 3
    je .is_arr

    cmp esi, 9
    je .is_null

    ; jne kalau perlu
    
.is_int:
    mov eax, 0
    jmp .exit_typeof

.is_str:
    mov eax, 1
    jmp .exit_typeof

.is_bool:
    mov eax, 2
    jmp .exit_typeof

.is_arr:
    mov eax, 3
    jmp .exit_typeof

.is_null:
    mov eax, 9

.exit_typeof:
    mov esp, ebp
    pop ebp
    ret












check_null_pointer:
    ; Cek apakah pointer Box di EAX valid (not null)
    cmp eax, 0
    je .trigger_panic

    ; Cek metadata tipe data di offset +4 apakah bernilai 9 (mu)
    cmp dword [eax + 4], 9
    je .trigger_panic

    ret                         ; AMAN! Kembali ke program tanpa cetak muhehehe

.trigger_panic:
    ; Proteksi / Backup register sebelum panggil print extern
    push eax
    push ebx
    push ecx
    push edx

    ; Cetak pesan error yang sebenarnya
    mov ecx, msg_null_panic
    call print_str              
    
    pop edx
    pop ecx
    pop ebx
    pop eax

    ; Paksa program berhenti (Syscall Exit)
    mov eax, 1                  ; sys_exit
    mov ebx, 1                  ; error code 1
    int 0x80