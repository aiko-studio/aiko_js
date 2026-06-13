const expressionHandlers = require('./expressions/index');
const statementHandlers = require('./statements/index');

const scopeMethods = require('./scope');
const emitterMethods = require('./emitter');
const memoryMethods = require('./memory');
const registryMethods = require('./registry');
const generatorMethods = require('./generator');

class Compiler {
  	constructor(ast_tree, reporter){
  	  	this.ast_tree = ast_tree;
		this.reporter = reporter;
		
  	  	// Sections
  	  	this.dataSection = [];
  	  	this.bssSection = [];
  	  	this.textSection = [];        // current active section (default: _start)
  	  	this.functiontSection = [];   // emitted function bodies
		
  	  	// Scope stack (each scope: { varName: meta })
  	  	this.variables = [Object.create(null)];
		
  	  	// loop stack: untuk label loop break dan continue [ { startL '', end: '' } ]
  	  	this.loopStack = [];
		
  	  	// Function registry
  	  	// { name, paramCount, paramNames }
  	  	this.functionNames = [];
  	  	this.currentFunction = null;
		
  	  	// Counters / labels
  	  	this.labelCounter = 0;
  	  	this.stringLiteralCounter = 0;
  	  	this.ifCounter = 0;
  	  	this.forCounter = 0;
		
  	  	// Local stack allocation tracking (if you use stack locals)
  	  	this.currentOffset = 0;
		
  	  	this.indentLevel = 1;
		
  	  	this.module = [];
		
  	  	// Optional: globals registry if you want to track it
  	  	this.global = Object.create(null);
		
		
  	  	// untuk souce map => fitur highlight
  	  	this.sourceMap = [];
  	  	this.functionSourceMap = []; // Penampung map khusus fungsi
  	  	this.currentSourceLocation = null;

		// modul use library
		this.importedModules = new Set();     // Mencatat file yang sudah di-import
        this.moduleAliases = {};              // Menyimpan mapping nama alias modul
  	}

  	updateLocation(node) {
  	  	// Cek apakah node ada dan memiliki properti lineStart
  	  	if (node && node.lineStart !== undefined) {
  	  	    this.currentSourceLocation = {
  	  	        start: node.lineStart,
  	  	        end: node.lineEnd || node.lineStart // Fallback jika lineEnd undefined
  	  	    };
  	  	}
  	}

	reportError(message, node) {
        const line = node ? node.lineStart : (this.currentSourceLocation ? this.currentSourceLocation.start : 0);
        this.reporter.report("CODEGEN", message, line);
    }

  	generateStatement(stmt) {
  	  	const prevLocation = this.currentSourceLocation;
  	  	// Update lokasi ke statement saat ini
  	  	this.updateLocation(stmt);
  	  	try {
            const handler = statementHandlers[stmt.type];

            if (handler) {
                // Eksekusi handler
                handler(this, stmt);
            } else {
                // console.warn('Unknown statement:', stmt);
				this.reportError(`Unknown statement type: ${stmt.type}`, stmt);
            }
        }
		catch(e){
            this.reportError(e.message, stmt);
        }
		finally {
            // KEMBALIKAN lokasi Parent (menggunakan finally agar aman jika terjadi error)
            this.currentSourceLocation = prevLocation;
        }
  	}


  	generateExpression(expr, mode = 'non-condition') {
  	  	// console.log(expr.type, ' : mode dalam expr: ', mode);
		
  	  	if (!expr || !expr.type) {
  	  		// throw new Error(`Invalid expression: ${JSON.stringify(expr)}`);
			this.reportError(`Struktur ekspresi tidak valid atau corrupt.`, expr);
        	return null;
		}
	  
  	  	// Simpan lokasi sebelum masuk expression
  	  	const prevLocation = this.currentSourceLocation;
  	  	this.updateLocation(expr);
	  
		try {
            // Cek apakah handler tersedia untuk tipe ini
            const handler = expressionHandlers[expr.type];

            if (handler) {
                // Eksekusi handler
                return handler(this, expr, mode);
            } else {
                // console.warn('Unknown expression type:', expr.type);
				this.reportError(`Unknown expression type: ${expr.type}`, expr);
                return null; // Atau throw error jika ingin strict
            }
        }
		catch(e){
            this.reportError(e.message, expr);
            return null;
        }
		finally {
            // Restore lokasi (menggunakan try/finally agar tetap jalan meski ada error)
            this.currentSourceLocation = prevLocation;
        }	  
  	}
}

module.exports = Compiler;

Object.assign(Compiler.prototype,
	scopeMethods,
	emitterMethods,
	memoryMethods,
	registryMethods,
	generatorMethods,
);
