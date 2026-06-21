# Aiko
Aiko adalah compiler sederhana yang dikembangkan dengan JavaScript untuk mengubah kode sumber menjadi bahasa assembly x86. Proyek ini mencakup pembuatan Lexer, Parser (AST), hingga Code Generator.

# Goals
Proyek ini dibuat untuk:

<ul>
  <li>Mempelajari cara kerja compiler dari dasar</li>
  <li>Mengimplementasikan pipeline kompilasi secara manual</li>
  <li>Memahami representasi AST dan transformasi kode</li>
  <li>Mengeksplorasi konsep memory management di level rendah</li>
  <li>Menghasilkan output assembly x86 tanpa dependency compiler eksternal</li>
</ul>


## Alur Kerja

<ul>
  <li>Lexer: Memecah string input menjadi token (kata kunci, operator, literal).</li>
  <li>Parser: Menyusun token menjadi Abstract Syntax Tree (AST) menggunakan teknik Recursive Descent.</li>
  <li>Compiler: Mentranslasi AST menjadi instruksi x86 Assembly (NASM syntax).</li>
</ul>

## Fitur Bahasa

<table>
  <thead>
    <tr>
      <th align="left">Kategori</th>
      <th align="left">Fitur / Sintaksis</th>
      <th align="left">Contoh Kode</th>
      <th align="left">Keterangan / Output</th>
      <th align="left">Detail Internal & Fitur Tersembunyi</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><b>Variabel</b></td>
      <td><code>var</code> (<b>Mutable</b>)<br><code>val</code> (<b>Immutable</b>)</td>
      <td><code>var x = 888;</code><br><code>val newNull = null;</code></td>
      <td><code>var</code> nilainya bisa diubah; <code>val</code> bersifat <b>read-only/konstan</b>.</td>
      <td>Variabel yang dideklarasikan tanpa inisialisasi awal (kosong) otomatis diisi nilai default <code>0</code> oleh compiler.</td>
    </tr>
    <tr>
      <td><b>Tipe Data & Primitif</b></td>
      <td><b>Int</b>, <b>String</b>, <b>Bool</b>, <code>null</code></td>
      <td><code>var z = "coba";</code><br><code>var n = null;</code></td>
      <td>Mendukung pengecekan kesamaan pada tipe data primitif dan <code>null</code>.</td>
      <td><b>Representasi Runtime Type ID:</b><br>• <code>0</code> = <b>Integer</b><br>• <code>1</code> = <b>String</b><br>• <code>2</code> = <b>Boolean</b><br>• <code>null</code> memiliki <b>ID tipe khusus</b> untuk validasi pointer kosong.</td>
    </tr>
    <tr>
      <td><b>Operator Aritmatika</b></td>
      <td><b>Unary</b> & <b>Binary Op</b></td>
      <td><code>10 * 4 / 2 + 1;</code><br><code>print(!!!false);</code></td>
      <td>Mendukung presedensi operator, modulo (<code>%</code>), dan multi-unary (<code>!</code>, <code>-</code>).</td>
      <td>Mendukung operasi matematika bertingkat dengan pemrosesan langsung via register x86 (<b>EDX</b>, <b>EBX</b>, <b>EAX</b>) tanpa bantuan library luar.</td>
    </tr>
    <tr>
      <td><b>Kontrol Alur</b></td>
      <td><code>if</code>, <code>elif</code>, <code>else</code></td>
      <td><code>if x == 10 {} elif x == 9 {} else {}</code></td>
      <td>Percabangan kondisional (menggunakan keyword spesifik <code>elif</code>).</td>
      <td>Ditranslasikan langsung menjadi instruksi perbandingan assembly (<code>cmp</code>) dan lompatan bersyarat (<code>je</code>, <code>jne</code>, <code>jg</code>, dll.).</td>
    </tr>
    <tr>
      <td rowspan="3"><b>Perulangan (For)</b></td>
      <td><b>Range Loop</b> dengan <b>Step</b></td>
      <td><code>for i = 49 .. -10, 20</code></td>
      <td>Loop dari 49 ke -10 dengan langkah (step) mundur sebesar 20.</td>
      <td>Mendukung pencacah naik (<b>increment</b>) maupun turun (<b>decrement</b>) secara dinamis tergantung nilai batas yang diberikan.</td>
    </tr>
    <tr>
      <td><b>For-In</b> (<b>Array Loop</b>)</td>
      <td><code>for item in arr3</code></td>
      <td>Iterasi langsung untuk setiap elemen di dalam array.</td>
      <td>Mengambil panjang array secara internal dan melakukan kalkulasi <b>offset memori</b> secara otomatis di setiap iterasi.</td>
    </tr>
    <tr>
      <td><b>For-In</b> + <code>when</code></td>
      <td><code>for item in arr3 when item > 500</code></td>
      <td><b>Fitur Unggulan:</b> Iterasi array yang langsung difilter dengan kondisi tertentu.</td>
      <td><b>Syntactic Sugar:</b> Generator langsung menyisipkan blok kondisional di dalam perulangan sebelum instruksi pencetakan/proses dieksekusi.</td>
    </tr>
    <tr>
      <td><b>Kontrol Loop</b></td>
      <td><b>Loop Control</b></td>
      <td><code>break;</code> & <code>continue;</code></td>
      <td>Menghentikan perulangan atau melompati iterasi yang sedang berjalan.</td>
      <td>Memanfaatkan label <b>jump</b> assembly unik (misal <code>.loop_end</code> dan <code>.loop_start</code>) yang melacak hierarki perulangan aktif (termasuk <b>nested loop</b>).</td>
    </tr>
    <tr>
      <td rowspan="3"><b>Fungsi (Function)</b></td>
      <td>Tanpa <b>Return</b></td>
      <td><code>fun addParams(a, b) { print(a+b); }</code></td>
      <td>Prosedur standar, mendukung multi-parameter.</td>
      <td>Argumen fungsi di-passing via <b>stack assembly</b>. Variabel lokal dialokasikan menggunakan offset dari Base Pointer (<code>ebp</code>).</td>
    </tr>
    <tr>
      <td>Dengan <b>Return</b></td>
      <td><code>fun res(a) { return a + 1; }</code></td>
      <td>Mengembalikan nilai baik berupa literal, variabel, maupun hasil operasi.</td>
      <td>Nilai kembalian (<b>return value</b>) selalu diletakkan di register utama <code>eax</code> sebelum instruksi <code>ret</code> dipanggil.</td>
    </tr>
    <tr>
      <td><b>Rekursif</b></td>
      <td><code>fun rec(n) { ... return n * rec(n-1); }</code></td>
      <td>Mampu menangani pemanggilan fungsi dirinya sendiri.</td>
      <td>Manajemen <b>call stack</b> x86 yang aman untuk memastikan alamat kembali (<b>return address</b>) dipulihkan dengan benar saat rekursi selesai.</td>
    </tr>
    <tr>
      <td rowspan="4"><b>Array & String</b></td>
      <td><b>Inisialisasi Range</b></td>
      <td><code>var arr = [9 .. 15, 97, 43];</code></td>
      <td>Membuat array dari jangkauan jajaran angka digabung dengan elemen literal.</td>
      <td><b>Array Flattening:</b> Menggabungkan hasil ekspansi jangkauan (range) dan elemen individu menjadi satu kesatuan deret data linear di memori.</td>
    </tr>
    <tr>
      <td><b>Inisialisasi Fixed</b></td>
      <td><code>var arr = array(5);</code></td>
      <td>Alokasi array kosong dengan panjang statis di memori.</td>
      <td>Alokasi memori berurutan (<b>kontigu</b>) sebesar ukuran elemen dikalikan panjang array yang diminta.</td>
    </tr>
    <tr>
      <td>Fungsi <code>len()</code></td>
      <td><code>len(arr)</code></td>
      <td>Mengembalikan jumlah panjang elemen dari sebuah array.</td>
      <td>Membaca <b>metadata ukuran array</b> yang disimpan pada blok memori khusus di awal alokasi array tersebut.</td>
    </tr>
    <tr>
      <td><b>Indexing</b></td>
      <td><code>arr[idx] = 777;</code><br><code>kata[0]</code></td>
      <td>Akses/ubah elemen via index. String bisa diakses per karakter.</td>
      <td><b>Fitur Keamanan Tersembunyi:</b> Kode mencakup pemeriksaan batas indeks (<b>out of bounds checking</b>). Jika melebihi kapasitas, program akan memicu error runtime.</td>
    </tr>
    <tr>
      <td rowspan="3"><b>Fitur Sistem</b></td>
      <td><code>typeof()</code></td>
      <td><code>typeof(tipeInt)</code></td>
      <td>Mengembalikan runtime type indicator.</td>
      <td>Membaca <b>metadata tipe data</b> yang tersimpan di dalam struktur internal data (<b>Box Object</b>) pada offset memori ke-4 (<code>[eax + 4]</code>).</td>
    </tr>
    <tr>
      <td><code>input()</code></td>
      <td><code>input("Angka: ") as int</code></td>
      <td>Menerima input user lewat konsol dengan mekanisme <b>type casting</b>.</td>
      <td>Melakukan pemanggilan sistem (<b>system call</b>) atau fungsi eksternal untuk membaca buffer konsol, lalu mengonversi string input menjadi integer jika ditambahkan klausul <code>as int</code>.</td>
    </tr>
    <tr>
      <td><code>use</code> (<b>Modul Pustaka</b>)</td>
      <td><code>use std.math</code><br><code>math.abs(-79)</code></td>
      <td>Mekanisme penyertaan standar library internal.</td>
      <td><b>Namespace Resolution:</b> Menggabungkan kode atau fungsi eksternal dari pustaka standar ke dalam tabel simbol global compiler saat fase parsing berlangsung.</td>
    </tr>
    <tr>
      <td><b>Low-Level</b></td>
      <td><code>view</code> (<b>Pointer/Memory</b>)</td>
      <td><code>print(view x);</code><br><code>print(view arr[i]);</code></td>
      <td>Menginspeksi alamat memori asli atau referensi variabel.</td>
      <td><b>Direct Pointer Access:</b> Melewati pembungkusan data (<b>Unboxing</b>) dan langsung mengambil nilai alamat memori mentah dari pointer <code>Box*</code> di <code>arena_alloc</code> hanya untuk dicetak atau diinspeksi.</td>
    </tr>
  </tbody>
