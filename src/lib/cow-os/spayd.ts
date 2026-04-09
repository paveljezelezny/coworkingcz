/**
 * SPAYD (Short Payment Descriptor) QR code generator
 * Czech/Slovak standard for bank payment QR codes
 * Spec: https://qr-platba.cz/pro-vyvojare/specifikace-formatu/
 */

export interface SpaydParams {
  /** IBAN account number (e.g. "CZ6508000000002301234567") */
  iban: string;
  /** Amount in CZK */
  amount: number;
  /** Currency code (default "CZK") */
  currency?: string;
  /** Variable symbol (for payment identification) */
  variableSymbol?: string;
  /** Specific symbol */
  specificSymbol?: string;
  /** Constant symbol */
  constantSymbol?: string;
  /** Message for recipient (max 60 chars) */
  message?: string;
  /** Due date */
  dueDate?: Date;
  /** Recipient name (max 35 chars) */
  recipientName?: string;
}

/**
 * Generate a SPAYD string from payment parameters.
 * This string can be encoded into a QR code that Czech/Slovak banking apps can scan.
 */
export function generateSpayd(params: SpaydParams): string {
  const parts: string[] = ['SPD*1.0'];

  // Account (required)
  parts.push(`ACC:${params.iban}`);

  // Amount
  if (params.amount > 0) {
    parts.push(`AM:${params.amount.toFixed(2)}`);
  }

  // Currency
  parts.push(`CC:${params.currency ?? 'CZK'}`);

  // Variable symbol
  if (params.variableSymbol) {
    parts.push(`X-VS:${params.variableSymbol}`);
  }

  // Specific symbol
  if (params.specificSymbol) {
    parts.push(`X-SS:${params.specificSymbol}`);
  }

  // Constant symbol
  if (params.constantSymbol) {
    parts.push(`X-KS:${params.constantSymbol}`);
  }

  // Message (max 60 chars, strip special chars)
  if (params.message) {
    const msg = params.message
      .replace(/[*]/g, '')
      .substring(0, 60);
    parts.push(`MSG:${msg}`);
  }

  // Due date (YYYYMMDD)
  if (params.dueDate) {
    const y = params.dueDate.getFullYear();
    const m = String(params.dueDate.getMonth() + 1).padStart(2, '0');
    const d = String(params.dueDate.getDate()).padStart(2, '0');
    parts.push(`DT:${y}${m}${d}`);
  }

  // Recipient name (max 35 chars)
  if (params.recipientName) {
    parts.push(`RN:${params.recipientName.substring(0, 35)}`);
  }

  return parts.join('*');
}

/**
 * Convert Czech bank account number (prefix-number/code) to IBAN.
 * Format: CZxx BBBB PPPP PPPP PPAA AAAA AAAA
 * Where B=bank code, P=prefix (6 digits), A=account number (10 digits)
 */
export function czechAccountToIban(accountStr: string): string | null {
  // Parse "prefix-number/code" or "number/code"
  const match = accountStr.match(/^(?:(\d+)-)?(\d+)\/(\d{4})$/);
  if (!match) return null;

  const prefix = (match[1] ?? '').padStart(6, '0');
  const number = match[2].padStart(10, '0');
  const bankCode = match[3];

  // BBAN = bankCode + prefix + accountNumber
  const bban = bankCode + prefix + number;

  // Calculate check digits: CZ00 + BBAN → numeric → mod 97
  // Country code CZ = 12 35, check digits placeholder = 00
  const numeric = bban + '123500';
  const remainder = bigMod97(numeric);
  const checkDigits = String(98 - remainder).padStart(2, '0');

  return `CZ${checkDigits}${bban}`;
}

/** Calculate num mod 97 for large number strings */
function bigMod97(numStr: string): number {
  let remainder = 0;
  for (let i = 0; i < numStr.length; i++) {
    remainder = (remainder * 10 + parseInt(numStr[i])) % 97;
  }
  return remainder;
}
