#!/usr/bin/env node

/**
 * Generate JWT token for CTOS B2B API authentication
 * 
 * Usage:
 *   node generate-ctos-jwt.js
 */

const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Configuration from environment or defaults
const config = {
  companyCode: process.env.CTOS_B2B_COMPANY_CODE || 'OPGUAT2',
  accountNo: process.env.CTOS_B2B_ACCOUNT_NO || 'OPGUAT2',
  userId: process.env.CTOS_B2B_USER_ID || 'opg_uat2',
  userName: process.env.CTOS_B2B_USER_NAME || 'opg_uat2',
  clientId: process.env.CTOS_B2B_CLIENT_ID || 'Opg_jwt2',
  ssoUrl: process.env.CTOS_B2B_SSO_URL || 'https://uat-sso.ctos.com.my',
  sso_password: process.env.CTOS_B2B_SSO_PASSWORD || '123456',
};

function generateJWT() {
  try {
    // Load private key from environment variable
    const privateKeyEnv = process.env.CTOS_B2B_PRIVATE_KEY;
    
    if (!privateKeyEnv) {
      throw new Error('CTOS_B2B_PRIVATE_KEY environment variable is not set');
    }

    // Handle base64-encoded private key (common in CI/CD environments)
    let privateKey = privateKeyEnv;
    
    // Try to decode if it looks like base64 (contains only base64 chars and no newlines)
    if (!privateKey.includes('\n') && /^[A-Za-z0-9+/=\s]+$/.test(privateKey.trim())) {
      try {
        privateKey = Buffer.from(privateKey.trim(), 'base64').toString('utf8');
      } catch (e) {
        // If decoding fails, use original value (might be raw key)
      }
    }

    // Replace literal \n with actual newlines (for GitHub secrets stored as single line)
    privateKey = privateKey.replace(/\\n/g, '\n');

    // Validate that it looks like a private key
    if (!privateKey.includes('BEGIN') || !privateKey.includes('PRIVATE KEY')) {
      throw new Error('CTOS_B2B_PRIVATE_KEY does not appear to be a valid RSA private key');
    }

    // Calculate token endpoint for audience (as per CTOS spec)
    const tokenEndpoint = `${config.ssoUrl}/auth/realms/CTOSNET/protocol/openid-connect/token`;

    // Create JWT payload according to CTOS ENQWS v5.11.0 specification
    const now = Math.floor(Date.now() / 1000);
    const tokenId = crypto.randomUUID(); // Generate unique token ID for jti claim
    
    const payload = {
      jti: tokenId,                    // Unique token identifier (required)
      sub: config.clientId,            // Subject = CLIENT_ID (NOT userId)
      iss: config.clientId,            // Issuer = CLIENT_ID
      aud: tokenEndpoint,              // Audience = Full token endpoint URL
      exp: now + 300,                  // Expiry = Current time + 300 seconds (5 minutes)
      iat: now,                        // Issued at = Current timestamp
    };

    // Sign JWT with RS256
    const token = jwt.sign(payload, privateKey, {
      algorithm: 'RS256',
    });

    // Output results
    console.log('\n✅ JWT Token Generated Successfully!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 Configuration:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`   Client ID:    ${config.clientId}`);
    console.log(`   SSO URL:      ${config.ssoUrl}`);
    console.log(`   Token Endpoint: ${tokenEndpoint}`);
    console.log(`   Token ID (jti): ${tokenId}`);
    console.log(`   Expires in:   300 seconds (5 minutes)`);
    console.log('\n📦 JWT Payload:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(JSON.stringify(payload, null, 2));
    console.log('\n🔑 JWT Token:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(token);
    console.log('\n📝 Instructions:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('1. Copy the JWT token above');
    console.log('2. In Postman, set environment variable: jwt_token = <paste token>');
    console.log('3. Run the "CTOS SSO Login" request');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    return token;
  } catch (error) {
    console.error('\n❌ Error generating JWT:');
    console.error(error.message);
    if (error.message.includes('CTOS_B2B_PRIVATE_KEY')) {
      console.error('\n💡 Tip: Set the CTOS_B2B_PRIVATE_KEY environment variable with your RSA private key.');
      console.error('   You can store it in GitHub Secrets or your .env file.');
      console.error('   The key should start with "-----BEGIN RSA PRIVATE KEY-----" or "-----BEGIN PRIVATE KEY-----"');
    }
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  generateJWT();
}

module.exports = { generateJWT, config };