</table>

---

# Lexer

Lexer ini merupakan Lexical Analyzer untuk memecah input string menjadi token-token. Token-token ini digunakan oleh parser untuk analisis lebih lanjut. Kode ini dilengkapi dengan berbagai fungsi untuk memeriksa karakter dalam input dan mengidentifikasi berbagai elemen kode.

## Fitur
Lexer ini memiliki kemampuan untuk memeriksa dan mengenali:
    Angka: Integer dan float.
    String: Teks yang diapit oleh tanda kutip.
    Identifier: Variabel dan nama fungsi.
    Operator: Seperti +, -, *, /, dll.
    Pembanding dan Penugasan: Seperti =, ==, >=, !=, dll.
    Tanda baca: Seperti ;, ,, (), {}, dll.


## Contoh Penggunaan
Berikut adalah contoh cara menggunakan lexer untuk memeriksa kode input var a = 10; dan mengembalikan token yang sesuai.

```js
var x = 10;
```
Maka akan menghasilkan output: <br/>

```js
[
  { type: 'VAR', value: 'var' },
  { type: 'IDENTIFIER', value: 'a' },
  { type: 'ASSIGN', value: '=' },
  { type: 'INT', value: 10 },
  { type: 'SEMICOLON', value: ';' },
  { type: 'EOF', value: null }
]
```







