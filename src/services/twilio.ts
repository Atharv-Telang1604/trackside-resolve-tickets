
// Note: In production, these should be stored securely in backend
const TWILIO_CONFIG = {
  accountSid: 'AC8557eab49ba111a8e41d40d3b55dbebb',
  authToken: 'b06e5b7359e76de996965038c5ba3c48',
  fromNumber: '+19787055560',
  forwardToNumber: '+917058382210'
};

export const initiateTwilioCall = async (toNumber: string): Promise<boolean> => {
  try {
    // In production, this should be a backend API call
    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${TWILIO_CONFIG.accountSid}/Calls.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + btoa(`${TWILIO_CONFIG.accountSid}:${TWILIO_CONFIG.authToken}`)
      },
      body: new URLSearchParams({
        'To': TWILIO_CONFIG.forwardToNumber, // Forward all calls to this number
        'From': TWILIO_CONFIG.fromNumber,
        'Url': 'http://demo.twilio.com/docs/voice.xml', // Demo TwiML
        'StatusCallback': 'http://example.com/callback', // Optional: endpoint to receive call status updates
      })
    });

    if (!response.ok) {
      throw new Error('Failed to initiate call');
    }

    return true;
  } catch (error) {
    console.error('Error initiating Twilio call:', error);
    return false;
  }
};

