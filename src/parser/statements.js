const {
    ProgramStmt, VarDeclStmt, AssignmentStmt, PrintStmt,
    IfStmt, ElifStmt, ForStmt, FunctionDeclStmt, ReturnStmt,
    BreakStmt, ContinueStmt, UseStmt, IdentifierStmt, ArrayAccessStmt,
    LiteralStmt,
    FunctionCallStmt
} = require('../../helper/ast_tree.js');

module.exports = {
    parse(){
        const statements = [];
        while(this.current.type !== 'EOF'){
            // console.log({current: this.current});
            
            statements.push(this.parseStatement());
        }
        return new ProgramStmt(statements);
    },

    parseStatement(){
        // console.log(this.current);
        
        // match sudah memanggil next token, jadi akan langsung ke identifier, atua apapun itu setelah keywords
        if(this.match('VAR')) return this.parseVarDeclStmt();
        if(this.match('PRINT')) return this.parsePrintStmt();
        if(this.match('IF')) return this.parseIfStmt();
        if(this.match('FOR')) return this.parseForStmt();
        if(this.match('RETURN')) return this.parseReturnStmt();
        if(this.match('FUN')) return this.parseFunctionDeclStmt();
        if(this.match('BREAK')) return this.parseBreakStmt();
        if(this.match('CONTINUE')) return this.parseContinueStmt();
        if(this.current.type === 'IDENTIFIER'){
            const lineStart = this.current.line;
            let name = this.current.value;
            this.next_token();
            
            let modulePrefix = null;

            if (this.match('DOT')) {
                modulePrefix = name; // Identifier pertama menjadi nama modul
                name = this.expect('IDENTIFIER').value; // Kata setelah titik menjadi nama aslinya
            }

            const id = new IdentifierStmt(name, lineStart, lineStart, modulePrefix);

            // informasi modul ke dalam node Identifier
            // null jika pemanggilan lokal biasa
            id.modulePrefix = modulePrefix;

            let target = id;

            // array 1d
            if(this.match('LBRACKET')){
                const index = this.parseExpression();
                this.expect('RBRACKET');

                const lineEnd = this.tokens[this.position - 1].line;

                target = new ArrayAccessStmt(id, index, lineStart, lineEnd);
                
                if (this.current.type !== 'ASSIGN') {
                    // throw new Error(`Invalid Statement: Akses array pada baris ${lineEnd} harus diikuti assignment '='.`);
                    this.error(`Akses array harus diikuti assignment '='.`);
                    return target;
                }
            }

            if(this.match('ASSIGN', '=')){
                const assignStmt = this.parseAssign(target);
                this.expect('SEMICOLON');
                return assignStmt;
            }
            // console.log("woi malas: ", id);
            
            // function call statement
            if(this.match('LPAREN')) {
                const call = this.parseFunctionCall(id);
                this.expect('SEMICOLON');
                return call;
            }
    
            // throw new Error(`Unexpected identifier usage: ${id.name}`);
            // JIKA TIDAK COCOK APAPUN
            this.error(`Penggunaan identifier '${id.name}' tidak valid sebagai statement.`);
            return id;
        }
        if(this.current.type === 'USE') return this.parseUse();
        
        // throw new Error(`Unexpected token: ${this.current.type} ${this.current.value}`);
        this.error(`Token tidak dikenal di awal statement: '${this.current.type}'`);
        this.next_token(); // Skip agar tidak infinite loop
        return null;
    },

    parseVarDeclStmt(){
        const lineStart = this.tokens[this.position - 1].line;

        const name = this.expect('IDENTIFIER').value; // mengambil nilai nama variabel dari token
        let value = new LiteralStmt(0, this.getLine(), this.getLine());

        if(this.match('ASSIGN', '=')){
            value = this.parseExpression();
        }
        /*
        berurutan mengecek dari:
        - equality : ==, !=
        - comparison : <, >, <=, >=
        - term : +, -
        - factor : *, /
        - unary : -, ! (prefix)
        - primary : angka, variabel, literal **** INI TERKUAT  ****
        */
        this.expect('SEMICOLON', ';');
        const lineEnd = this.tokens[this.position - 1].line;
        return new VarDeclStmt(name, value, lineStart, lineEnd);
    },


    parseAssign(variable){
        const lineStart = variable.line;
        const initializer = this.parseExpression();
        const lineEnd = this.tokens[this.position - 1].line;
        return new AssignmentStmt(variable, initializer, lineStart, lineEnd);
    },

    parsePrintStmt(){
        const lineStart = this.getLine();
        
        this.expect('LPAREN');
        const expr = this.parseExpression();
        this.expect('RPAREN');
        this.expect('SEMICOLON');

        const lineEnd = this.tokens[this.position - 1].line;
        return new PrintStmt(expr, lineStart, lineEnd);
    },
    
    parseIfStmt(){
        const ifLineStart = this.getLine();
        const condition = this.parseExpression(); // disini boleh ga pakai ( )
        const thenBlock = this.parseBlock();
        
        const elifs = [];
        let elseBlock = null;
        
        while(this.match('ELIF')){
            const elifLineStart = this.tokens[this.position - 1].line;
            const elifCondition = this.parseExpression();
            const elifBody = this.parseBlock();
            const elifLineEnd = this.tokens[this.position - 1].line;
            elifs.push(new ElifStmt(elifCondition, elifBody, elifLineStart, elifLineEnd));
        }
        
        if(this.match('ELSE')){
            elseBlock = this.parseBlock();
        }

        const ifLineEnd = this.tokens[this.position - 1].line;
        return new IfStmt(condition, thenBlock, elifs, elseBlock, ifLineStart, ifLineEnd);
    },

    parseForStmt(){
        const lineStart = this.tokens[this.position - 1].line;
        const name = this.expect('IDENTIFIER').value;
        
        if(this.current.type === 'ASSIGN'){
            this.expect('ASSIGN', '=');
            
            const startExpr = this.parseExpression();
            this.expect('RANGE', '..');
            
            const endExpr = this.parseExpression();
            // console.log(endExpr);
            
            
            let step = null;
            if(this.match('COMMA')){
                step = this.parseExpression();
            }
            
            if (!startExpr || !endExpr) {
                // throw new Error("Invalid for-range expression");
                this.error("Ekspresi range loop 'for' tidak valid.");
            }
            
            const bodyLine = this.tokens[this.position - 1].line;
            const body = this.parseBlock();
            const lineEnd = this.tokens[this.position - 1].line;            
            
            return new ForStmt(
                new VarDeclStmt(name, startExpr, bodyLine),
                endExpr,
                step,
                body,
                lineStart,
                lineEnd
            );
        }
        else if(this.expect('IN')){
            const lineStart = this.tokens[this.position - 1].line;
            const sourceArray = this.parseExpression(); // Parse array/sumbernya

            let whenCond = null;
            if (this.current.type === 'WHEN') {
                this.next_token();
                whenCond = this.parseExpression(); // Parse kondisinya
            }

            // Cek Error: Iterator loop tidak mendukung step pakai koma
            if (this.match('COMMA')) {
                // throw new Error(`Syntax Error: Iterator loop ('in') tidak mendukung step dengan koma.`);
                this.error(`Iterator loop ('in') tidak mendukung 'step' dengan koma.`);
            }

            const bodyLine = this.tokens[this.position - 1].line;
            const body = this.parseBlock();
            const lineEnd = this.tokens[this.position - 1].line;

            // Return Node khusus Iterator
            return new ForStmt(
                new VarDeclStmt(name, sourceArray, bodyLine),
                null,
                whenCond,
                body,
                lineStart,
                lineEnd
            );
        }
        else {
            // throw new Error(`Syntax Error: Setelah nama variabel loop, diharapkan '=' (untuk range) atau 'in' (untuk array).`);
            this.error(`Diharapkan '=' (range) atau 'in' (iterator) setelah nama variabel for.`);
            this.parseBlock(); // Coba parse block-nya saja agar sinkronisasi parser terjaga
            return null;
        }
    },

    parseReturnStmt(){
        const lineStart = this.tokens[this.position - 1].line;
        // return; <-- tanpa nilai
        if (this.current.type === 'SEMICOLON') {
            this.expect('SEMICOLON');
            return new ReturnStmt(null, this.getLine());
        }

        // return <expression>;
        const value = this.parseExpression(); // misal return 1 + 2;
        this.expect('SEMICOLON');
        const lineEnd = this.tokens[this.position - 1].line;
        
        return new ReturnStmt(value, lineStart, lineEnd);
    },

    parseParamStmt(){// ini blm
        const token = this.expect('IDENTIFIER'); // mengambil nilai nama variabel dari token
        return new IdentifierStmt(token.value, token.line, token.line); // karna sebaris jdi langsung getline
    },

    parseFunctionDeclStmt(){
        const lineStart = this.tokens[this.position - 1].line;

        const name = this.expect('IDENTIFIER').value;
        this.expect('LPAREN');
        const params = [];
        if(this.current.type === 'IDENTIFIER'){
            params.push(this.parseParamStmt());
            while(this.match('COMMA')){
                params.push(this.parseParamStmt());
            }
        }
        
        this.expect('RPAREN');
        const body = this.parseBlock();
        // console.log("body: ", body);
        const lineEnd = this.tokens[this.position - 1].line;
        
        return new FunctionDeclStmt(name, params, body, lineStart, lineEnd);
    },

    parseFunctionCall(callee){
        const lineStart = callee.line; // lokasi identifier
        const args = [];

        // parse arguments
        if(this.current.type !== 'RPAREN'){
            args.push(this.parseExpression()); // setiap argument diubah jadi parsePrimary melewati parseExpr
            while(this.match('COMMA')){
                args.push(this.parseExpression());
            }
        }

        this.expect('RPAREN');
        const lineEnd = this.tokens[this.position - 1].line;
        return new FunctionCallStmt(callee, args, lineStart, lineEnd);
    },

    parseBreakStmt(){
        const breakLine = this.tokens[this.position - 1].line; 
        this.expect('SEMICOLON');
        return new BreakStmt(breakLine);
    },

    parseContinueStmt(){
        const continueLine = this.tokens[this.position - 1].line;
        this.expect('SEMICOLON');
        return new ContinueStmt(continueLine);
    },

    parseUse(){
        this.expect('USE');
        const lineStart = this.tokens[this.position - 1].line;
        const module = [];

        module.push(this.expect('IDENTIFIER').value);
        while(this.match('DOT')){
            module.push(this.expect('IDENTIFIER').value);
        }

        let alias = null;
        if(this.match('AS')){
            alias = this.expect('IDENTIFIER').value;
        }
        const lineEnd = this.tokens[this.position - 1].line;

        return new UseStmt(module, alias, lineStart, lineEnd);
    },

    // untuk cek block {}
    parseBlock() {
        this.expect('LBRACE');
        const statements = [];
        while (this.current.type !== 'RBRACE') {
            statements.push(this.parseStatement());
        }
        this.expect('RBRACE');
        return statements;
    }
}