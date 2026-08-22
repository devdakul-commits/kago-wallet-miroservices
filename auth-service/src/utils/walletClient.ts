const WALLET_SERVICE_URL = process.env.WALLET_SERVICE_URL ?? 'http://127.0.0.1:3005';
const WALLET_SERVICE_SECRET = process.env.WALLET_SERVICE_SECRET ?? '';

export async function postCreateVendor(payload: any, headers: Record<string, string> = {}, retries = 2) {
  const url = `${WALLET_SERVICE_URL.replace(/\/+$/,'')}/vendor/create`;
  const authHeaders = {
    'Content-Type': 'application/json',
    ...(WALLET_SERVICE_SECRET ? { 'X-Wallet-Service-Secret': WALLET_SERVICE_SECRET } : {}),
    ...headers,
  };

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify(payload),
      });

      const text = await res.text();
      let json: any = null;
      try { json = text ? JSON.parse(text) : null; } catch (_) { json = { body: text }; }

      if (res.ok) return json;
      // Retry on 5xx
      if (res.status >= 500 && attempt < retries) {
        await new Promise((r) => setTimeout(r, 200 * (attempt + 1)));
        continue;
      }
      const err: any = new Error(`wallet-service error: ${res.status} ${res.statusText}`);
      err.status = res.status;
      err.body = json;
      throw err;
    } catch (err) {
      if (attempt >= retries) throw err;
      await new Promise((r) => setTimeout(r, 150 * (attempt + 1)));
    }
  }
}

export async function postCreateVendorSafe(payload: any, headers: Record<string,string> = {}) {
  return postCreateVendor(payload, headers, 2);
}

export default { postCreateVendor, postCreateVendorSafe };
