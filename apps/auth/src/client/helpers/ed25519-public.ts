// For Ed25519 public keys formatting ONLY

export const isRaw = (key: Buffer): boolean => key.length === 32;

export const isDerFormatted = (key: Buffer): boolean => {
  return key.length === 44 && key.readUint16BE() === 0x302a;
};

export const rawToDer = (key: Buffer): Buffer => {
  const oid = Buffer.from([0x06, 0x03, 0x2b, 0x65, 0x70]);
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
  ]);
};
