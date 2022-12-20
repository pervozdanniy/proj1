export function generatePassword(number, symbol, length) {
  let generatedPassword = '';
  const variationsCount = [number, symbol].length;

  for (let i = 0; i < length; i += variationsCount) {
    if (number) {
      generatedPassword += getRandomNumber();
    }
    if (symbol) {
      generatedPassword += getRandomSymbol();
    }
    generatedPassword += getRandomString();
  }

  const finalPassword = generatedPassword.slice(0, length);

  return finalPassword;
}

function getRandomString() {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < 7; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
}

function getRandomNumber() {
  return String.fromCharCode(Math.floor(Math.random() * 10) + 48);
}

function getRandomSymbol() {
  const symbols = '!@#$%^&*(){}[]<>';

  return symbols[Math.floor(Math.random() * symbols.length)];
}
