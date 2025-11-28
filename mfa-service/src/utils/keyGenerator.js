const crypto = require('crypto');

const generateReadableKey = (email, secret) => {
  const username = email.split('@')[0];
  
  // Take 4 characters from username (uppercase)
  let userPart = username.substring(0, 4).toUpperCase();
  if (userPart.length < 4) {
    userPart = userPart.padEnd(4, 'X'); // Pad with X if username is shorter
  }
  
  // Generate 4-digit random number (1000-9999)
  const randomNum = crypto.randomInt(1000, 9999);
  
  // Generate 4 random uppercase letters (excluding I,O for clarity)
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // No I, O
  let randomAlpha = '';
  for (let i = 0; i < 4; i++) {
    randomAlpha += alphabet[crypto.randomInt(0, alphabet.length)];
  }
  
  // Generate 4 more random uppercase letters
  let randomAlpha2 = '';
  for (let i = 0; i < 4; i++) {
    randomAlpha2 += alphabet[crypto.randomInt(0, alphabet.length)];
  }
  
  // Combine: USER4567ABCDWXYZ (4 user + 4 numbers + 8 letters)
  const readableKey = `${userPart}${randomNum}${randomAlpha}${randomAlpha2}`;
  
  return readableKey;
};

module.exports = { generateReadableKey };