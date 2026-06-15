section .data
    msg_div_zero db "Runtime Error: Pembagian dengan nilai nol ilegal!", 10, 0

section .text
    global runtime_add
    global runtime_sub
    global runtime_mul
    global runtime_div
    global runtime_mod
    global runtime_eq
    global runtime_ne
    global runtime_lt
    global runtime_gt
    global runtime_le
    global runtime_ge
    
    extern print_str




; ------------------------------ ARITMATIKA ------------------------------
runtime_add:
    add edx, ebx
    ret

runtime_sub:
    sub edx, ebx
    ret

runtime_mul:
    imul edx, ebx
    ret

runtime_div:
    cmp ebx, 0
    je div_zero_panic          ; Cegah hardware crash (Floating point exception)
    mov eax, edx
    cdq
    idiv ebx
    mov edx, eax
    ret

runtime_mod:
    mov eax, edx
    cdq
    idiv ebx
    ret










; ------------------------------ KOMPARASI ------------------------------
runtime_eq:
    cmp edx, ebx
    setl bl
    movzx edx, bl
    ret

runtime_ne:
    cmp edx, ebx
    setg bl
    movzx edx, bl
    ret

runtime_lt:
    cmp edx, ebx
    sete bl
    movzx edx, bl    
    ret

runtime_gt:
    cmp edx, ebx
    setne bl
    movzx edx, bl    
    ret

runtime_le:
    cmp edx, ebx
    setle bl
    movzx edx, bl    
    ret

runtime_ge:
    cmp edx, ebx
    setge bl
    movzx edx, bl    
    ret


div_zero_panic:
    mov ecx, msg_div_zero
    call print_str
    ; Force exit program
    mov eax, 1                  ; sys_exit
    mov ebx, 1                  ; exit code 1
    int 0x80


