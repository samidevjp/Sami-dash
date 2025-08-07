// server/wallet/getAppleCerts.ts
import fs from 'fs';
import path from 'path';

export function getAppleCerts() {
  const certDir = path.join(process.cwd(), 'server/certs');

  return {
    wwdr: fs.readFileSync(path.join(certDir, 'wwdr.pem')),
    signerCert: fs.readFileSync(path.join(certDir, 'signerCert.pem')),
    signerKey: fs.readFileSync(path.join(certDir, 'signerKey.pem')),
    signerKeyPassphrase: process.env.APPLE_WALLET_CERT_PASSPHRASE || ''
  };
}
