import { API_BASE_URL } from './config';

export const loginUser = async (mobile, password) => {
    try {
        console.log('Login Attempt for:', mobile);

        const response = await fetch(`${API_BASE_URL}/userLogin/login.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                mobile: mobile,
                password: password,
            }),
        });

        const rawText = await response.text();
        console.log('Login Raw Response:', rawText);

        try {
            const data = JSON.parse(rawText);
            return data;
        } catch (e) {
            console.error('JSON Parse Error:', e);
            // Some PHP servers return text before JSON, let's try to find JSON in the string
            const jsonMatch = rawText.match(/\{.*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            throw new Error('Invalid JSON: ' + rawText.substring(0, 50));
        }
    } catch (error) {
        console.error('Login API Error:', error);
        throw error;
    }
};

export const registerUser = async (username, password, mobile) => {
    try {
        const response = await fetch(`${API_BASE_URL}/userLogin/register.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: username,
                password: password,
                mobile: mobile,
            }),
        });

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Register API Error:', error);
        throw error;
    }
};

export const getWalletBalance = async (mobile, userId = null) => {
    try {
        console.log('Fetching balance for:', { mobile, userId });
        const response = await fetch(`${API_BASE_URL}/userLogin/balance.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                mobile: mobile,
                user_id: userId,
            }),
        });

        const text = await response.text();
        console.log('Balance API raw response:', text);

        const data = JSON.parse(text);
        return data;
    } catch (error) {
        console.error('Get Wallet Balance API Error:', error);
        throw error;
    }
};

export const getDateTime = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/userLogin/dateTime.php`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Get Date/Time API Error:', error);
        throw error;
    }
};
export const getMarkets = async () => {
    try {
        console.log('Fetching Markets from:', `${API_BASE_URL}/website/Reguler/read/market.php`);
        const response = await fetch(`${API_BASE_URL}/website/Reguler/read/market.php`);

        const rawText = await response.text();
        console.log('Markets Raw Response snippet:', rawText.substring(0, 200));

        try {
            const data = JSON.parse(rawText);
            return data;
        } catch (e) {
            console.error('Markets JSON Parse Error:', e);
            const jsonMatch = rawText.match(/\{.*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            throw new Error('Invalid Markets JSON: ' + rawText.substring(0, 50));
        }
    } catch (error) {
        console.error('Get Markets API Error:', error);
        throw error;
    }
};
export const getBetHistory = async (userId, firstDate, lastDate) => {
    try {
        console.log('Fetching Bet History for:', { userId, firstDate, lastDate });
        const response = await fetch(`${API_BASE_URL}/website/OtherDetailes/betHistory.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user_id: userId,
                firstdate: firstDate,
                lastdate: lastDate,
            }),
        });

        const text = await response.text();
        console.log('Bet History API raw response snippet:', text.substring(0, 200));

        try {
            const data = JSON.parse(text);
            return data;
        } catch (e) {
            console.error('Bet History JSON Parse Error:', e);
            const jsonMatch = text.match(/\{.*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            throw new Error('Invalid Bet History JSON: ' + text.substring(0, 50));
        }
    } catch (error) {
        console.error('Get Bet History API Error:', error);
        throw error;
    }
};

export const getFundRequestHistory = async (userId) => {
    try {
        console.log('Fetching Fund Request History for:', userId);
        const response = await fetch(`${API_BASE_URL}/website/OtherDetailes/UserAddPointsRequests.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user_id: userId,
            }),
        });

        const text = await response.text();
        console.log('Fund Request API raw response snippet:', text.substring(0, 200));

        try {
            const data = JSON.parse(text);
            return data;
        } catch (e) {
            console.error('Fund Request JSON Parse Error:', e);
            const jsonMatch = text.match(/\{.*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            throw new Error('Invalid Fund Request JSON: ' + text.substring(0, 50));
        }
    } catch (error) {
        console.error('Get Fund Request History API Error:', error);
        throw error;
    }
};


export const getWithdrawRequestHistory = async (userId) => {
    try {
        console.log('Fetching Withdraw Request History for:', userId);
        const response = await fetch(`${API_BASE_URL}/website/OtherDetailes/UserWithdrawPointsRequests.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user_id: userId,
            }),
        });

        const text = await response.text();
        console.log('Withdraw Request API raw response snippet:', text.substring(0, 200));

        try {
            const data = JSON.parse(text);
            return data;
        } catch (e) {
            console.error('Withdraw Request JSON Parse Error:', e);
            const jsonMatch = text.match(/\{.*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            throw new Error('Invalid Withdraw Request JSON: ' + text.substring(0, 50));
        }
    } catch (error) {
        console.error('Get Withdraw Request History API Error:', error);
        throw error;
    }
};
export const updateBankDetails = async (details) => {
    try {
        console.log('Updating Bank Details for:', details.user_id);
        const response = await fetch(`${API_BASE_URL}/website/OtherDetailes/paymentDetailesUpdate.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user_id: details.user_id,
                username: details.username,
                action: 'update',
                bank_name: details.bank_name,
                ac_holder_name: details.ac_holder_name,
                ac_number: details.ac_number,
                ifsc_code: details.ifsc_code,
                upi: details.upi,
                paytm: details.paytm,
                google_pay: details.google_pay,
                phone_pay: details.phone_pay,
            }),
        });

        const text = await response.text();
        console.log('Update Bank Details API raw response:', text);

        try {
            const data = JSON.parse(text);
            return data;
        } catch (e) {
            console.error('Update Bank Details JSON Parse Error:', e);
            const jsonMatch = text.match(/\{.*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            throw new Error('Invalid Update Bank Details JSON: ' + text.substring(0, 50));
        }
    } catch (error) {
        console.error('Update Bank Details API Error:', error);
        throw error;
    }
};

export const getBankDetails = async (userId) => {
    try {
        console.log('Fetching Bank Details for:', userId);
        const response = await fetch(`${API_BASE_URL}/website/OtherDetailes/paymentDetailesUpdate.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user_id: userId,
                action: 'read',
            }),
        });

        const text = await response.text();
        console.log('Get Bank Details API raw response:', text);

        try {
            const data = JSON.parse(text);
            return data;
        } catch (e) {
            console.error('Get Bank Details JSON Parse Error:', e);
            const jsonMatch = text.match(/\{.*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            throw new Error('Invalid Get Bank Details JSON: ' + text.substring(0, 50));
        }
    } catch (error) {
        console.error('Get Bank Details API Error:', error);
        throw error;
    }
};
export const getUserProfile = async (userId) => {
    try {
        console.log('Fetching Profile for:', userId);
        const response = await fetch(`${API_BASE_URL}/website/OtherDetailes/myProfile.php?user_id=${userId}`);

        const text = await response.text();
        console.log('Profile API raw response:', text);

        try {
            const data = JSON.parse(text);
            return data;
        } catch (e) {
            console.error('Profile JSON Parse Error:', e);
            const jsonMatch = text.match(/\{.*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            throw new Error('Invalid Profile JSON: ' + text.substring(0, 50));
        }
    } catch (error) {
        console.error('Get Profile API Error:', error);
        throw error;
    }
};





//All Games

export const getSingleDigitGame = async (UserId, Username, Numbers, Amounts, market_name, market_id, session) => {
    try {
        console.log('Placing Bet via Single Digit Game API:', { UserId, Username, Numbers, Amounts, market_name, market_id, session });
        const response = await fetch(`${API_BASE_URL}/website/Reguler/insert/BetDataInsertSingleAnk.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                "user_id": UserId,
                "username": Username,
                "numbers": Numbers,
                "amounts": Amounts,
                "market_name": market_name,
                "market_id": market_id,
                "session": session
            }),
        });

        const text = await response.text();
        console.log('Place Bet API raw response:', text);

        try {
            const data = JSON.parse(text);
            return data;
        } catch (e) {
            console.error('Place Bet JSON Parse Error:', e);
            const jsonMatch = text.match(/\{.*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            throw new Error('Invalid Place Bet JSON: ' + text.substring(0, 50));
        }
    } catch (error) {
        console.error('Place Bet API Error:', error);
        throw error;
    }
};


