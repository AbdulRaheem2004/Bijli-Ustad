export interface ParsedBillFields {
  referenceNumber?: string;
  units?: number;
  tariffCode?: string;
  amountPayable?: number;
  isCreditBalance?: boolean;
  category?: string;
  isNetMetering?: boolean;
  sanctionedLoad?: number;
  fpa?: number;
  discoId?: string;
  consumerName?: string;
  rawTextPreview: string;
}

export class BillParserService {
  /**
   * Parses raw extracted text from a digital duplicate bill or PDF text stream
   */
  public static parseBillText(rawText: string): ParsedBillFields {
    const clean = rawText.replace(/\r/g, ' ');

    // Extract reference number (14 consecutive digits or spaced digits, or 13-digit KE account)
    const refMatch = clean.match(/\b(\d{2}\s*\d{5}\s*\d{7}|\d{14}|\d{13})\b/);
    const referenceNumber = refMatch ? refMatch[1].replace(/\s/g, '') : undefined;

    // Extract units consumed (e.g. UNITS: 215, Units Consumed 215, Units 215, MTR Units 215)
    const unitsMatch = clean.match(/(?:UNITS|Units\s+Consumed|Consumed\s+Units|Total\s+Units|Units|MTR\s+UNITS)[:\s]+(\d{1,5})\b/i);
    const units = unitsMatch ? parseInt(unitsMatch[1], 10) : undefined;

    // Extract tariff code (e.g. A-1b(03)T, A-1a(01), A-1a, A-1b, A-1, A-2, B-1, B-2)
    const tariffMatch = clean.match(/(A-1[a-zA-Z0-9]?(?:\([0-9a-zA-Z]+\))?[a-zA-Z]?|A-2|B-1|B-2)/i);
    const tariffCode = tariffMatch ? tariffMatch[1].toUpperCase() : undefined;

    // Extract Category & Net Metering status
    let category: string | undefined = undefined;
    let isNetMetering = false;
    if (/Net\s*Metering/i.test(clean) || (tariffCode && /A-1B\(03\)T/i.test(tariffCode))) {
      category = 'Net Metering';
      isNetMetering = true;
    } else if (/Unprotected/i.test(clean)) {
      category = 'Unprotected';
    } else if (/Protected/i.test(clean)) {
      category = 'Protected';
    }

    // Extract Sanctioned Load (e.g. SAN LOAD: 5 or SAN LOAD 2)
    const sanMatch = clean.match(/SAN\s*LOAD[:\s]+(\d+)/i);
    const sanctionedLoad = sanMatch ? parseInt(sanMatch[1], 10) : undefined;

    // Extract amount payable within due date & detect CR (Credit Balance / NOT TO BE PAID)
    const payableMatch = clean.match(/(?:Payable\s+Within\s+Due\s+Date|Within\s+Due\s+Date|Current\s+Bill|TOTAL\s+AMOUNT|Net\s+Payable|Grand\s+Total)[:\s]+(?:Rs\.?\s*)?(-?[\d,]+)\s*(CR)?/i);
    let amountPayable: number | undefined = undefined;
    let isCreditBalance = false;

    if (payableMatch) {
      const val = parseFloat(payableMatch[1].replace(/,/g, ''));
      if (payableMatch[2] === 'CR' || val < 0 || /NOT\s+TO\s+BE\s+PAID/i.test(clean)) {
        isCreditBalance = true;
        amountPayable = -Math.abs(val);
      } else {
        amountPayable = val;
      }
    }

    // Extract FPA
    const fpaMatch = clean.match(/(?:F\.?P\.?A|Fuel\s+Adjustment|Fuel\s+Price)[:\s]+(?:Rs\.?\s*)?([\d,.]+)/i);
    const fpa = fpaMatch ? parseFloat(fpaMatch[1].replace(/,/g, '')) : undefined;

    // Detect DISCO
    let discoId: string | undefined = undefined;
    if (/LESCO|Lahore\s+Electric/i.test(clean)) discoId = 'lesco';
    else if (/IESCO|Islamabad\s+Electric/i.test(clean)) discoId = 'iesco';
    else if (/MEPCO|Multan\s+Electric/i.test(clean)) discoId = 'mepco';
    else if (/FESCO|Faisalabad\s+Electric/i.test(clean)) discoId = 'fesco';
    else if (/GEPCO|Gujranwala\s+Electric/i.test(clean)) discoId = 'gepco';
    else if (/PESCO|Peshawar\s+Electric/i.test(clean)) discoId = 'pesco';
    else if (/HESCO|Hyderabad\s+Electric/i.test(clean)) discoId = 'hesco';
    else if (/SEPCO|Sukkur\s+Electric/i.test(clean)) discoId = 'sepco';
    else if (/QESCO|Quetta\s+Electric/i.test(clean)) discoId = 'qesco';
    else if (/K-?Electric|KESC/i.test(clean)) discoId = 'ke';

    return {
      referenceNumber,
      units,
      tariffCode,
      amountPayable,
      isCreditBalance,
      category,
      isNetMetering,
      sanctionedLoad,
      fpa,
      discoId,
      rawTextPreview: clean.substring(0, 300).trim(),
    };
  }

