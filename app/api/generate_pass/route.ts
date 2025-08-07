import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { PKPass } from 'passkit-generator';
import jwt from 'jsonwebtoken';
import { getAppleCerts } from '@/server/wallet/getAppleCerts';

export function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}

const threshold = 150;

function getRelativeLuminance(hex: string | null | undefined): string {
  hex = hex?.replace(/^#/, '');
  const hexRegex = /^[0-9A-F]{6}$/i;

  if (!hex || !hexRegex.test(hex)) {
    return 'inherit';
  }
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;

  return luminance > threshold ? 'rgb(0, 0, 0)' : 'rgb(255, 255, 255)';
}

function hexToRgb(hex: string): string {
  const match = hex.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
  if (!match) throw new Error('Invalid hex color format');
  const [, r, g, b] = match;
  return `rgb(${parseInt(r, 16)}, ${parseInt(g, 16)}, ${parseInt(b, 16)})`;
}

function extractBase64Data(dataUrl: string, label = 'image') {
  if (!dataUrl || typeof dataUrl !== 'string') {
    throw new Error(`${label} is missing or not a string`);
  }
  const parts = dataUrl.split(',');
  if (parts.length !== 2 || !parts[1]) {
    throw new Error(`${label} is not a valid base64 string`);
  }
  return parts[1];
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      title,
      amount,
      business_name,
      logo,
      stripImage,
      valid_until,
      walletType = 'APPLE',
      email,
      coupon_code,
      hasNFCSupport,
      from,
      to,
      primary_color,
      secondary_color,
      design_type
    } = body;

    if (
      !title ||
      !amount ||
      !business_name ||
      !logo ||
      !valid_until ||
      !coupon_code
    ) {
      return new NextResponse(
        JSON.stringify({ message: 'Missing required fields' }),
        {
          status: 400,
          headers: { 'Access-Control-Allow-Origin': '*' }
        }
      );
    }

    const serialNumber = `card-${Date.now()}`;
    const expirationDate = new Date(valid_until).toISOString().split('T')[0];

    if (walletType === 'APPLE') {
      const { wwdr, signerCert, signerKey, signerKeyPassphrase } =
        getAppleCerts();

      const passJson: any = {
        formatVersion: 1,
        passTypeIdentifier: process.env.APPLE_WALLET_BUNDLE_ID,
        serialNumber,
        teamIdentifier: process.env.APPLE_WALLET_TEAM_ID,
        organizationName: business_name,
        description: 'Gift Voucher',
        logoText: design_type === 'visual' ? title : business_name,
        foregroundColor: getRelativeLuminance(primary_color),
        backgroundColor: hexToRgb(primary_color),
        labelColor: hexToRgb(secondary_color),
        suppressStripShine: true
      };

      if (design_type === 'visual') {
        passJson.coupon = {
          headerFields: [
            { key: 'business', label: 'Business', value: business_name }
          ],
          auxiliaryFields: [
            { key: 'amount', label: 'Value', value: `$${amount}` },
            { key: 'valid', label: 'Valid Until', value: expirationDate }
          ],
          backFields: [
            {
              key: 'terms',
              label: 'Terms & Conditions',
              value: 'One-time use only. Not transferable. No cash value.'
            },
            { key: 'email', label: 'Recipient Email', value: email },
            { key: 'from', label: 'From', value: from },
            { key: 'to', label: 'To', value: to }
          ]
        };
      } else {
        passJson.generic = {
          primaryFields: [{ key: 'title', label: 'Offer', value: title }],
          auxiliaryFields: [
            { key: 'amount', label: 'Value', value: `$${amount}` },
            { key: 'valid', label: 'Valid Until', value: expirationDate }
          ],
          backFields: [
            {
              key: 'terms',
              label: 'Terms & Conditions',
              value: 'One-time use only. Not transferable. No cash value.'
            },
            { key: 'email', label: 'Recipient Email', value: email },
            { key: 'from', label: 'From', value: from },
            { key: 'to', label: 'To', value: to }
          ]
        };
      }

      if (hasNFCSupport) {
        passJson.nfc = {
          message: coupon_code,
          encryptionPublicKey: process.env.APPLE_WALLET_ENCRYPTION_KEY || ''
        };
      } else {
        passJson.barcodes = [
          {
            format: 'PKBarcodeFormatQR',
            message: coupon_code,
            messageEncoding: 'iso-8859-1'
          }
        ];
      }

      const logoBase64 = extractBase64Data(logo, 'logo');
      const logoBuffer = Buffer.from(logoBase64, 'base64');

      const fileBuffers: Record<string, Buffer> = {
        'pass.json': Buffer.from(JSON.stringify(passJson)),
        'icon.png': logoBuffer,
        'logo.png': logoBuffer
      };

      if (design_type === 'visual' && stripImage && !hasNFCSupport) {
        const stripBase64 = extractBase64Data(stripImage, 'stripImage');
        fileBuffers['strip.png'] = Buffer.from(stripBase64, 'base64');
      }

      const pass = new PKPass(fileBuffers, {
        wwdr,
        signerCert,
        signerKey,
        signerKeyPassphrase
      });

      const buffer = await pass.getAsBuffer();

      return new NextResponse(buffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/vnd.apple.pkpass',
          'Content-Disposition': 'attachment; filename="pass.pkpass"',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    if (walletType === 'GOOGLE') {
      const issuerId = process.env.GOOGLE_ISSUER_ID;
      const classId = `${issuerId}.generic_offer`;
      const objectId = `${issuerId}.${serialNumber}`;
      const privateKey = (
        process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY || ''
      ).replace(/\n/g, '\n');
      const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;

      const offerObject = {
        id: objectId,
        classId,
        state: 'ACTIVE',
        heroImage: { sourceUri: { uri: logo } },
        title: { defaultValue: { language: 'en-US', value: title } },
        subheader: {
          defaultValue: { language: 'en-US', value: business_name }
        },
        barcode: { type: 'QR_CODE', value: coupon_code },
        validTimeInterval: {
          start: { date: new Date().toISOString() },
          end: { date: new Date(valid_until).toISOString() }
        },
        textModulesData: [
          { header: 'Amount', body: `$${amount}`, id: 'amount' },
          { header: 'Valid Until', body: expirationDate, id: 'valid_until' }
        ]
      };

      const claims = {
        iss: serviceAccountEmail,
        aud: 'google',
        typ: 'savetowallet',
        payload: { offerObjects: [offerObject] }
      };

      const token = jwt.sign(claims, privateKey, { algorithm: 'RS256' });
      const saveUrl = `https://pay.google.com/gp/v/save/${token}`;

      return new NextResponse(JSON.stringify({ saveUrl, objectId }), {
        status: 200,
        headers: { 'Access-Control-Allow-Origin': '*' }
      });
    }

    return new NextResponse(JSON.stringify({ error: 'Invalid walletType' }), {
      status: 400,
      headers: { 'Access-Control-Allow-Origin': '*' }
    });
  } catch (error: any) {
    console.error('❌ Error generating pass:', error);
    return new NextResponse(
      JSON.stringify({ error: error.message || 'Internal Server Error' }),
      {
        status: 500,
        headers: { 'Access-Control-Allow-Origin': '*' }
      }
    );
  }
}
