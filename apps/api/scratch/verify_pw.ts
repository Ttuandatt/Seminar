
import * as bcrypt from 'bcrypt';

const hash = '$2b$12$b/W0vUEVA4W/r9gWQPVX6erOiFwTeAIWEKn7FziQ1begoiSBtw2Lm';
const pw = 'admin123';

async function main() {
    const match = await bcrypt.compare(pw, hash);
    console.log(`Password "${pw}" matches hash: ${match}`);
    
    const hash2 = '$2b$12$BfmzORw8NVDrPp3eum45Uu9MT9coyJW3SR6k0VlyOSF0iHm41jTDy';
    const pw2 = 'tourist123';
    const match2 = await bcrypt.compare(pw2, hash2);
    console.log(`Password "${pw2}" matches hash: ${match2}`);
}

main();