  /**
   * Client-side extraction of text from an uploaded PDF file or text file
   */
  public static async parseFile(file: File): Promise<ParsedBillFields> {
    if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
      const buffer = await file.arrayBuffer();
      const extractedText = await this.extractTextFromPdfBuffer(buffer);
      return this.parseBillText(extractedText);
    } else {
      const text = await file.text();
      return this.parseBillText(text);
    }
  }

  /**
   * Robust client-side PDF stream text extractor using native standard streams
   */
  public static async extractTextFromPdfBuffer(buffer: ArrayBuffer): Promise<string> {
    const uint8 = new Uint8Array(buffer);
    const textPieces: string[] = [];

    // 1. Direct ASCII search for printable strings in the raw PDF
    let currentAscii = '';
    for (let i = 0; i < uint8.length; i++) {
      const byte = uint8[i];
      if ((byte >= 32 && byte <= 126) || byte === 10 || byte === 13) {
        currentAscii += String.fromCharCode(byte);
      } else {
        if (currentAscii.length >= 4) {
          textPieces.push(currentAscii);
        }
        currentAscii = '';
      }
    }
    if (currentAscii.length >= 4) {
      textPieces.push(currentAscii);
    }

    // 2. Stream chunk inspection and FlateDecode decompression
    const streamStartSig = new TextEncoder().encode('stream');
    const streamEndSig = new TextEncoder().encode('endstream');

    let searchIndex = 0;
    while (searchIndex < uint8.length - 10) {
      const startIdx = indexOfSubarray(uint8, streamStartSig, searchIndex);
      if (startIdx === -1) break;

      let dataStart = startIdx + 6;
      if (uint8[dataStart] === 13) dataStart++;
      if (uint8[dataStart] === 10) dataStart++;

      const endIdx = indexOfSubarray(uint8, streamEndSig, dataStart);
      if (endIdx === -1) break;

      const streamBytes = uint8.subarray(dataStart, endIdx);
      if (streamBytes.length > 0 && typeof DecompressionStream !== 'undefined') {
        try {
          const ds = new DecompressionStream('deflate');
          const decompressedStream = new Response(new Blob([streamBytes]).stream().pipeThrough(ds));
          const decompressedText = await decompressedStream.text();
          if (decompressedText && decompressedText.length > 5) {
            textPieces.push(decompressedText);
          }
        } catch {
          // Stream might be uncompressed or use different encoding; ignore failure
        }
      }

      searchIndex = endIdx + 8;
    }

    // Combine and extract PDF text operators (e.g., (text) Tj or [(text)] TJ)
    const combined = textPieces.join('\n');
    const operatorMatches = combined.match(/\(([^)]+)\)\s*(?:Tj|'|")/g);
    if (operatorMatches && operatorMatches.length > 0) {
      const parsedFromOps = operatorMatches
        .map((m) => m.replace(/^\(/, '').replace(/\)\s*(?:Tj|'|")$/, ''))
        .join(' ');
      return `${combined}\n${parsedFromOps}`;
    }

    return combined;
  }
}

function indexOfSubarray(array: Uint8Array, subarray: Uint8Array, startIndex = 0): number {
  for (let i = startIndex; i <= array.length - subarray.length; i++) {
    let match = true;
    for (let j = 0; j < subarray.length; j++) {
      if (array[i + j] !== subarray[j]) {
        match = false;
        break;
      }
    }
    if (match) return i;
  }
  return -1;
}