export const JodiGame = async (UserId, Username, Numbers, Amounts, market_name, market_id) => {
    try {
        console.log('Placing Bet via Jodi Game API:', { UserId, Username, Numbers, Amounts, market_name, market_id });
        const response = await fetch(`${API_BASE_URL}/website/Reguler/insert/BetDataInsertJodi.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                "user_id": UserId,
                "username": Username,
                "numbers": Numbers,
                "amounts": Amounts,
                "market_name": market_name,
                "market_id": market_id,
            }),
        });

        const text = await response.text();
        console.log('Place Bet API raw response:', text);

        try {
            const data = JSON.parse(text);
            return data;
        } catch (e) {
            console.error('Place Bet JSON Parse Error:', e);
            const jsonMatch = text.match(/\{.*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            throw new Error('Invalid Place Bet JSON: ' + text.substring(0, 50));
        }
    } catch (error) {
        console.error('Place Bet API Error:', error);
        throw error;
    }
};


export const SinglePatti = async (UserId, Username, Numbers, Amounts, market_name, market_id, session) => {
    try {
        console.log('Placing Bet via Single Patti API:', { UserId, Username, Numbers, Amounts, market_name, market_id, session });
        const response = await fetch(`${API_BASE_URL}/website/Reguler/insert/BetDataInsertSinglePatti.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                "user_id": UserId,
                "username": Username,
                "numbers": Numbers,
                "amounts": Amounts,
                "market_name": market_name,
                "market_id": market_id,
                "session": session
            }),
        });

        const text = await response.text();
        console.log('Place Bet API raw response:', text);

        try {
            const data = JSON.parse(text);
            return data;
        } catch (e) {
            console.error('Place Bet JSON Parse Error:', e);
            const jsonMatch = text.match(/\{.*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            throw new Error('Invalid Place Bet JSON: ' + text.substring(0, 50));
        }
    } catch (error) {
        console.error('Place Bet API Error:', error);
        throw error;
    }
};



