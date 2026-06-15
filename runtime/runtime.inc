; Aiko Standard Library Header

; Operation (operations.asm)
extern runtime_add
extern runtime_sub
extern runtime_mul
extern runtime_div
extern runtime_mod
extern runtime_eq
extern runtime_ne
extern runtime_lt
extern runtime_gt
extern runtime_le
extern runtime_ge

; Memory & Arena (memory.asm)
extern arena_init
extern arena_alloc
extern arena_mark
extern arena_rewind
extern alloc
extern dealloc

; Array & Structures (array.asm)
extern return_copy_value
extern check_bound
extern get_element
extern init_array_elements
extern array_push
extern array_pop

; I/O (stdio.asm)
extern newline
extern print_str
extern print_int
extern print_generic
extern scan_str
extern scan_int
extern input_string
extern itoa
extern stoi
extern print_hex

; String Manipulation (string.asm)
extern strlen
extern strcmp
extern strcpy
extern string_equal

; Types & Runtime Check (types.asm)
extern typeof
extern check_null_pointer