---

# Parser

Parser ini digunakan untuk mengonversi sekumpulan token yang dihasilkan oleh lexer menjadi struktur yang lebih kompleks, yaitu pohon sintaksis abstrak (AST). Parser menggunakan teknik **recursive descent parsing**, yang memungkinkan untuk menangani berbagai ekspresi dan pernyataan dengan lebih mudah dan terstruktur.

## Fitur
Parser ini memiliki kemampuan untuk:<br/>
* Memproses pernyataan dasar seperti deklarasi variabel, print, dan kontrol alur (if-else, for).<br/>
* Menangani ekspresi matematika, perbandingan, dan pemanggilan fungsi.<br/>
* Membuat dan mengelola fungsi, termasuk pengembalian nilai dan parameter.<br/>
* Menghasilkan AST yang mewakili struktur kode secara hierarkis.<br/>

## Contoh Penggunaan
Berikut adalah contoh cara menggunakan parser untuk memproses kode input dan menghasilkan AST.<br/>

```js
var x = 10;
if x > 5 {
  print(x);
}
```

Hasil AST yang dihasilkan:

```js
ProgramStmt {
  type: 'Program',
  statements: [
    VarDeclStmt {
      type: 'VarDecl',
      name: 'x',
      initializer: LiteralStmt { type: 'Literal', value: 10 }
    },
    IfStmt {
      type: 'If',
      condition: BinaryOpStmt {
        type: 'BinaryOp',
        left: IdentifierStmt { type: 'Identifier', name: 'x' },
        op: '>',
        right: LiteralStmt { type: 'Literal', value: 5 }
      },
      then_block: [
        PrintStmt {
          type: 'Print',
          expression: IdentifierStmt { type: 'Identifier', name: 'x' }
        }
      ],
      elifs: [],
      else_block: null
    }
  ]
}
```

