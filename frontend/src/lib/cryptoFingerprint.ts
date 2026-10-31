// SHA-256 Cryptographic Fingerprint for Tamper-evident Passport Verification
// Uses standard Web Crypto SubtleCrypto (works fully offline in browser)

export async function generateSha256Fingerprint(content: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(content);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hexString = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  return hexString;
}

export function formatFingerprintChunks(hex: string): string[] {
  // Return formatted 8-character blocks for visual inspection
  const chunks: string[] = [];
  for (let i = 0; i < hex.length; i += 8) {
    chunks.push(hex.substring(i, i + 8));
  }
  return chunks;
}

