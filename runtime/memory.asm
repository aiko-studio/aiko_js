section .bss
    ; Ekspos variabel BSS jika ada file lain yang perlu membacanya
    global ARENA_BASE
    global ARENA_CAPACITY
    global ARENA_OFFSET
    
    ARENA_BASE resd 1
    ARENA_CAPACITY resd 1
    ARENA_OFFSET resd 1


section .text
    global alloc
    global dealloc
    global arena_init
    global arena_alloc
    global arena_mark
    global arena_rewind

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



