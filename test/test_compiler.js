const Lexer = require('../src/lexer/lexer.js');
const Parser = require('../src/parser/parser.js');
const Compiler = require('../src/compiler/compiler.js');
const ErrorReporter = require('../src/ErrorReporter/ErrorReporter.js')
const fs = require('fs');
const path = require('path');

// console.log(process.argv[2])
// const code = fs.readFileSync(path.join(__dirname, `../src/main.ak`), 'utf8');


const inputFile = process.argv[2];

if (!inputFile) {
    console.error("Usage: node test_compiler.js <source_file>.ak");
    process.exit(1);
}

try {
    // Baca file
    const code = fs.readFileSync(path.join(__dirname, `../${inputFile}`), 'utf8');
    const reporter = new ErrorReporter(code);

    // Lexing
    const lexer = new Lexer(code, reporter);
    const tokens = lexer.tokenize();
    if (reporter.hasErrors()) { reporter.display(); process.exit(1); }

    // Parsing
    const parser = new Parser(tokens, reporter);
    const ast_tree = parser.parse();
    if (reporter.hasErrors()) { reporter.display(); process.exit(1); }

    // Compile
    const compiler = new Compiler(ast_tree, reporter);
    const {asm, map, offset} = compiler.generate();

    if (reporter.hasErrors()) {
        reporter.display();
        process.exit(1);
    }

    // Tulis output
    fs.writeFileSync(path.join(__dirname, `../out/main.asm`), asm);

    const debugData = {
        sourceMap: map,
        headerOffset: offset
    };
    
    fs.writeFileSync(
        path.join(__dirname, `../out/main.debug.json`), 
        JSON.stringify(debugData, null, 2) // null, 2 agar json rapi terbaca
    );

    // console.log("Compilation successful!");
    // console.log("- Assembly: out/main.asm");
    // console.log("- Source Map: out/main.debug.json"); // File baru

} catch (error) {
    // console.error("Compilation failed:");
    // if (error.message) console.error(error.message);
    if (error.stack) console.error(error.stack.split('\n')[1]); // stack singkat
    // Ini untuk menangkap "Crash" yang tidak terduga (Bug di compiler)
    console.error("Critical Compiler Bug:", error.message);
    process.exit(1);
}