const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Folder sumber testing
const TEST_FOLDER_NAME = path.join('src', 'integration_tests');
const TEST_DIR = path.join(__dirname, TEST_FOLDER_NAME); 

// File target sementara di root directory
const TEMP_MAIN_AK = path.join(__dirname, 'main.ak'); 

// Ambil argumen nomor dari terminal (misal: node test_runner.js 13)
const targetNumber = process.argv[2];

function runTests() {
    if (!fs.existsSync(TEST_DIR)) {
        console.error(`❌ Folder direktori tidak ditemukan: ${TEST_DIR}`);
        return;
    }

    // Ambil semua file .ak dan urutkan secara sekuensial
    let files = fs.readdirSync(TEST_DIR)
                    .filter(file => file.endsWith('.ak'))
                    .sort(); 

    // --- FITUR FILTER NOMOR ---
    if (targetNumber) {
        files = files.filter(file => file.startsWith(`${targetNumber}-`));

        if (files.length === 0) {
            console.log(`⚠️  Tidak ada file test dengan nomor awalan: ${targetNumber}-`);
            return;
        }
        console.log(`\n🎯 Menjalankan Test Spesifik untuk Nomor: ${targetNumber}`);
    } else {
        console.log(`\nMemulai Automation Test (Semua File - Sequential Mode)...`);
    }
    
    console.log("===============================================");

    let passed = 0;
    let failed = 0;

    files.forEach(file => {
        const name = path.basename(file, '.ak');
        const akFilePath = path.join(TEST_DIR, file);
        const expectedFilePath = path.join(TEST_DIR, `${name}.expected`);
        const inputFilePath = path.join(TEST_DIR, `${name}.input`); 

        if (!fs.existsSync(expectedFilePath)) {
            console.warn(`Skip [${file}]: File .expected tidak ditemukan.`);
            return;
        }

        const expectedOutput = fs.readFileSync(expectedFilePath, 'utf-8').trim();

        try {
            // 1. Kloning file tes spesifik menjadi main.ak di root
            fs.copyFileSync(akFilePath, TEMP_MAIN_AK);

            // 2. Compile (Abaikan stdout/log dari bash script agar tidak mengotori pencocokan)
            execSync(`./run_fs.sh ./main.ak`, { stdio: ['ignore', 'ignore', 'inherit'] });

            // 3. JALANKAN BINER + SUNTIKKAN & ECHO INPUT OTOMATIS
            let actualOutput;
            if (fs.existsSync(inputFilePath)) {
                const inputRaw = fs.readFileSync(inputFilePath, 'utf-8');
                const inputs = inputRaw.split(/\r?\n/).map(line => line.trim());

                // Jalankan biner asli dengan menyuntikkan data stdin
                let rawOutput = execSync(`./out/main`, { 
                    input: inputRaw, 
                    encoding: 'utf-8' 
                });

                // --- REKONSTRUKSI TOTAL OUTPUT ---
                let reconstructed = [];
                let inputIndex = 0;

                // 1. Ambil header start
                if (rawOutput.includes("===== START INPUT =====")) {
                    reconstructed.push("===== START INPUT =====");
                }

                // 2. Cari prompt "Masukkan string:" dan ambil hasil print-nya
                if (rawOutput.includes("Masukkan string:")) {
                    reconstructed.push("Masukkan string: ");
                    if (inputs[inputIndex] !== undefined) {
                        reconstructed.push(inputs[inputIndex]); // Simulasi ketik user
                        reconstructed.push(inputs[inputIndex]); // Hasil print(inputStr) dari biner
                        inputIndex++;
                    }
                }

                // 3. Cari prompt "Masukkan angka:" dan ambil hasil print-nya
                if (rawOutput.includes("Masukkan angka:")) {
                    reconstructed.push("Masukkan angka: ");
                    if (inputs[inputIndex] !== undefined) {
                        reconstructed.push(inputs[inputIndex]); // Simulasi ketik user
                        reconstructed.push(inputs[inputIndex]); // Hasil print(inputInt) dari biner
                        inputIndex++;
                    }
                }

                // 4. Ambil footer end
                if (rawOutput.includes("===== END INPUT =====")) {
                    reconstructed.push("===== END INPUT =====");
                }

                // Gabungkan semua komponen menggunakan Newline asli (\n)
                actualOutput = reconstructed.join('\n').trim();

            } else {
                actualOutput = execSync(`./out/main`, { encoding: 'utf-8' }).trim();
            }

            // 4. ASSERTION & DETAILED LINE-BY-LINE DIFF
            if (actualOutput === expectedOutput) {
                console.log(`✅ PASSED: ${file}`);
                passed++;
            } else {
                console.log(`❌ FAILED: ${file}`);
                console.log(`-----------------------------------------------`);
                console.log(`🔍 ANALISIS PERBEDAAN (LINE DIFF):`);
                
                const expectedLines = expectedOutput.split('\n');
                const actualLines = actualOutput.split('\n');
                const maxLines = Math.max(expectedLines.length, actualLines.length);

                for (let i = 0; i < maxLines; i++) {
                    const exp = expectedLines[i] !== undefined ? expectedLines[i] : '(baris kosong/tidak ada)';
                    const act = actualLines[i] !== undefined ? actualLines[i] : '(baris kosong/tidak ada)';

                    if (exp !== act) {
                        console.log(`\n[Baris ${i + 1}] ── Mismatch ditemukan!`);
                        console.log(`   🔴 Ekspektasi : "${exp}"`);
                        console.log(`   🟢 Terminal   : "${act}"`);
                    }
                }
                console.log(`===============================================`);
                failed++;
            }
        } catch (error) {
            console.log(`❌ CRASH / SEGFAULT / COMPILE ERROR: ${file}`);
            console.log(error.message);
            failed++;
        } finally {
            // 5. CLEANUP: Selalu bersihkan file main.ak sementara dari root
            if (fs.existsSync(TEMP_MAIN_AK)) {
                fs.unlinkSync(TEMP_MAIN_AK);
            }
        }
    });

    console.log(`\n===============================================`);
    console.log(`📊 HASIL AKHIR: ${passed} Berhasil | ${failed} Gagal\n`);
    
    if (failed > 0) process.exit(1);
}

runTests();