
// Note: In production, these should be stored securely in backend
const DIALOGFLOW_CONFIG = {
  credentials: {
    private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCW72Co0ZTvkLJe\n0gkIuhann76ALaPHJD2Xfcc7Xs0BYtNECAmZBf9Lo0qeSz+dfRO58QUSs7SQWl1g\nZgKWhr68HAOXLbliEtXKdeTQuknh4M4jkyt1sNtJSybhZDJg0HMM2H/wxB1gegs9\nwZ3Vv4ZcFbpTmjr54B0hmBe2lT/Lam3/HknhqSJOdOlQnw6bHpoC4JcWsaKz2tHb\nL2PNPTJ9opUo+2Gvr9jAGXgwRZtiWnClE0k7IWaDObmKfnZcU2OhqW2Wnog7dapD\n46s+m204ToV9Wy7fFWqk90dEhamdnoFcpl9emsiROxbP/6Tr0N6lwM/3ZwTzzzVs\nOkLY+YAJAgMBAAECggEAC/C7gEIg6r59xz+38b4Lo+6gqty8HQ60+v/7C9YWgz0k\nHU4XzkiEbLbUuhxArS7o1C1Tm1S78diIPw5K4Z7JcNxe0gNOwV9f6jX0kv5Nxnta\n6224LYW/JKJNR4g+Q7JHNmqxMmTytaq/VWnKA0/Ka2ICUnH8J5Tke791DsoUrieU\niPDfOY0glNzKvzWyM+2gPYuwkS9RV7d+CdcIVQXmtmTknNNZEGFzmXsDs7kzxSRg\nxe4Bne4Df4BwhaTs/NZKxjnDpKts+iJ5Ad5nb9zBLNk9RwRLctjbWG3J180oCirg\nS0jwGl8oN9u1tLMbOAnw95B2O4I2cj3m1prKAi0CpQKBgQDSILuDm9LtQCeSUpuH\n57C8YVHXD6dojemL4n1IUrPLysc76B3e/EqkPDW5xF9MaRM5YblDMTp+GlS9koLt\n9wv4xBFBEzXCKrgrebtgQhuIQgzHcaeuJrP9JUIBf40e2+mRlDtRLaPIvx2XnQoF\npQRDmB8Pjo7H9xkAxYBQNd7BFQKBgQC34pRKpxNut2/+OXAZOLLGjRcSHXAsVEIX\nVKcvvbo+fsRWq71u5cBEDUFf3nJw8dbwxS3gy4UULHGF14+QKNgO52TWGjlq+VE9\nvjuqpUHUXboMNqwV6iAVgcqycKOJ8k924Qq0n009hErJ/UZyyOErxOpGrxg5m2jB\n/B86JB84JQKBgDn+nsJsN4MTudhAxHx2DelwUs4wm9vXjyX0lO9pJAaTKPn3zobE\nyzUZCRsEf+ju90dXGXLaG3LCgbDwxwI2tS8rrjdvvd6hO8OEDZs7o62vzScez1DZ\njcPIjLctJR3nREfRya1WE2ZMmTZHOYTlTo/5ZFk+11mJcXUtDYUV2S0hAoGBALMQ\njo1/01mOgh2TO0kkQFs/C4dVaWWRi2aCxeeknxe6hGFODkNOsgLS0aWUzeaUalW9\n/aYZKfdyK/5E4oVkcLlatYQUt3MnY+h3Nk0/bjJqLwEzwDH68tFeuc84BtkPQDio\nfq9TLXlJOTcnT5H5ceQYdnbsjO+UGdhFNvd8M3aNAoGBAJciZfLcUbTJ4ES0ZnyD\njQLK8DQzzLwvX3NHyX4rSZX/PAbW/kNth/Q6GdtxWh52zAc+B2Wh+BZ/rRUw9qht\nD0f0SA5Wxr+8p7Jy0P0GNWiU2/qVuzKHPJH01zlEw6h0xPcYhZ0akugBUdzpwHEH\n3UnR9k+tg3hSlHriMzSN8s9O\n-----END PRIVATE KEY-----\n",
    client_email: "dialogflow-access@railmadadchatbot-lngs.iam.gserviceaccount.com"
  },
  projectId: "railmadadchatbot-lngs"
};

export const detectIntent = async (text: string): Promise<string> => {
  try {
    const sessionId = Math.random().toString(36).substring(7);
    const dialogflow = require('@google-cloud/dialogflow');
    const sessionClient = new dialogflow.SessionsClient({
      credentials: DIALOGFLOW_CONFIG.credentials,
      projectId: DIALOGFLOW_CONFIG.projectId
    });
    
    const sessionPath = sessionClient.projectAgentSessionPath(
      DIALOGFLOW_CONFIG.projectId,
      sessionId
    );

    const request = {
      session: sessionPath,
      queryInput: {
        text: {
          text: text,
          languageCode: 'en-US',
        },
      },
    };

    const responses = await sessionClient.detectIntent(request);
    return responses[0].queryResult.fulfillmentText || "I couldn't understand that.";
  } catch (error) {
    console.error('Error with Dialogflow:', error);
    return "Sorry, I'm having trouble understanding you right now.";
  }
};
