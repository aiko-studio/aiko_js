const Lexer = require('../src/lexer/lexer.js');
const Parser = require('../src/parser/parser.js');
const fs = require('fs');
const path = require('path');

const code = fs.readFileSync(path.join(__dirname, '../src/main.ak'), 'utf8');
const lexer = new Lexer(code);
const tokens = lexer.tokenize();

const parser = new Parser(tokens);
const ast_tree = parser.parse();
console.dir(ast_tree, {depth: null});