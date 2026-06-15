const path = require('path');

module.exports = {
  	generate() {
  	  	if (!this.ast_tree || !this.ast_tree.statements) {
  	  		// throw new Error('AST tree is missing "statements"');
			this.reportError('AST Tree kosong atau tidak memiliki statements.', null);
        	return { asm: "", map: [], offset: 0 };
		}

  	  	for (const statement of this.ast_tree.statements) {
  			// console.dir(statement, { depth: null, colors: true });
  			this.generateStatement(statement);
  	  	}
	

		// 1. Susun Header
    	const headerParts = [
    	  	`%include "${path.join(__dirname, '..', '..', '/runtime/runtime.inc')}"`,
    	  	'section .data',
    	  	...this.dataSection, 
    	  	'', // spacer
    	  	'section .bss',
    	  	...this.bssSection,
    	  	'', // spacer
    	  	'section .text',
    	  	'    global _start',
    	  	'',
    	  	'_start:',
    	  	'    push ebp',
    	  	'    mov ebp, esp',
			'    call arena_init',
    	  	'' 
    	];

    	// Gunakan join('\n') agar konsisten
    	const headerString = headerParts.join('\n');
    
    	// Hitung offset berdasarkan jumlah baris di headerString
    	// Jika headerString diakhiri \n, split akan menghasilkan string kosong di akhir, jadi length-1 sudah benar.
    	// Tapi karena kita join manual, kita hitung splitnya saja.
    	const headerOffset = headerString.split('\n').length; 

    	// 2. Susun Body
    	// Gunakan join('\n') karena di emit sudah hapus \n nya.
    	const bodyString = this.textSection.join('\n'); 

    	// ... bagian header & body string sudah benar ...

    	// 3. Pisahkan Static Footer (Kode Exit standar)
    	const staticFooterParts = [
    	  	'',
    	  	'    mov esp, ebp',
    	  	'    pop ebp',
    	  	'',
			'exit_program:',
    	  	'    mov eax, 1',
    	  	'    xor ebx, ebx',
    	  	'    int 0x80',
    	  	'' 
    	];
    	// Gabungkan jadi string
    	const staticFooterString = staticFooterParts.join('\n');
	
    	// HITUNG JUMLAH BARISNYA (Penting!)
    	// Kita pakai split('\n').length agar akurat sesuai hasil join
    	const staticFooterLineCount = staticFooterString.split('\n').length;
    
    	// Buat Spacer Map (Isinya 0 atau line terakhir, cuma buat ngisi tempat)
    	const staticFooterMap = new Array(staticFooterLineCount).fill(null);

    	// 4. Susun Final ASM
    	// Urutan: Header -> Body -> Static Footer -> Function Bodies
    	const functionBodyString = this.functiontSection.join('\n');
		
    	const finalAsm = headerString + '\n' + 
    	                 bodyString + '\n' + 
    	                 staticFooterString + '\n' + 
    	                 functionBodyString;

    	// 5. Susun Final Map
    	// Urutan: SourceMap -> Spacer (Static Footer) -> FunctionSourceMap
    	const finalMap = [
    	    ...this.sourceMap, 
    	    ...staticFooterMap, // <--- INI YANG HILANG SEBELUMNYA
    	    ...this.functionSourceMap
    	];

    	return {
    	    asm: finalAsm,
    	    map: finalMap,
    	    offset: headerOffset 
    	};
  	}
}