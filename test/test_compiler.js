const Lexer = require('../src/lexer/lexer.js');
const Parser = require('../src/parser/parser.js');
const Compiler = require('../src/compiler/compiler.js');
const ErrorReporter = require('../src/ErrorReporter/ErrorReporter.js')
const fs = require('fs');
const path = require('path');

// console.log(process.argv[2])
// const code = fs.readFileSync(path.join(__dirname, `../src/main.ak`), 'utf8');


const inputFile = process.argv[2];

const outputIdx = process.argv.indexOf('-o');
const outputFile = outputIdx !== -1 ? process.argv[outputIdx + 1] : null;

if (!inputFile) {
    console.error("Usage: node test_compiler.js <source_file>.ak");
    process.exit(1);
}

try {
    // Baca file
    const absoluteInputPath = path.resolve(inputFile);
    const code = fs.readFileSync(absoluteInputPath, 'utf8');
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
    const targetAsmPath = outputFile ? path.resolve(outputFile) : path.join(__dirname, `../out/main.asm`);
    fs.writeFileSync(targetAsmPath, asm);

    const debugData = {
        sourceMap: map,
        headerOffset: offset
    };
    
    const targetDebugPath = targetAsmPath.replace(/\.asm$/, '.debug.json');
    fs.writeFileSync(targetDebugPath, JSON.stringify(debugData, null, 2));

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