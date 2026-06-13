%include "/home/hamm/Documents/aiko_js_fullstack/aiko_js/stdlib/stdio.asm"
section .data
	str_0 db "t", 0    ; buat variabel string global bernama str_0 dengan tipe byte
	str_1 db "e", 0    ; buat variabel string global bernama str_1 dengan tipe byte
	str_2 db "s", 0    ; buat variabel string global bernama str_2 dengan tipe byte
	str_3 db "1", 0    ; buat variabel string global bernama str_3 dengan tipe byte
	str_4 db "2", 0    ; buat variabel string global bernama str_4 dengan tipe byte

section .bss

section .text
    global _start

_start:
    push ebp
    mov ebp, esp
    call arena_init

    push 48    ; ------------------------------ alokasi untuk 6 element ------------------------------
    call arena_alloc
    add esp, 4
    mov dword [eax], 5
    mov dword [eax + 4], 3    ; masukkan tipe data dari value, yaitu array sebagai 3
    mov dword [eax + 8], str_0
    mov dword [eax + 12], 1    ; masukkan tipe data dari value, yaitu string
    mov dword [eax + 16], str_1
    mov dword [eax + 20], 1    ; masukkan tipe data dari value, yaitu string
    mov dword [eax + 24], str_2
    mov dword [eax + 28], 1    ; masukkan tipe data dari value, yaitu string
    mov dword [eax + 32], str_3
    mov dword [eax + 36], 1    ; masukkan tipe data dari value, yaitu string
    mov dword [eax + 40], str_4
    mov dword [eax + 44], 1    ; masukkan tipe data dari value, yaitu string
    ; ------------------------------ Start Deklarasi variabel kata ------------------------------
    sub esp, 4
    mov dword [ebp - 4], eax    ; pindahkan alamat Box* ke dalam offset 4
    ; ------------------------------ End Deklarasi variabel kata ------------------------------


    ; ------------------------------ Start Ambil offset variabel kata ------------------------------
    mov eax, [ebp - 4]    ; eax = Box*
    ; ------------------------------ End Ambil offset variabel kata ------------------------------


    ; ------------------------------ Start Print ------------------------------
    push dword [eax + 12]    ; push tipe data variabel: kata
    push dword [eax + 8]    ; push nilai variabel: kata
    call print_generic    ; panggil fungsi untuk menampilkan nilai
    add esp, 8    ; pop argument dari stack
    call newline    ; untuk memanggil enter
    ; ------------------------------ End Print ------------------------------


        ; ------------------------------ Start Literal ------------------------------
        push 8    ; ------------------------------ alokasi untuk 1 element ------------------------------
        call arena_alloc
        add esp, 4
        mov dword [eax], 0    ; alamat dalam register eax = 0
        mov dword [eax + 4], 0    ; tipe data = angka sebagai 0
        ; ------------------------------ End Literal ------------------------------


        ; ------------------------------ Start Deklarasi variabel i ------------------------------
        sub esp, 4
        mov dword [ebp - 8], eax    ; pindahkan alamat Box* ke dalam offset 8
        ; ------------------------------ End Deklarasi variabel i ------------------------------


        push esi    ; preserve ESI (end_value for_0)
        push edi    ; preserve EDI (step_value for_0)
        ; --- Evaluasi End Expression ---
        mov esi, 5    ; esi = end
        ; --- Evaluasi Step Expression ---
        mov edi, 1    ; default step = 1
        ; --- Auto-Flip Step Direction ---
        ; ------------------------------ Start Ambil offset variabel i ------------------------------
        mov eax, [ebp - 8]    ; eax = Box*
        ; ------------------------------ End Ambil offset variabel i ------------------------------


        mov eax, [eax]    ; eax = nilai start
        cmp eax, esi
        je for_0_end    ; start == end, skip
        jl for_0_no_flip ; start < end, step harus positif
        cmp edi, 0
        jl for_0_no_flip ; step sudah negatif, ok
        neg edi           ; flip step ke negatif
        for_0_no_flip:
        ; ----- Start Loop For 0 -----
        for_0_check:
        ; ------------------------------ Start Ambil offset variabel i ------------------------------
        mov eax, [ebp - 8]    ; eax = Box*
        ; ------------------------------ End Ambil offset variabel i ------------------------------


        mov eax, [eax]
        sub eax, esi    ; counter - end
        imul eax, edi   ; * step (negatif = belum selesai)
        jge for_0_end
        for_0_body:
            ; ------------------------------ Start GenerateArrayAccess ------------------------------
            ; ------------------------------ Start Ambil offset variabel i ------------------------------
            mov eax, [ebp - 8]    ; eax = Box*
            ; ------------------------------ End Ambil offset variabel i ------------------------------


            mov ecx, [eax]    ; pindahkan nilai index ke ecx
            push ecx
            ; ------------------------------ Start Ambil offset variabel kata ------------------------------
            mov eax, [ebp - 4]    ; eax = Box*
            ; ------------------------------ End Ambil offset variabel kata ------------------------------


            pop ecx
            call get_element
            ; ------------------------------ End GenerateArrayAccess ------------------------------



            ; ------------------------------ Start Print ------------------------------
            push dword [eax + 4]    ; push tipe data 
            push dword [eax]    ; push nilai 
            call print_generic    ; panggil fungsi untuk menampilkan nilai
            add esp, 8    ; pop argument dari stack
            call newline    ; untuk memanggil enter
            ; ------------------------------ End Print ------------------------------


        for_0_update:
        ; ------------------------------ Start Ambil offset variabel i ------------------------------
        mov eax, [ebp - 8]    ; eax = Box*
        ; ------------------------------ End Ambil offset variabel i ------------------------------


        add dword [eax], edi    ; counter += step
        jmp for_0_check
        for_0_end:
        pop edi    ; restore EDI
        pop esi    ; restore ESI
        ; ----- End Loop For 0 -----
        ; free alamat heap variabel i
        add esp, 4    ; bersihkan dari stack (scope.js)

    mov esp, ebp
    pop ebp

    mov eax, 1
    xor ebx, ebx
    int 0x80

