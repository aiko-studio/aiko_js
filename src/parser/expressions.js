const {
    BinaryOpStmt, LiteralStmt, IdentifierStmt, 
    ArrayAccessStmt, ArrayLiteralStmt, FunctionCallStmt,
    InputStmt, LenStmt, TypeofStmt, UnaryOpStmt, PrintStmt,
    ArrayAllocStmt, ViewStmt
} = require('../../helper/ast_tree');

module.exports = {
    parseExpression(){
        return this.parseEquality();
    },

    // untuk urutan kekuatan operator
    // dimulai dari ==, !=
    parseEquality(){
        let left = this.parseComparison();
        while(this.match('COMPARISON', '==') || this.match('COMPARISON', '!=')){
            const opToken = this.tokens[this.position - 1];
            const right = this.parseComparison();
            left = new BinaryOpStmt(left, opToken.value, right, left.lineStart, right.lineEnd);
        }
        return left;
    },

    parseComparison(){
        let left = this.parseTerm();
        while(this.match('COMPARISON')){
            const opToken = this.tokens[this.position - 1];
            const right = this.parseTerm();
            left = new BinaryOpStmt(left, opToken.value, right, left.lineStart, right.lineEnd);
        }
        return left;
    },

    parseTerm(){
        let left = this.parseFactor();
        while(this.match('OPERATOR', '+') || this.match('OPERATOR', '-')){
            const opToken = this.tokens[this.position - 1];
            const right = this.parseFactor();
            left = new BinaryOpStmt(left, opToken.value, right, left.lineStart, right.lineEnd);
        }
        return left;
    },

    parseFactor(){
        let left = this.parseUnary();
        while(this.match('OPERATOR', '*') || this.match('OPERATOR', '/') || this.match('OPERATOR', '%')){
            const opToken = this.tokens[this.position - 1];
            const right = this.parseUnary();
            left = new BinaryOpStmt(left, opToken.value, right, left.lineStart, right.lineEnd);
        }
        return left;
    },

    // untuk -, !
    parseUnary(){
        if (this.current.type === 'VIEW') {
            const viewToken = this.expect('VIEW'); // Konsumsi token 'view'
            const lineStart = viewToken.line;
            
            // Ambil identifier setelah kata 'view' (misal: x)
            const argument = this.parsePrimary(); 
            const lineEnd = argument.lineEnd || argument.lineStart;
            
            return new ViewStmt(argument, lineStart, lineEnd);
        }
        while(this.match('OPERATOR', '-') || this.match('OPERATOR', '!')){
            const opToken = this.tokens[this.position - 1];
            const operand = this.parseUnary();
            return new UnaryOpStmt(opToken.value, operand, opToken.line, operand.lineEnd);
        }
        return this.parsePrimary();
    },

    parsePrimary(){ // pokoknya ini untuk statement tanpa apapun , misal tanpa assignment, dll
        if(this.current.type === 'INT' || this.current.type === 'FLOAT' || this.current.type === 'STRING' || this.current.type === 'BOOLEAN'){
            const value = this.current.value;
            this.next_token();
            return new LiteralStmt(value, this.getLine(), this.getLine());
        }

        // cek null
        if(this.current.type === 'NULL') { 
            const line = this.getLine();
            this.next_token();

            return new LiteralStmt(null, line, line);
        }

        // cek alokasi
        if(this.current.type === 'ARRAY') { 
            const allocToken = this.expect('ARRAY'); 
            const lineStart = allocToken.line;

            this.expect('LPAREN'); // Pastikan '('
            const sizeArgument = this.parseExpression(); // Ambil angka/variabel ukuran array
            this.expect('RPAREN'); // Pastikan ')'

            const lineEnd = this.tokens[this.position - 1].line;

            // Mengembalikan AST Node baru khusus untuk Alokasi Array
            return new ArrayAllocStmt(sizeArgument, lineStart, lineEnd);
        }

        // cek len
        if (this.current.type === 'LEN') {
            const lenToken = this.expect('LEN'); // Konsumsi token 'LEN' dan catat infonya
            const lineStart = lenToken.line;

            this.expect('LPAREN'); // Pastikan ada '(' setelah len
            const argument = this.parseExpression(); // Ambil identifier/ekspresi di dalam kurung (misal: arr)
            this.expect('RPAREN'); // Pastikan ditutup dengan ')'

            const lineEnd = this.tokens[this.position - 1].line;

            // Kembalikan objek LenStmt agar konsisten dengan InputStmt
            return new LenStmt(argument, lineStart, lineEnd);
        }

        // cek input
        if(this.match('INPUT')){
            const lineStart = this.tokens[this.position - 1].line;
            this.expect('LPAREN');

            let expr = null;
            if(this.current.type !== 'RPAREN')  expr = this.parseExpression();
            
            let print = null;            
            if(expr) print = new PrintStmt(expr, expr.lineStart, expr.lineEnd);
            
            this.expect('RPAREN');
        
            let data_type = "string";
            if(this.match('AS')){
                data_type = this.expect('IDENTIFIER').value;
            }

            const lineEnd = this.tokens[this.position - 1].line;

            return new InputStmt(print, data_type, lineStart, lineEnd);
        }

        // cek typeof
        if(this.current.type === 'TYPEOF'){
            const lineStart = this.current.line;
            this.next_token();
            const expr = this.parseUnary(); // cek identifier atau literal

            // End line ikut expression anaknya
            const lineEnd = expr.lineEnd || expr.lineStart;
            return new TypeofStmt(expr, lineStart, lineEnd);
        }

        // cek variabel dan array
        if(this.current.type === 'IDENTIFIER'){
            const lineStart = this.current.line;
            let name = this.current.value;
            this.next_token();

            let modulePrefix = null;

            if (this.match('DOT')) {
                modulePrefix = name; // Identifier pertama menjadi nama modul
                name = this.expect('IDENTIFIER').value; // Identifier kedua menjadi nama asli
            }

            const ID = new IdentifierStmt(name, lineStart, lineStart, modulePrefix);

            // cek kalau pemanggilan fungsi
            if(this.match('LPAREN')){
                return this.parseFunctionCall(ID);
            }

            // cek array
            if(this.match('LBRACKET')){
                const index = this.parseExpression();
                this.expect('RBRACKET');

                const lineEnd = this.tokens[this.position - 1].line;
                return new ArrayAccessStmt(ID, index, lineStart, lineEnd);
            }
            return ID;
        }

        // cek array literal
        if(this.match('LBRACKET')){
            const lineStart = this.tokens[this.position - 1].line;
            const elements = [];

            if(this.current.type !== 'RBRACKET'){
                const start = this.parseExpression();
                elements.push(start); // ini nanti sampai ke parsePrimary
                
                if(this.match('RANGE', '..')){ // untuk fitur range
                    // cek number tambah nanti
                    
                    
                    const end = this.parseExpression();
                    for(let i = start.value + 1; i < end.value; i++){
                        elements.push(new LiteralStmt(i, start.lineStart, start.lineEnd));
                    }
                }
                while(this.match('COMMA')){
                    elements.push(this.parseExpression());
                }
            }

            this.expect('RBRACKET');
            const lineEnd = this.tokens[this.position - 1].line; // Line dari ']'

            return new ArrayLiteralStmt(elements, lineStart, lineEnd);
        }

        // cek (expr)
        if(this.match('LPAREN')){
            const expr = this.parseExpression();
            this.expect('RPAREN');
            return expr;
        }

        // console.log(this.current)
        // throw new Error(`Unexpected token in expression: ${this.current.type}`);
        this.error(`Token tidak terduga dalam ekspresi: '${this.current.type}' (${this.current.value})`);
    
        // Lewati token aneh ini agar tidak loop selamanya
        const errorLine = this.getLine();
        this.next_token(); 
        return new LiteralStmt(0, errorLine, errorLine); // Kembalikan node dummy
    }
}