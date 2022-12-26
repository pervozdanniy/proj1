const assert = require('node:assert');

const crypto = require('node:crypto');

// console.log(crypto.getCiphers());

// console.log(getCurves());

// Generate Alice's keys...
// const alice = crypto.createECDH('secp521r1');
// const aliceKey = alice.generateKeys();

// // Generate Bob's keys...
// const bob = crypto.createECDH('secp521r1');
// const bobKey = bob.generateKeys();

// // Exchange and generate the secret...
// const aliceSecret = alice.computeSecret(bobKey);
// const bobSecret = bob.computeSecret(aliceKey);

// assert.strictEqual(aliceSecret.toString('hex'), bobSecret.toString('hex'));

// const algorithm = 'aes-128-cbc';

// const hash = crypto.createHash('sha256').update(aliceSecret).digest();
// const Securitykey = hash.subarray(0, 16);
// const initVector = hash.subarray(16, 32);

// // protected data
// const message = 'This is a secret message';

// // secret key generate 32 bytes of random data
// // const Securitykey = crypto.randomBytes(32);

// // the cipher function
// const cipher = crypto.createCipheriv(algorithm, Securitykey, initVector);

// // encrypt the message
// // input encoding
// // output encoding
// let encryptedData = cipher.update(message, 'utf-8', 'hex');

// encryptedData += cipher.final('hex');

// const decipher = crypto.createDecipheriv(algorithm, Securitykey, initVector);
// const decryptedData = decipher.update(encryptedData, 'hex', 'utf8');
// decipher.final();

// console.log('Encrypted message: ' + encryptedData, decryptedData);

// const client = crypto.createECDH('secp521r1');
// const clientKey = client.generateKeys();
// console.log('PUB', clientKey.toString('hex'));
// console.log('PRIV', client.getPrivateKey('hex'));

const c2 = crypto.createECDH('secp521r1');
c2.setPrivateKey(
  '010d546153ef1d77070910bb8de7c2af61d8e7840a21d2d87df3f68fed8e39173759dfdf3c51cf14981935e88cdb76078bfaa548a0f5ff1f8bc5ab0195dde960e6aa',
  'hex',
);
const secret = c2.computeSecret(
  '04012f10de483874a365ec613c0d9c13da7d6f991a7184e4e67be5733eb1af2e27f6197026d75fb9225561d1b78a35c1208bf7d6789f40add6d9ecab13d4b94f4a7263001b0db93afe0817a256cbee951abc98efc32b4250a8393edbc8b5b0e17b152c894907ae4811af584b63f1fce3f7ba752f990bf3f3dc6306d2e9e99da610f4a14ee1',
  'hex',
);

console.log('SECRET', secret.toString('hex'));

const data = { login: 'test+asym', countryId: 1 };

const algorithm = 'aes-128-cbc';

const hash = crypto.createHash('sha256').update(secret).digest();
const Securitykey = hash.subarray(0, 16);
const initVector = hash.subarray(16, 32);

const cipher = crypto.createCipheriv(algorithm, Securitykey, initVector);

let encryptedData = cipher.update(JSON.stringify(data), 'utf-8', 'base64');
// let encryptedData = cipher.update('qwewq ewqe wqeqw ewqef fewqewqewqewq', 'utf-8', 'hex');

encryptedData += cipher.final('base64');

console.log('DATA', encryptedData);

const a = Buffer.from(
  '01f450c25a5d60607e152428b271228e701890bde7dcaf92b34cf82b1755ad30c5c0377a4653f37f14cb706a29710558409f9d498fabcfd4d33530995b5fe670beaa',
  'hex',
).toString('base64');
console.log('AAAA', a);
