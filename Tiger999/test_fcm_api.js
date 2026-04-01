
const fetch = require('node-fetch');

async function testSendOtp() {
    const API_BASE_URL = 'https://dhladvertising.site/goldenMatka/API';
    const mobile = ''; // Using the number from the codebase as a test

    console.log(`[TEST] Sending OTP to ${mobile}`);

    try {
        const response = await fetch(`${API_BASE_URL}/userLogin/send_otp.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                mobile: mobile,
            }),
        });

        const text = await response.text();
        console.log('[TEST] Response Text:', text);

        try {
            const data = JSON.parse(text);
            console.log('[TEST] Parse Response:', data);
            if (data.status === true) {
                console.log('[TEST] SUCCESS: API accepted the request.');
            } else {
                console.log('[TEST] API returned false status. Possible issue or number already exists/active.');
            }
        } catch (e) {
            console.error('[TEST] JSON Parse Error. Response might not be valid JSON.');
        }

    } catch (error) {
        console.error('[TEST] Network Error:', error);
    }
}

testSendOtp();
