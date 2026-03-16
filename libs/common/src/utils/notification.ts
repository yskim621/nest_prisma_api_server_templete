import axios from 'axios';

export async function sendNotification(type: string, title: string, textMessage: string, errorObj?: unknown): Promise<void> {
  let themeColor: string;
  switch (type) {
    case 'warning': themeColor = 'FFCC00'; break;
    case 'error': themeColor = 'EA4300'; break;
    case 'success': themeColor = '00CC00'; break;
    default: themeColor = '808080'; break;
  }
  const message = {
    '@type': 'MessageCard',
    '@context': 'http://schema.org/extensions',
    themeColor,
    title,
    text: textMessage,
  };
  if (errorObj) {
    message.text += '\n\nError Details: ' + JSON.stringify(errorObj, null, 2);
  }
  try {
    await axios.post(process.env.SLACK_WEBHOOK_ERROR, message);
  } catch (error) {
    console.error('Failed to send ' + type + ' notification:', error.message);
  }
}
