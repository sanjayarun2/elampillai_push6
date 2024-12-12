import webpush from 'web-push';
import crypto from 'crypto';

function verifyVAPIDKey(publicKey, privateKey) {
  try {
    // Decode the public key
    const decodedPublicKey = Buffer.from(publicKey, 'base64');
    
    console.log('Public Key Length:', decodedPublicKey.length);
    console.log('Public Key Hex:', decodedPublicKey.toString('hex'));

    // Verify key is on P-256 curve
    try {
      // Attempt to create a key object
      const ecPublicKey = crypto.createPublicKey({
        key: {
          kty: 'EC',
          crv: 'P-256',
          x: decodedPublicKey.slice(1, 33).toString('base64'),
          y: decodedPublicKey.slice(33, 65).toString('base64')
        },
        format: 'jwk'
      });
      
      console.log('Key successfully validated on P-256 curve');
    } catch (curveError) {
      console.error('Curve Validation Error:', curveError);
      throw new Error('Invalid P-256 curve key');
    }

    // Verify key works with web-push
    webpush.setVapidDetails(
      'mailto:your-email@example.com',
      publicKey,
      privateKey
    );

    console.log('VAPID keys are valid and compatible');
    return true;
  } catch (error) {
    console.error('VAPID Key Verification Failed:', error);
    return false;
  }
}

function generateAndVerifyVAPIDKeys() {
  try {
    // Generate new VAPID keys
    const vapidKeys = webpush.generateVAPIDKeys();
    
    console.log('Generated Public Key:', vapidKeys.publicKey);
    console.log('Generated Private Key:', vapidKeys.privateKey);

    // Verify the generated keys
    const isValid = verifyVAPIDKey(vapidKeys.publicKey, vapidKeys.privateKey);
    
    if (!isValid) {
      console.error('Generated keys are invalid');
      process.exit(1);
    }

    return vapidKeys;
  } catch (error) {
    console.error('Error generating VAPID keys:', error);
    process.exit(1);
  }
}

// Run the verification
generateAndVerifyVAPIDKeys();