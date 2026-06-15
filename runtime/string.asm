section .text
    global strlen
    global strcmp
    global strcpy
    global string_equal

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


