const Lexer = require('../src/lexer/lexer.js')
const fs = require('fs');
const path = require('path');

const code = fs.readFileSync(path.join(__dirname, '../src/main.ak'), 'utf8');
const lexer = new Lexer(code);

const tokens = lexer.tokenize();
console.log(tokens);