---
# Compiler
Compiler ini bertanggung jawab untuk mengonversi Abstract Syntax Tree (AST) dari kode sumber menjadi kode assembler, serta menangani berbagai jenis pernyataan dan ekspresi dalam kode tersebut. Kode ini mendemonstrasikan cara-cara menangani deklarasi variabel, kontrol alur (seperti `if` dan `for`), serta fungsi (seperti deklarasi fungsi dan pernyataan `return`).

## Fitur
Compiler ini memiliki kemampuan untuk menangani:<br/>
* Deklarasi variabel (termasuk literal dan array).<br/>
* Ekspresi aritmatika dan logika (seperti penambahan, pengurangan, perbandingan, dll.).<br/>
* Pernyataan kontrol seperti `if` dan `for`.<br/>
* Deklarasi dan pemanggilan fungsi.<br/>
* Pencetakan hasil ekspresi (seperti nilai variabel atau hasil perhitungan).<br/>

## Contoh Penggunaan
Berikut adalah contoh cara compiler ini menangani kode sumber yang menggunakan deklarasi variabel, operasi aritmatika, dan perintah `print`.
Misalnya, kode sumber berikut:

```js
var a = 10;
var b = 5;
var c = a + b;
print(c);
```

Compiler akan menghasilkan kode assembler yang mirip dengan ini:

