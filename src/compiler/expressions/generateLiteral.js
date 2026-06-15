function generateLiteral(self, expr, mode){
  	self.emit(`; ------------------------------ Start Literal ------------------------------`);
  	const { value } = expr;
  	// console.log({mode});
  	if(mode === 'condition'){
		self.emit(`mov ecx, ${value !== null ? value : '0'}    ; ecx = ${value}`);
		self.emit(`; ------------------------------ End Literal ------------------------------`);
		self.blank(1);
		return { box: false, val: value };
  	}

  	// alokasikan struct Box (8 byte)
  	self.allocBox();
  	// disini sekarang eax = Box* (alamat Box)

	
	if(value === null){
		self.emit(`mov dword [eax], 0        ; value untuk null = 0`);
        self.emit(`mov dword [eax + 4], 9    ; tipe data = null sebagai 9`);
	}
  	else if(typeof value === 'number'){
  		self.emit(`mov dword [eax], ${value}    ; alamat dalam register eax = ${value}`);
  		self.emit(`mov dword [eax + 4], 0    ; tipe data = angka sebagai 0`);
  		// self.blank(2);
  	}
  	else if(typeof value === 'boolean'){
  		self.emit(`mov dword [eax], ${value === true ? 1 : 0}    ; alamat dalam register eax = ${value ? 'true' : 'false'} (${value ? 1 : 0})`);
  		self.emit(`mov dword [eax + 4], 2    ; tipe data = boolean sebagai 2`);
  		// self.blank(2);
  	}
  	else if(typeof value === 'string'){
  		const label = `str_${self.stringLiteralCounter++}`;
  		self.dataSection.push(`\t${label} db "${value}", 0    ; variabel string global bernama ${label} dengan tipe byte`);
  		self.emit(`mov dword [eax], ${label}    ; alamat dalam register eax = alamat label`);
  		self.emit(`mov dword [eax + 4], 1    ; tipe data = string sebagai 1`);
  		// self.blank(2);
  	}
  	else {
  		throw new Error("Unsupported literal type");
  	}
  	self.emit(`; ------------------------------ End Literal ------------------------------`);
  	self.blank(1);
  	// return Box*
  	return { box: true, val: value };
}

module.exports = generateLiteral;