export const DoublePatti = async (UserId, Username, Numbers, Amounts, market_name, market_id, session) => {
    try {
        console.log('Placing Bet via Single Patti API:', { UserId, Username, Numbers, Amounts, market_name, market_id, session });
        const response = await fetch(`${API_BASE_URL}/website/Reguler/insert/BetDataInsertDoublePatti.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                "user_id": UserId,
                "username": Username,
                "numbers": Numbers,
                "amounts": Amounts,
                "market_name": market_name,
                "market_id": market_id,
                "session": session
            }),
        });

        const text = await response.text();
        console.log('Place Bet API raw response:', text);

        try {
            const data = JSON.parse(text);
            return data;
        } catch (e) {
            console.error('Place Bet JSON Parse Error:', e);
            const jsonMatch = text.match(/\{.*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            throw new Error('Invalid Place Bet JSON: ' + text.substring(0, 50));
        }
    } catch (error) {
        console.error('Place Bet API Error:', error);
        throw error;
    }
};



export const TriplePatti = async (UserId, Username, Numbers, Amounts, market_name, market_id, session) => {
    try {
        console.log('Placing Bet via Single Patti API:', { UserId, Username, Numbers, Amounts, market_name, market_id, session });
        const response = await fetch(`${API_BASE_URL}/website/Reguler/insert/BetDataInsertTriplePatti.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                "user_id": UserId,
                "username": Username,
                "numbers": Numbers,
                "amounts": Amounts,
                "market_name": market_name,
                "market_id": market_id,
                "session": session
            }),
        });

        const text = await response.text();
        console.log('Place Bet API raw response:', text);

        try {
            const data = JSON.parse(text);
            return data;
        } catch (e) {
            console.error('Place Bet JSON Parse Error:', e);
            const jsonMatch = text.match(/\{.*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            throw new Error('Invalid Place Bet JSON: ' + text.substring(0, 50));
        }
    } catch (error) {
        console.error('Place Bet API Error:', error);
        throw error;
    }
};


