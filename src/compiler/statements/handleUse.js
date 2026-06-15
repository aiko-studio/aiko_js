const fs = require('fs');
const path = require('path');
// Sesuaikan path ke Parser kamu
const Lexer = require('../../lexer/lexer'); 
const Parser = require('../../parser/parser'); 

function handleUse(self, stmt) {
    // stmt.module adalah Array ['std', 'io'], jadi pakai join('/')
    // Hasilnya menjadi string "std/io"
    const modulePath = stmt.module.join('/');
    
    // Resolusi path ke file: /path/to/project/std/io.aiko -> cek lokal dlu
    let fullPath = path.join(process.cwd(), modulePath + '.ak');

    if (!fs.existsSync(fullPath)) {
        // Jika tidak ada di lokal, cari di folder stdlib Aiko
        const stdlibPath = path.join(__dirname, '..', '..', '..'); // Sesuaikan relasi foldernya
        fullPath = path.join(stdlibPath, modulePath + '.ak');
    }

    // Cek keberadaan file
    if (!fs.existsSync(fullPath)) {
        throw new Error(`Module not found: ${stmt.module.join('.')} (looked at local and stdlib)`);
    }

    // Hindari circular dependency / import berulang
    if (!self.importedModules) self.importedModules = new Set();

    if (self.importedModules.has(fullPath)) {
        return;  // Sudah pernah di-import, lewati
    }
    self.importedModules.add(fullPath);

    // Mengatur alias (jika ada 'as', pakai itu. Jika tidak, pakai nama terakhir)
    const modulePrefix = stmt.alias ? stmt.alias : stmt.module[stmt.module.length - 1];
    self.moduleAliases[modulePrefix] = stmt.module.join('_');
    
    console.log(`Importing: ${fullPath}`);
    const code = fs.readFileSync(fullPath, 'utf-8');

    // Compile module tersebut
    const tokens = new Lexer(code).tokenize();
    const parser = new Parser(tokens);
    const ast = parser.parse();
    // console.log(ast);
    
    const previousModule = self.module;    
    // (misal: "std_io")
    self.module = stmt.module.join('_');
    

    // Inject kode dari module ke compiler saat ini
    for (const statement of ast.statements) {
        self.generateStatement(statement);
    }

    // console.log(self.module);
    

    // Kembalikan status modul ke semula setelah selesai
    self.module = previousModule;
}

module.exports = handleUse;