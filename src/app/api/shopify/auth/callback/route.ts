// PPW Email Engine - Shopify OAuth Callback
// Exchanges authorization code for permanent shpat_ access token
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
  const code = searchParams.get('code');
  const shop = searchParams.get('shop');
  const hmac = searchParams.get('hmac');
  const state = searchParams.get('state');
  
  // Validate required params
  if (!code || !shop || !hmac) {
    return new NextResponse('Missing required parameters', { status: 400 });
  }

  // Verify HMAC
  const apiSecret = process.env.SHOPIFY_API_SECRET!;
  const apiKey = process.env.SHOPIFY_API_KEY!;
  
  const params = new URLSearchParams();
  searchParams.forEach((value, key) => {
    if (key !== 'hmac') {
      params.append(key, value);
    }
  });
  
  const sortedParams = Array.from(params.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('&');
    
  const generatedHmac = crypto
    .createHmac('sha256', apiSecret)
    .update(sortedParams)
    .digest('hex');
    
  if (generatedHmac !== hmac) {
    return new NextResponse('HMAC verification failed', { status: 403 });
  }

  // Exchange code for permanent access token
  try {
    const tokenResponse = await fetch(`https://${shop}/admin/oauth/access_token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: apiKey,
        client_secret: apiSecret,
        code: code,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      return new NextResponse(`Token exchange failed: ${errorText}`, { status: 500 });
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Return HTML page with the token displayed and a copy button
    const html = `<!DOCTYPE html>
<html>
<head>
  <title>PPW Email Engine - Shopify Auth Success</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 60px auto; padding: 20px; background: #f5f5f5; }
    .card { background: white; border-radius: 12px; padding: 32px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    h1 { color: #1a1a1a; font-size: 24px; margin-bottom: 8px; }
    .subtitle { color: #666; margin-bottom: 24px; }
    .token-label { font-weight: 600; color: #333; margin-bottom: 8px; display: block; }
    .token-box { background: #f0f0f0; border: 1px solid #ddd; border-radius: 8px; padding: 12px 16px; font-family: monospace; font-size: 14px; word-break: break-all; margin-bottom: 12px; }
    .copy-btn { background: #2d7a3a; color: white; border: none; padding: 10px 24px; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 500; }
    .copy-btn:hover { background: #236b2e; }
    .copy-btn.copied { background: #1a5c25; }
    .info { margin-top: 24px; padding: 16px; background: #f8f9fa; border-radius: 8px; font-size: 13px; color: #555; }
    .shop-name { color: #2d7a3a; font-weight: 500; }
  </style>
</head>
<body>
  <div class="card">
    <h1>Auth Successful</h1>
    <p class="subtitle">PPW Email Engine is now connected to <span class="shop-name">${shop}</span></p>
    
    <span class="token-label">Access Token (shpat_):</span>
    <div class="token-box" id="token">${accessToken}</div>
    <button class="copy-btn" onclick="navigator.clipboard.writeText(document.getElementById('token').textContent).then(() => { this.textContent = 'Copied!'; this.classList.add('copied'); setTimeout(() => { this.textContent = 'Copy Token'; this.classList.remove('copied'); }, 2000); })">Copy Token</button>
    
    <div class="info">
      <strong>Next steps:</strong> Add this token as SHOPIFY_ACCESS_TOKEN in your Vercel environment variables for the ppw-email-engine project.
    </div>
  </div>
</body>
</html>`;

    return new NextResponse(html, {
      status: 200,
      headers: { 'Content-Type': 'text/html' },
    });

  } catch (error) {
    return new NextResponse(`Error during token exchange: ${error}`, { status: 500 });
  }
}
