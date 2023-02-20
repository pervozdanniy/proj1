const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const DIR = '.tmp/crypto';
const PRIV_KEY = path.join(DIR, 'priv.pem');

function register() {
  const { privateKey, publicKey } = crypto.generateKeyPairSync('ed25519');
  fs.mkdirSync(DIR, { recursive: true });
  fs.writeFileSync(PRIV_KEY, privateKey.export({ format: 'pem', type: 'pkcs8' }).toString('utf8'));

  console.log('PUBLIC KEY: ', publicKey.export({ format: 'der', type: 'spki' }).toString('hex'));
}

function sign(data, priv) {
  let privateKey;
  if (priv) {
    privateKey = crypto.createPrivateKey({
      key: Buffer.from(priv, 'hex'),
      format: 'der',
      type: 'pkcs8',
    });
  } else {
    privateKey = crypto.createPrivateKey({
      key: fs.readFileSync('~/.skopa/priv.pem', { encoding: 'utf8' }),
      format: 'pem',
      type: 'pkcs8',
    });
  }

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

function fromRaw(raw) {
  const oid = Buffer.from([0x06, 0x03, 0x2b, 0x65, 0x70]);
  const key = Buffer.from(raw, 'hex');
  const elements = Buffer.concat([
    Buffer.concat([
      Buffer.from([0x30]), // Sequence tag
      Buffer.from([oid.length]),
      oid,
    ]),
    Buffer.concat([
      Buffer.from([0x03]), // Bit tag
      Buffer.from([key.length + 1]),
      Buffer.from([0x00]), // Zero bit
      key,
    ]),
  ]);

  return Buffer.concat([
    Buffer.from([0x30]), // Sequence tag
    Buffer.from([elements.length]),
    elements,
  ]).toString('hex');
}

function clean() {
  fs.rmSync(PRIV_KEY);
}

const actions = { register, sign, verify, fromRaw, clean };

const fn = actions[process.argv[2]];
if (fn) {
  const res = fn.apply(null, process.argv.slice(3));
  res && console.log(res);
} else {
  console.error('UKNOWN ACTION', Object.keys(actions));
}
