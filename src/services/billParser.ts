export interface ParsedBillFields {
  referenceNumber?: string;
  units?: number;
  tariffCode?: string;
  amountPayable?: number;
  fpa?: number;
  consumerName?: string;
  rawTextPreview: string;
}

export class BillParserService {
  /**
   * Parses raw extracted text from a digital duplicate bill
   */
  public static parseBillText(rawText: string): ParsedBillFields {
    const clean = rawText.replace(/\r/g, ' ');

    // Extract reference number (14 consecutive digits or spaced digits)
    const refMatch = clean.match(/\b(\d{2}\s*\d{5}\s*\d{7}|\d{14})\b/);
    const referenceNumber = refMatch ? refMatch[1].replace(/\s/g, '') : undefined;

    // Extract units consumed (e.g. UNITS: 215, Units Consumed 215, Units 215)
    const unitsMatch = clean.match(/(?:UNITS|Units\s+Consumed|Consumed\s+Units|Units)[:\s]+(\d{1,5})\b/i);
    const units = unitsMatch ? parseInt(unitsMatch[1], 10) : undefined;

    // Extract tariff code (e.g. A-1a(01), A-1a, A-1b, A-1, A-2)
    const tariffMatch = clean.match(/(A-1[a-zA-Z]?(?:\(\d+\))?|A-2|B-1|B-2)/i);
    const tariffCode = tariffMatch ? tariffMatch[1].toUpperCase() : undefined;

    // Extract amount payable (e.g. Payable Within Due Date: 12,450)
    const payableMatch = clean.match(/(?:Payable\s+Within\s+Due\s+Date|Current\s+Bill|TOTAL\s+AMOUNT)[:\s]+(?:Rs\.?\s*)?([\d,]+)/i);
    const amountPayable = payableMatch ? parseFloat(payableMatch[1].replace(/,/g, '')) : undefined;

    // Extract FPA
    const fpaMatch = clean.match(/(?:F\.?P\.?A|Fuel\s+Adjustment)[:\s]+(?:Rs\.?\s*)?([\d,.]+)/i);
    const fpa = fpaMatch ? parseFloat(fpaMatch[1].replace(/,/g, '')) : undefined;

    return {
      referenceNumber,
      units,
      tariffCode,
      amountPayable,
      fpa,
      rawTextPreview: clean.substring(0, 300).trim(),
    };
  }
}
