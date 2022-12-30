const crypto = require('node:crypto');

function register() {
  const { privateKey, publicKey } = crypto.generateKeyPairSync('ed25519');
  console.log('PIVATE KEY: ', privateKey.export({ format: 'der', type: 'pkcs8' }).toString('hex'));
  console.log('PUBLIC KEY: ', publicKey.export({ format: 'der', type: 'spki' }).toString('hex'));
}

function sign(key, data) {
  const privateKey = crypto.createPrivateKey({
    key: Buffer.from(key, 'hex'),
    format: 'der',
    type: 'pkcs8',
  });

  return crypto.sign(null, Buffer.from(data), privateKey).toString('hex');
}

function verify(key, data, signature) {
  const publicKey = crypto.createPublicKey({
    key: Buffer.from(key, 'hex'),
    format: 'der',
    type: 'spki',
  });
  const verify = crypto.verify(null, Buffer.from(data), publicKey, Buffer.from(signature, 'hex'));

  return { verify };
}

const actions = { register, sign, verify };

const fn = actions[process.argv[2]];
if (fn) {
  const res = fn.apply(null, process.argv.slice(3));
  res && console.log(res);
} else {
  console.error('UKNOWN ACTION', Object.keys(actions));
}
