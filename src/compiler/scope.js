module.exports = {
    enterScope() {
  		this.indentLevel++;
  		this.variables.push(Object.create(null));
  	},

  	exitScope() {
  	  	if (this.variables.length <= 1) {
  	  		// throw new Error('Cannot exit global scope');
			this.reportError('Mencoba keluar dari global scope (Stack Underflow).', null);
        	return;
		}

		const scope = this.variables.pop();

  	  	// this.emit(`push eax    ; simpan return value`);
  	  	let localStackSize = 0; // hanya ebp - x
	  
  	  	// free heap
  	  	for(const name in scope){
  	  	  	const v = scope[name];
			const pointerOp = v.kind === 'param' ? '+' : '-';
        	const offset = Math.abs(v.offset);
  	  	  	
			this.emit(`; free alamat heap variabel ${name}`);
			// this.emit(`mov eax, [ebp ${pointerOp} ${offset}]`);
  	  	  	// this.deallocBox();
  	  	  	console.log(`Free scope at level ${this.variables.length + 1} on size ${localStackSize}`);

  	  	  	if(v.kind !== 'param'){
				localStackSize += 4;
  	  	  	}
  	  	}
		// this.emit(`mov eax, [esp + 4]    ; ambil arena mark`);
		// this.emit(`call arena_rewind`);
  	  	// this.emit(`pop eax    ; kembalikan return value`);
	
		// free stack
  	  	if (localStackSize > 0) {
			console.log({localStackSize});
				
  	  		this.emit(`add esp, ${localStackSize}    ; bersihkan dari stack (scope.js)`);
  	  		this.currentOffset -= localStackSize;
		}
		this.indentLevel--;
  	},

      	// mencari variabel dari scope terdalam hingga ke global
  	resolveVar(name) {
  	  	for (let i = this.variables.length - 1; i >= 0; i--) {
  	  	  	if (Object.prototype.hasOwnProperty.call(this.variables[i], name)) {
  	  	  		return this.variables[i][name];
  	  	  	}
  	  	}
  	  	return null;
  	},

  	// mendaftarkan variabel ke scope aktif
  	defineVar(name, meta, node) {
  	  	const scope = this.variables[this.variables.length - 1];
  	  	if (Object.prototype.hasOwnProperty.call(scope, name)) {
  	  		// throw new Error(`Variable "${name}" already declared in this scope`);
			this.reportError(`Variabel "${name}" sudah dideklarasikan di scope ini.`, node);
        	return meta;
		}
  	  	scope[name] = meta;
  	  	return meta;
  	}
};