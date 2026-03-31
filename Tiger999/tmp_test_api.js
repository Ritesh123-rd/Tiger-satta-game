const https = require('https');
const fs = require('fs');

const API_BASE_URL = 'dhladvertising.site';
const API_PATH = '/goldenMatka/API';

function post(path, body) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify(body);
        const options = {
            hostname: API_BASE_URL,
            port: 443,
            path: API_PATH + path,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length
            }
        };

        const req = https.request(options, (res) => {
            let responseBody = '';
            res.on('data', (chunk) => {
                responseBody += chunk;
            });
            res.on('end', () => {
                resolve(responseBody);
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.write(data);
        req.end();
    });
}

async function testAPI() {
    let output = '';
    const log = (msg) => {
        console.log(msg);
        output += msg + '\n';
    };

    try {
        log('--- GET Ritesh (BBM2S8JQ893C) ---');
        let rBody = await post('/website/OtherDetailes/paymentDetailesUpdate.php', { user_id: 'BBM2S8JQ893C', action: 'get' });
        log(rBody);

        log('\n--- GET Postman User (V7ZDWT2V5RKE) ---');
        let pBody = await post('/website/OtherDetailes/paymentDetailesUpdate.php', { user_id: 'V7ZDWT2V5RKE', action: 'get' });
        log(pBody);

        fs.writeFileSync('c:\\VISUAL\\Tiger-999\\Tiger999\\comparison_get.txt', output);

    } catch (error) {
        log(`API Error: ${error.message}`);
    }
}

testAPI();
