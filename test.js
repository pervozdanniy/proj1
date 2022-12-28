const crypto = require('node:crypto');

// const { privateKey, publicKey } = crypto.generateKeyPairSync('ed25519');
// console.log(
//   privateKey.export({ format: 'der', type: 'pkcs8' }).toString('hex'),
//   publicKey.export({ format: 'der', type: 'spki' }).toString('hex'),
// );

const privateKey = crypto.createPrivateKey({
  key: Buffer.from(
    '302e020100300506032b657004220420e32691ad15c8f58eb51ce03834a3f6d9e02563109486cbf569635e132611fdf8',
    'hex',
  ),
  format: 'der',
  type: 'pkcs8',
});

const publicKey = crypto.createPublicKey({
  key: Buffer.from('302a300506032b65700321003f65cf2b5f665a7b1d597bea5fda3bdb444be66584807b78bad9d706f56a87ef', 'hex'),
  format: 'der',
  type: 'spki',
});

// const data = JSON.stringify({ login: 'test_sign', countryId: 1 });
// const data = JSON.stringify({ login: 'test_sign' });
const data = JSON.stringify({ login: 'test_sign3' });
console.log(data);

const signature = crypto.sign(null, Buffer.from(data), privateKey);
console.log(signature.toString('hex'));

const verify = crypto.verify(null, Buffer.from(data), publicKey, signature);
console.log(verify);
