function generateArrayAccess(self, expr) {
    const { array_name, index } = expr;
    
    self.emit(`; ------------------------------ Start GenerateArrayAccess ------------------------------`);
    
    // Evaluasi Index -> Masuk ke ECX
    if (index.type === 'Literal') {
        self.generateExpression(index, 'condition');
    } else {
        self.generateExpression(index);
        self.emit(`mov ecx, [eax]    ; pindahkan nilai index ke ecx`); 
    }
    
    // Evaluasi Base (Array/String) -> Masuk ke EAX
    // Gunakan push/pop jika generateExpression merusak register ECX
    self.emit(`push ecx`);
    self.generateExpression(array_name); 
    self.emit(`pop ecx`);

    // PANGGIL RUNTIME FUNCTION
    // get_element akan mengurus apakah ini String atau Array secara dinamis
    self.emit(`call get_element`);

    self.emit(`; ------------------------------ End GenerateArrayAccess ------------------------------\n`);
    self.blank(1);
    
    return { box: true, val: index.value };
}

module.exports = generateArrayAccess;