class Lexer {
    constructor(input, reporter){
        this.input = input;
        this.reporter = reporter;
        this.position = 0;
        this.line = 1; // ini line untuk nanti fitur highlight ygy
        this.currentChar = this.input[this.position];
    }

    error(message) {
        this.reporter.report("LEXER", message, this.line);
    }

    // lanjut ke char berikut, lalu disimpan ke current char
    next_char(){
        this.position++;
        this.currentChar = this.position < this.input.length ? 
            this.input[this.position] : null;
    }

    
    skip_whitespace(){
        while (this.currentChar && /\s/.test(this.currentChar)){
            if(this.currentChar === '\n'){
                this.line++;
            }
            this.next_char();
        }
    }

    skip_comment(){
        while (this.currentChar && this.currentChar !== '\n') {
            this.next_char();
        }
    }

    // cek angka
    isDigit(char) { return /[0-9]/.test(char); }

    // cek huruf
    isAlpha(char) { return /[a-zA-Z_]/.test(char); }

    // cek angka dan huruf
    isAlphaNumeric(char) { return this.isAlpha(char) || this.isDigit(char); } // menghapus . agar bisa dot operator

    makeToken(type, value) {
        return { 
            type: type, 
            value: value, 
            line: this.line // Otomatis catat baris saat ini
        };
    }

    readNumber(){
        let result = '';
        // selama masih ada karakter dan itu angka
        while(this.currentChar && this.isDigit(this.currentChar)){
            result += this.currentChar;
            this.next_char();
        }
        

        // untuk mendeteksi bilangan berkoma
        if(this.currentChar == '.'){
            result += this.currentChar;
            this.next_char();
            while(this.currentChar && this.isDigit(this.currentChar)){
                result += this.currentChar;
                this.next_char();
            }

            return this.makeToken('FLOAT', parseFloat(result));
        }

        return this.makeToken('INT', parseInt(result));
    }

    readString(){
        const quote = this.currentChar;
        this.next_char();

        let result = '';
        // selama masih alfabet
        while(this.currentChar && this.currentChar !== quote){
            result += this.currentChar;
            this.next_char();
            // belum ada escape sequence
        }


        if(this.currentChar === quote){
            this.next_char();
            return this.makeToken('STRING', result);
        }
        else {
            // throw new Error("'Unterminated String Literal");
            this.error(`Unterminated string literal. Di mulai dari baris ${this.line}`);
            return this.makeToken('STRING', result);
        }
    }

    // Fungsi untuk memeriksa dan menambahkan token boolean
    readBoolean(){
        if (this.currentChar === 't') {
            // Periksa apakah ada "true" mulai dari posisi ini
            if (this.input[this.position + 1] === 'r' &&
                this.input[this.position + 2] === 'u' &&
                this.input[this.position + 3] === 'e') {
                // Lewati kata 'true'
                for(let i = 0; i < 4; i++) this.next_char();
                return this.makeToken('BOOLEAN', true);
            }
        }
        
        if (this.currentChar === 'f') {
            // Periksa apakah ada "false" mulai dari posisi ini
            if (this.input[this.position + 1] === 'a' &&
                this.input[this.position + 2] === 'l' &&
                this.input[this.position + 3] === 's' &&
                this.input[this.position + 4] === 'e') {
                // Lewati kata 'false'
                for(let i = 0; i < 5; i++) this.next_char();
                return this.makeToken('BOOLEAN', false);
            }
        }
        
        return null;  // Kembalikan null jika bukan boolean            
    }

