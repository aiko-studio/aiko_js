class ErrorReporter {
    constructor(sourceCode = ""){
        this.errors = [];
        this.sourceCode = sourceCode;
    }

    report(stage, message, line, column = null, length = 1){
        this.errors.push({
            stage,
            message,
            line,
            column,
            length
        });
    }

    hasErrors(){ return this.errors.length > 0; }

    display(){
        if(this.errors.length === 0) return;

        console.error(`\nFound ${this.errors.length} error(s) in Aiko:\n`);

        this.errors.forEach((err, index) => {
            console.error(`${index  +1}, [${err.stage} ERROR] on Line ${err.line}${err.column ? `:${err.column}` : ""}`);
            console.error(`   Message: ${err.message}`);
            
            if (this.sourceCode) {
                const lines = this.sourceCode.split('\n');
                if(err.line - 1) console.error(`   |> ${lines[err.line - 1]}`); 
            }
            console.error("");
        });
    }

    clear() {
        this.errors = [];
    }
}

module.exports = ErrorReporter;