export const spdptp = async (UserId, Username, Bids, market_name, market_id, total_amount) => {
    try {
        console.log('Placing Bet via SP_DP_TP API:', { UserId, Username, Bids, market_name, market_id, total_amount });
        const response = await fetch(`${API_BASE_URL}/website/Reguler/insert/BetDataInsert_SP_DP_TP.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                "user_id": UserId,
                "username": Username,
                "bids": Bids,
                "market_name": market_name,
                "market_id": market_id,
                "total_amount": total_amount
            }),
        });

        const text = await response.text();
        console.log('Place Bet API raw response:', text);

        try {
            const data = JSON.parse(text);
            return data;
        } catch (e) {
            console.error('Place Bet JSON Parse Error:', e);
            const jsonMatch = text.match(/\{.*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            throw new Error('Invalid Place Bet JSON: ' + text.substring(0, 50));
        }
    } catch (error) {
        console.error('Place Bet API Error:', error);
        throw error;
    }
};



export const placeSPMotorBet = async (UserId, Username, Bids, market_name, market_id, total_amount, pana_name) => {
    try {
        console.log('Placing Bet via placeSPMotorBet API (Revised):', { UserId, Username, Bids, market_name, market_id, total_amount, pana_name });
        const response = await fetch(`${API_BASE_URL}/website/Reguler/insert/BetDataInsertSP_Motor.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                "user_id": UserId,
                "username": Username,
                "bids": Bids,
                "market_id": market_id,
                "market_name": market_name,
                "total_amount": total_amount,
                "pana_name": pana_name
            }),
        });

        const text = await response.text();
        console.log('Place Bet API raw response:', text);

        try {
            const data = JSON.parse(text);
            return data;
        } catch (e) {
            console.error('Place Bet JSON Parse Error:', e);
            const jsonMatch = text.match(/\{.*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            throw new Error('Invalid Place Bet JSON: ' + text.substring(0, 50));
        }
    } catch (error) {
        console.error('Place Bet API Error:', error);
        throw error;
    }
};


export const placeDPMotorBet = async (UserId, Username, Bids, market_name, market_id, total_amount) => {
    try {
        console.log('Placing Bet via placeSPMotorBet API (Revised):', { UserId, Username, Bids, market_name, market_id, total_amount });
        const response = await fetch(`${API_BASE_URL}/website/Reguler/insert/BetDataInsertDP_Motor.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                "user_id": UserId,
                "username": Username,
                "bids": Bids,
                "market_id": market_id,
                "market_name": market_name,
                "total_amount": total_amount,
            }),
        });

        const text = await response.text();
        console.log('Place Bet API raw response:', text);

        try {
            const data = JSON.parse(text);
            return data;
        } catch (e) {
            console.error('Place Bet JSON Parse Error:', e);
            const jsonMatch = text.match(/\{.*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            throw new Error('Invalid Place Bet JSON: ' + text.substring(0, 50));
        }
    } catch (error) {
        console.error('Place Bet API Error:', error);
        throw error;
    }
};


export const placeOddEvenBet = async (UserId, Username, Bids, market_name, market_id, total_amount) => {
    try {
        console.log('Placing Bet via placeOddEvenBet API (Revised):', { UserId, Username, Bids, market_name, market_id, total_amount });
        const response = await fetch(`${API_BASE_URL}/website/Reguler/insert/BetDataInsertOddEven.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                "user_id": UserId,
                "username": Username,
                "bids": Bids,
                "market_id": market_id,
                "market_name": market_name,
                "total_amount": total_amount,
            }),
        });

        const text = await response.text();
        console.log('Place Bet API raw response:', text);

        try {
            const data = JSON.parse(text);
            return data;
        } catch (e) {
            console.error('Place Bet JSON Parse Error:', e);
            const jsonMatch = text.match(/\{.*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            throw new Error('Invalid Place Bet JSON: ' + text.substring(0, 50));
        }
    } catch (error) {
        console.error('Place Bet API Error:', error);
        throw error;
    }
};


