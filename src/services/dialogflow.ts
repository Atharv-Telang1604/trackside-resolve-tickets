
// Note: In production, these should be stored securely in backend
const DIALOGFLOW_CONFIG = {
  credentials: {
    private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCW72Co0ZTvkLJe\n0gkIuhann76ALaPHJD2Xfcc7Xs0BYtNECAmZBf9Lo0qeSz+dfRO58QUSs7SQWl1g\nZgKWhr68HAOXLbliEtXKdeTQuknh4M4jkyt1sNtJSybhZDJg0HMM2H/wxB1gegs9\nwZ3Vv4ZcFbpTmjr54B0hmBe2lT/Lam3/HknhqSJOdOlQnw6bHpoC4JcWsaKz2tHb\nL2PNPTJ9opUo+2Gvr9jAGXgwRZtiWnClE0k7IWaDObmKfnZcU2OhqW2Wnog7dapD\n46s+m204ToV9Wy7fFWqk90dEhamdnoFcpl9emsiROxbP/6Tr0N6lwM/3ZwTzzzVs\nOkLY+YAJAgMBAAECggEAC/C7gEIg6r59xz+38b4Lo+6gqty8HQ60+v/7C9YWgz0k\nHU4XzkiEbLbUuhxArS7o1C1Tm1S78diIPw5K4Z7JcNxe0gNOwV9f6jX0kv5Nxnta\n6224LYW/JKJNR4g+Q7JHNmqxMmTytaq/VWnKA0/Ka2ICUnH8J5Tke791DsoUrieU\niPDfOY0glNzKvzWyM+2gPYuwkS9RV7d+CdcIVQXmtmTknNNZEGFzmXsDs7kzxSRg\nxe4Bne4Df4BwhaTs/NZKxjnDpKts+iJ5Ad5nb9zBLNk9RwRLctjbWG3J180oCirg\nS0jwGl8oN9u1tLMbOAnw95B2O4I2cj3m1prKAi0CpQKBgQDSILuDm9LtQCeSUpuH\n57C8YVHXD6dojemL4n1IUrPLysc76B3e/EqkPDW5xF9MaRM5YblDMTp+GlS9koLt\n9wv4xBFBEzXCKrgrebtgQhuIQgzHcaeuJrP9JUIBf40e2+mRlDtRLaPIvx2XnQoF\npQRDmB8Pjo7H9xkAxYBQNd7BFQKBgQC34pRKpxNut2/+OXAZOLLGjRcSHXAsVEIX\nVKcvvbo+fsRWq71u5cBEDUFf3nJw8dbwxS3gy4UULHGF14+QKNgO52TWGjlq+VE9\nvjuqpUHUXboMNqwV6iAVgcqycKOJ8k924Qq0n009hErJ/UZyyOErxOpGrxg5m2jB\n/B86JB84JQKBgDn+nsJsN4MTudhAxHx2DelwUs4wm9vXjyX0lO9pJAaTKPn3zobE\nyzUZCRsEf+ju90dXGXLaG3LCgbDwxwI2tS8rrjdvvd6hO8OEDZs7o62vzScez1DZ\njcPIjLctJR3nREfRya1WE2ZMmTZHOYTlTo/5ZFk+11mJcXUtDYUV2S0hAoGBALMQ\njo1/01mOgh2TO0kkQFs/C4dVaWWRi2aCxeeknxe6hGFODkNOsgLS0aWUzeaUalW9\n/aYZKfdyK/5E4oVkcLlatYQUt3MnY+h3Nk0/bjJqLwEzwDH68tFeuc84BtkPQDio\nfq9TLXlJOTcnT5H5ceQYdnbsjO+UGdhFNvd8M3aNAoGBAJciZfLcUbTJ4ES0ZnyD\njQLK8DQzzLwvX3NHyX4rSZX/PAbW/kNth/Q6GdtxWh52zAc+B2Wh+BZ/rRUw9qht\nD0f0SA5Wxr+8p7Jy0P0GNWiU2/qVuzKHPJH01zlEw6h0xPcYhZ0akugBUdzpwHEH\n3UnR9k+tg3hSlHriMzSN8s9O\n-----END PRIVATE KEY-----\n",
    client_email: "dialogflow-access@railmadadchatbot-lngs.iam.gserviceaccount.com"
  },
  projectId: "railmadadchatbot-lngs"
};

// Mock responses for common train-related queries when we can't use the Dialogflow API in browser
const mockResponses = {
  "train schedule": "Train schedules can be viewed on our website or mobile app. You can also call our customer service at 1-800-RAIL-INFO for the latest schedule information.",
  "ticket": "You can purchase tickets online, through our mobile app, at station counters, or from ticket vending machines at all major stations.",
  "delay": "We apologize for any delays. Real-time train status updates are available on our mobile app and digital displays at stations.",
  "platform": "Platform information is displayed on the digital boards at the station and announced 20 minutes before arrival. You can also check our mobile app for real-time platform updates.",
  "wifi": "We provide complimentary WiFi on all our premium trains and at major stations. Connect to 'RailMadad-Free' network and follow the instructions.",
  "electrical": "For electrical issues like charging ports not working or lights malfunctioning, please alert the train conductor or submit a complaint through our app.",
  "food": "Food and beverage services are available in the dining car on long-distance trains. Major stations also have food courts and vendors on platforms.",
  "clean": "If you notice cleanliness issues, please report them to the onboard staff or use the 'Report Cleanliness' feature in our mobile app.",
  "luggage": "Each passenger is allowed two pieces of luggage (up to 50 pounds each) without additional charges. Extra or overweight luggage will incur fees.",
  "help": "For immediate assistance, please press the help button located above your seat or contact the train attendant. For emergencies, call our 24/7 helpline at 1-800-RAIL-HELP."
};

// Function to detect the intent using our mock system in the browser
export const detectIntent = async (text: string): Promise<string> => {
  try {
    // Log the incoming message for debugging
    console.log('Processing message:', text);
    
    // Convert to lowercase for case-insensitive matching
    const lowerText = text.toLowerCase();
    
    // Check our mock responses for matching keywords
    for (const [keyword, response] of Object.entries(mockResponses)) {
      if (lowerText.includes(keyword)) {
        console.log(`Found matching keyword: ${keyword}`);
        return response;
      }
    }
    
    // If we have no specific match, return a general response
    if (lowerText.includes("how") || lowerText.includes("what") || lowerText.includes("when") || 
        lowerText.includes("where") || lowerText.includes("why")) {
      return "I can help you with information about train schedules, tickets, platforms, WiFi, food services, and reporting issues. Could you please specify what you need assistance with?";
    }
    
    // Default fallback response for unrecognized queries
    return "I'm here to help with your train journey. You can ask me about schedules, tickets, station facilities, onboard services, or reporting issues.";
    
  } catch (error) {
    console.error('Error processing message:', error);
    return "Sorry, I'm having trouble understanding you right now. Please try asking in a different way or contact our customer service.";
  }
};