    readIdentifier(){
        let result = '';
        while (this.currentChar && this.isAlphaNumeric(this.currentChar)) {
            result += this.currentChar;
            this.next_char();
        }


        const keywords = {
            'var': 'VAR',
            'print': 'PRINT',
            'if': 'IF',
            'elif': 'ELIF',
            'else': 'ELSE',
            'for': 'FOR',
            'fun': 'FUN',
            'return': 'RETURN',
            'typeof': 'TYPEOF',
            'input': 'INPUT',
            'use': 'USE',
            'as': 'AS',
            'in': 'IN',
            'when': 'WHEN',
            'len': 'LEN',
            'break': "BREAK",
            'continue': 'CONTINUE',
            'val': 'VAL',
            'array': 'ARRAY',
            'push': 'PUSH',
            'pop': 'POP',
            'null': 'NULL',
            'view': 'VIEW',
            // 'while': 'WHILE',
        };

        const type = keywords[result] ?  keywords[result] : "IDENTIFIER";
        return this.makeToken(type, result);
    }


    get_next_token(){
        // selama masih membaca karakter
        while(this.currentChar) {
            // skip whitespace
            if(/\s/.test(this.currentChar)){
                this.skip_whitespace();
                continue;
            }

            // skip comment (baris diawali dengan '#')
            if (this.currentChar === '#') {
                this.skip_comment();
                continue;
            }
    
            // cek literal boolean
            if (this.currentChar === 't' || this.currentChar === 'f') {
                const booleanToken = this.readBoolean();
                if (booleanToken) return booleanToken; // Kembalikan token boolean jika ditemukan
            }

            // Handle negative numbers
            if(this.currentChar === '-' && this.isDigit(this.input[this.position + 1])) {
                this.next_char(); // consume the '-'
                const numberToken = this.readNumber();
                numberToken.value = -numberToken.value;
                return numberToken;
            }

            // handle string
            if(this.currentChar === '"' || this.currentChar === "'"){
                return this.readString();
            }

            // handle angka
            if(this.isDigit(this.currentChar)){
                return this.readNumber();
            }

            // handle identifier
            if(this.isAlpha(this.currentChar)){
                return this.readIdentifier();
            }

            // Handle range operator ..
            if (this.currentChar === '.' && this.input[this.position + 1] === '.') {
                this.next_char(); // consume first '.'
                this.next_char(); // consume second '.'
                return this.makeToken('RANGE', '..');
            }


            // handle operators
            if(['+', '-', '*', '/', '%'].includes(this.currentChar)){
                const op = this.currentChar;
                this.next_char();
                return this.makeToken('OPERATOR', op);
            }

            // Handle comparisons and assignment
            if (['>', '<', '=', '!'].includes(this.currentChar)) {
                const op = this.currentChar;
                this.next_char();
                if (this.currentChar === '=') {
                    const combinedOp = op + '=';
                    this.next_char();
                    return this.makeToken('COMPARISON', combinedOp); // ==, >=, etc.
                }
                if (op === '=') { return this.makeToken('ASSIGN', op); }
                if (op === '!') return this.makeToken('OPERATOR', '!'); // unary not
                
                // Semua simbol >, < (tanpa =) dianggap pembanding
                return this.makeToken('COMPARISON', op);
            }

            // Handle single-character tokens
            const singleCharTokens = {
                ';': 'SEMICOLON',
                '(': 'LPAREN',
                ')': 'RPAREN',
                '{': 'LBRACE',
                '}': 'RBRACE',
                '.': 'DOT',
                ',': 'COMMA',
                ':': 'COLON',
                '[': 'LBRACKET',
                ']': 'RBRACKET'
            };

            if (singleCharTokens[this.currentChar]) {
                const type = singleCharTokens[this.currentChar];
                const value = this.currentChar;
                this.next_char();
                return this.makeToken(type, value);
            }

            // throw new Error(`Unknown character: ${this.currentChar} at position ${this.position}`);
            this.error(`Unknown character: '${this.currentChar}'`);
            // maju 1 langkah 
            this.next_char();
        }

        return this.makeToken('EOF', null);
    }

    tokenize(){
        const tokens = [];
        let token = this.get_next_token();
        while(token.type != 'EOF'){
            tokens.push(token);
            token = this.get_next_token();
        }
        tokens.push(token);
        return tokens;
    }
};

module.exports = Lexer;