export const placeRedJodiBet = async (UserId, Username, Bids, market_name, market_id, total_amount) => {
    try {
        console.log('Placing Bet via placeRedJodiBet API (Revised):', { UserId, Username, Bids, market_name, market_id, total_amount });
        const response = await fetch(`${API_BASE_URL}/website/Reguler/insert/BetDataInsertRedJodi.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                "user_id": UserId,
                "username": Username,
                "bids": Bids,
                "market_id": market_id,
                "market_name": market_name,
                "total_amount": total_amount,
            }),
        });

        const text = await response.text();
        console.log('Place Bet API raw response:', text);

        try {
            const data = JSON.parse(text);
            return data;
        } catch (e) {
            console.error('Place Bet JSON Parse Error:', e);
            const jsonMatch = text.match(/\{.*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            throw new Error('Invalid Place Bet JSON: ' + text.substring(0, 50));
        }
    } catch (error) {
        console.error('Place Bet API Error:', error);
        throw error;
    }
};


export const placeHalfSangamABet = async (UserId, Username, Bids, market_name, market_id, total_amount, session, pana_name) => {
    try {
        console.log('Placing Bet via placeHalfSangamABet API (Revised):', { UserId, Username, Bids, market_name, market_id, total_amount, session, pana_name });
        const response = await fetch(`${API_BASE_URL}/website/Reguler/insert/BetDataInsertHalfSangamA.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                "user_id": UserId,
                "username": Username,
                "bids": Bids,
                "market_id": market_id,
                "market_name": market_name,
                "total_amount": total_amount,
                "session": session,
                "pana_name": pana_name
            }),
        });

        const text = await response.text();
        console.log('Place Bet API raw response:', text);

        try {
            const data = JSON.parse(text);
            return data;
        } catch (e) {
            console.error('Place Bet JSON Parse Error:', e);
            const jsonMatch = text.match(/\{.*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            throw new Error('Invalid Place Bet JSON: ' + text.substring(0, 50));
        }
    } catch (error) {
        console.error('Place Bet API Error:', error);
        throw error;
    }
};


export const placeHalfSangamBBet = async (UserId, Username, Bids, market_name, market_id, total_amount, session, pana_name) => {
    try {
        console.log('Placing Bet via placeHalfSangamBBet API (Revised):', { UserId, Username, Bids, market_name, market_id, total_amount, session, pana_name });
        const response = await fetch(`${API_BASE_URL}/website/Reguler/insert/BetDataInsertHalfSangamB.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                "user_id": UserId,
                "username": Username,
                "bids": Bids,
                "market_id": market_id,
                "market_name": market_name,
                "total_amount": total_amount,
                "session": session,
                "pana_name": pana_name
            }),
        });

        const text = await response.text();
        console.log('Place Bet API raw response:', text);

        try {
            const data = JSON.parse(text);
            return data;
        } catch (e) {
            console.error('Place Bet JSON Parse Error:', e);
            const jsonMatch = text.match(/\{.*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            throw new Error('Invalid Place Bet JSON: ' + text.substring(0, 50));
        }
    } catch (error) {
        console.error('Place Bet API Error:', error);
        throw error;
    }
};


export const placeFullSangamBet = async (UserId, Username, Bids, market_name, market_id, total_amount, open_closed) => {
    try {
        console.log('Placing Bet via placeFullSangamBet API:', { UserId, Username, Bids, market_name, market_id, total_amount, open_closed });
        const response = await fetch(`${API_BASE_URL}/website/Reguler/insert/BetDataInsertFullSangam.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                "user_id": UserId,
                "username": Username,
                "bids": Bids,
                "market_id": market_id,
                "market_name": market_name,
                "total_amount": total_amount,
                "open_closed": open_closed,
                "pana_name": "Full Sangam"
            }),
        });

        const text = await response.text();
        console.log('Place Bet API raw response:', text);

        try {
            const data = JSON.parse(text);
            return data;
        } catch (e) {
            console.error('Place Bet JSON Parse Error:', e);
            const jsonMatch = text.match(/\{.*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            throw new Error('Invalid Place Bet JSON: ' + text.substring(0, 50));
        }
    } catch (error) {
        console.error('Place Bet API Error:', error);
        throw error;
    }
};