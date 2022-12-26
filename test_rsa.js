const crypto = require('node:crypto');

const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 4096,
  publicKeyEncoding: {
    type: 'spki',
    format: 'pem',
  },
  privateKeyEncoding: {
    type: 'pkcs8',
    format: 'pem',
    cipher: 'aes-256-cbc',
    passphrase: 'top secret',
  },
});

const data = JSON.stringify({ login: 'test+asym' });

// const key = crypto.createPrivateKey(privateKey);
// console.log(privateKey);

const encoded = crypto.privateEncrypt({ key: privateKey, passphrase: 'top secret', type: 'pkcs8' }, Buffer.from(data));
const decoded = crypto.publicDecrypt(publicKey, encoded);

console.log('DATA', encoded.toString('base64'));
console.log(JSON.stringify({ name: 'test_rsa', pub_key: publicKey }));
