const crypto = require('crypto');

// const { publicKey, privateKey } = crypto.generateKeyPairSync('ed25519');
const { publicKey, privateKey } = crypto.generateKeyPairSync('ec', {
  namedCurve: 'sect239k1',
});

const message = JSON.stringify({ username: 'test_username', balance: 500.96 });
console.log(
  message,
  publicKey.export({ type: 'spki', format: 'der' }).toString('hex'),
  'OPA',
  privateKey.export({ type: 'pkcs8', format: 'der' }).toString('hex'),
);

const signature = crypto.sign(null, Buffer.from(message), privateKey);
console.log(signature);

const verified = crypto.verify(
  null,
  Buffer.from(message),
  publicKey,
  signature,
);
console.log('Match:', verified);