```asm
                           ; ------------------------------ Start Literal ------------------------------
push 8                     ; ------------------------------ alokasi untuk 1 element ------------------------------
call arena_alloc
add esp, 4
mov dword [eax], 10        ; alamat dalam register eax = 10
mov dword [eax + 4], 0     ; tipe data = angka sebagai 0
                           ; ------------------------------ End Literal ------------------------------
                           ; ------------------------------ Start Deklarasi variabel a ------------------------------
sub esp, 4
mov dword [ebp - 4], eax   ; pindahkan alamat Box* ke dalam offset 4
                           ; ------------------------------ End Deklarasi variabel a ------------------------------
                           ; ------------------------------ Start Literal ------------------------------
push 8                     ; ------------------------------ alokasi untuk 1 element ------------------------------
call arena_alloc
add esp, 4
mov dword [eax], 5         ; alamat dalam register eax = 5
mov dword [eax + 4], 0     ; tipe data = angka sebagai 0
                           ; ------------------------------ End Literal ------------------------------
                           ; ------------------------------ Start Deklarasi variabel b ------------------------------
sub esp, 4
mov dword [ebp - 8], eax   ; pindahkan alamat Box* ke dalam offset 8
                           ; ------------------------------ End Deklarasi variabel b ------------------------------
                           ; ------------------------------ Start Binary Op (+) ------------------------------
                           ; ------------------------------ Start Ambil offset variabel a ------------------------------
mov eax, [ebp - 4]         ; eax = Box*
                           ; ------------------------------ End Ambil offset variabel a ------------------------------
mov eax, eax
mov edx, [eax]             ; Unbox left ke EDX
push edx                   ; simpan left value
                           ; ------------------------------ Start Ambil offset variabel b ------------------------------
mov eax, [ebp - 8]         ; eax = Box*
                           ; ------------------------------ End Ambil offset variabel b ------------------------------
mov eax, eax
mov ebx, [eax]             ; Unbox right ke EBX
pop edx                    ; restore left value ke edx
add edx, ebx
                           ; ------------------------------ End Binary Op + ------------------------------
                           ; simpan hasil di box
push edx
push 8                     ; ------------------------------ alokasi untuk 1 element ------------------------------
call arena_alloc
add esp, 4
pop edx
mov [eax], edx
mov dword [eax + 4], 0
                           ; ------------------------------ Start Deklarasi variabel c ------------------------------
sub esp, 4
mov dword [ebp - 12], eax  ; pindahkan alamat Box* ke dalam offset 12
                           ; ------------------------------ End Deklarasi variabel c ------------------------------
```

## Arsitektur Memori & Manajemen Sistem Boxing

Aiko menggunakan runtime **Arena Allocator** kustom untuk mengelola alokasi memori dinamis di dalam *heap* secara linear dan cepat. 

Untuk mendukung fitur seperti *dynamic typing* dan keyword `typeof()`, setiap variabel atau literal dibungkus ke dalam struktur **Box Object** berukuran **8 byte**:

* **Offset 0 (`[eax]`)**: Menyimpan nilai mentah (*Value*) atau pointer data.
* **Offset 4 (`[eax + 4]`)**: Menyimpan **Metadata Type ID** (`0` = Int, `1` = String, `2` = Bool).

Ketika operasi aritmatika (seperti `a + b`) terjadi, compiler akan men-generate instruksi untuk melakukan *Unboxing* (mengambil nilai di offset 0 ke register), memprosesnya, lalu meletakkan kembali hasilnya ke objek sebelumnya.

## Coba Online (Playground)

Anda tidak perlu melakukan setup environment atau menginstal assembler secara lokal untuk mencoba Aiko. Jalankan, modifikasi, dan lihat hasil translasi assembly x86 secara langsung melalui web playground:

<br/>

<a href="https://aikoes.dev" target="_blank" style="text-decoration: none;">
  <div style="background-color: #24292e; color: #ffffff; padding: 16px 24px; border-radius: 8px; border: 1px solid #444c56; display: inline-block; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; box-shadow: 0 4px 12px rgba(0,0,0,0.15); transition: transform 0.2s;">
    <span style="font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #58a6ff; display: block; margin-bottom: 4px; font-weight: bold;">Web Playground</span>
    <span style="font-size: 22px; font-weight: 600; display: flex; align-items: center; gap: 8px;">
      Buka aikoes.dev <span style="font-size: 18px;">➔</span>
    </span>
  </div>
</a>

<br/>
<br/>

---

# Penutup
Aiko adalah proyek yang mengubah kode yang biasa kita tulis menjadi instruksi bahasa mesin (Assembly x86) yang sangat dasar. Melalui Aiko, kita bisa melihat bagaimana sebuah logika program diolah secara rapi di dalam memori komputer melalui sistem penyimpanan data yang cerdas.
