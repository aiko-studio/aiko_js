function generateArrayLiteral(self, expr){
    const length = expr.elements.length;
    self.allocBox(length + 1);
    self.emit(`mov dword [eax], ${length}`);
    self.emit(`mov dword [eax + 4], 3    ; masukkan tipe data dari value, yaitu array sebagai 3`);
    for(let i = 1; i < length + 1; i++){
        const index = i > 0 ? ` + ${4 * (i * 2)}` : '';
        const typePos = i > 0 ? ` + ${4 * (i * 2) + 4}` : '';
        const value = expr.elements[i - 1].value; // index skrg - 1
        // console.log(i);
        
        
        if(typeof(value) === 'number'){
            self.emit(`mov dword [eax${index}], ${value}`);
            self.emit(`mov dword [eax${typePos}], 0    ; masukkan tipe data dari value, yaitu angka sebagai 0`);
            // self.blank(2);
        }
        else if(typeof(value) === 'boolean'){
            self.emit(`mov dword [eax${index}], ${value === true ? 1 : 0}`);
            self.emit(`mov dword [eax${typePos}], 2    ; masukkan tipe data dari value, yaitu boolean`);
            // self.blank(2);
        }
        else if(typeof(value) === 'string'){
            const label = `str_${self.stringLiteralCounter++}`;
            self.dataSection.push(`\t${label} db "${value}", 0    ; buat variabel string global bernama ${label} dengan tipe byte`);
            self.emit(`mov dword [eax${index}], ${label}`);
            self.emit(`mov dword [eax${typePos}], 1    ; masukkan tipe data dari value, yaitu string`);
            // self.blank(2);
        }
        else if(expr.elements[i - 1].name){ // untuk variabel
            var varName = expr.elements[i - 1].name;
            const variable = self.resolveVar(varName);
            // console.log(variable);
            if(variable){
                // 1. Tentukan posisi variabel di stack (berdasarkan jenisnya)
                const stackAddress = variable.kind === 'param' 
                    ? `ebp + ${variable.offset}` 
                    : `ebp - ${variable.offset}`;
                
                self.emit(`; ------------------------------ Start ambil isi variabel ${varName} ke dalam array ------------------------------`);
                
                // 2. Load pointer Box* dari variabel ke dalam register sementara (ecx)
                // PENTING: Jangan gunakan eax, karena eax sedang memegang pointer Array!
                self.emit(`mov ecx, [${stackAddress}]`);
                
                // 3. Ambil nilai (value) dari variabel (offset 0 dari Box) ke edx, 
                // lalu masukkan ke elemen array
                self.emit(`mov edx, [ecx]`);
                self.emit(`mov dword [eax${index}], edx`);
                
                // 4. Ambil tipe data dari variabel (offset 4 dari Box) ke edx,
                // lalu masukkan ke elemen array
                self.emit(`mov edx, [ecx + 4]`);
                self.emit(`mov dword [eax${typePos}], edx`);
                
                self.emit(`; ------------------------------ End ambil isi variabel ${varName} ------------------------------`);
                // self.blank(1);
            } else {
                throw new Error(`Undefined variable: ${varName}`);
            }
        }
        else {
            throw new Error("Unsupported literal type");
        }
    }

    return { box: true, val: null};
}

module.exports = generateArrayLiteral;