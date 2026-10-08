import { NepraRagRetriever } from './retriever.ts';
import type { BillCalculationResult } from '../engine/types.ts';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  isOutOfScope?: boolean;
  citations?: {
    title: string;
    sro: string;
    authority: string;
  }[];
  timestamp: string;
}

export class CustomerRagChatService {
  private retriever: NepraRagRetriever;

  constructor() {
    this.retriever = new NepraRagRetriever();
  }

  public answer(
    userQuery: string,
    billContext?: BillCalculationResult | null,
    language: 'english' | 'roman_urdu' | 'urdu' = 'roman_urdu'
  ): ChatMessage {
    const searchResults = this.retriever.retrieve(userQuery, 2);

    let responseText = '';
    let isOutOfScope = false;
    const citations: ChatMessage['citations'] = [];

    // Contextual preamble if active bill exists
    let contextHeader = '';
    if (billContext && billContext.totalUnits > 0) {
      if (language === 'roman_urdu') {
        contextHeader = `Aap ke mojooda bill ke mutabiq (${billContext.totalUnits} units, Total: Rs. ${billContext.netPayableWithinDueDate.toLocaleString()}):\n\n`;
      } else if (language === 'urdu') {
        contextHeader = `آپ کے موجودہ بل کے مطابق (${billContext.totalUnits} یونٹس، کل رقم: ${billContext.netPayableWithinDueDate.toLocaleString()} روپے):\n\n`;
      } else {
        contextHeader = `Based on your active bill (${billContext.totalUnits} units, Total: Rs. ${billContext.netPayableWithinDueDate.toLocaleString()}):\n\n`;
      }
    }

    if (searchResults.length > 0) {
      // In-scope answer grounded in retrieved NEPRA chunks
      for (const res of searchResults) {
        citations.push({
          title: language === 'urdu' ? res.chunk.titleUrdu : res.chunk.title,
          sro: res.chunk.sroCitation,
          authority: res.chunk.legalAuthority,
        });
      }

      const primary = searchResults[0].chunk;
      const secondary = searchResults[1]?.chunk;

      if (language === 'urdu') {
        responseText = `${contextHeader}${primary.contentUrdu}`;
        if (secondary) {
          responseText += `\n\nمزید تفصیل: ${secondary.contentUrdu}`;
        }
      } else if (language === 'roman_urdu') {
        responseText = `${contextHeader}${primary.contentRomanUrdu}`;
        if (secondary) {
          responseText += `\n\nIske ilawa: ${secondary.contentRomanUrdu}`;
        }
      } else {
        responseText = `${contextHeader}${primary.contentEnglish}`;
        if (secondary) {
          responseText += `\n\nAdditionally: ${secondary.contentEnglish}`;
        }
      }
    } else {
      // Out of scope / Unknown query -> Strictly refuse and guide user
      isOutOfScope = true;

      if (language === 'urdu') {
        responseText =
          'معذرت، اس سوال کے متعلق نیپرا کے سرکاری قواعد میں میرے پاس مصدقہ معلومات موجود نہیں ہیں۔\n\n' +
          'غلط معلومات سے بچاؤ کے لیے میں صرف پاکستانی بجلی کے بل اور نیپرا قوانین کے دائرہ کار میں جواب دیتا ہوں، جیسے:\n' +
          '• پروٹیکٹڈ بمقابلہ ان پروٹیکٹڈ سلیبز (200 یونٹ کا قانون)\n' +
          '• فیول پرائس ایڈجسٹمنٹ (FPA) اور سرچارجز کا حساب\n' +
          '• سلو میٹر اور ڈٹیکشن بل سے متعلق صارف کے قانونی حقوق\n' +
          '• غلط ریڈنگ اور بل درستگی کے لیے سی ایس ایم چیپٹر 4 کا طریقہ\n' +
          '• سولر نیٹ میٹرنگ اور سہ ماہی کریڈٹ رول اوور کے اصول\n\n' +
          'برائے مہربانی اپنے بجلی کے بل یا نیپرا قواعد سے متعلق کوئی سوال پوچھیں۔';
      } else if (language === 'roman_urdu') {
        responseText =
          'Mazrat! Is sawal ke mutaliq mere paas NEPRA ke official qawaneen mein koi tasdeeq shuda maloomat nahi hain.\n\n' +
          'Ghalat rehnumai se bachne ke liye, main sirf Pakistani bijli ke bill aur NEPRA rules ke mutaliq jawab deta hoon, maslan:\n' +
          '• Protected vs Unprotected slabs (200 units ka 6-month rule)\n' +
          '• FPA (Fuel Price Adjustment) aur FC surcharges ka hisaab\n' +
          '• Slow meter aur Detection bill ke qanooni huqooq (CSM Chapter 5)\n' +
          '• Ghalat bill ki durustagi aur SDO complaint rules\n' +
          '• Solar Net-Metering export credits aur rollover\n\n' +
          'Baraye meharbani apne bijli ke bill ya NEPRA rules ke baray mein sawal poochein.';
      } else {
        responseText =
          'I apologize, but this question is outside the scope of verified NEPRA electricity regulations.\n\n' +
          'To ensure mathematical and regulatory accuracy, I strictly answer queries grounded in official Pakistani electricity laws, including:\n' +
          '• Protected vs. Unprotected slab classification (200-unit 6-month rule)\n' +
          '• Fuel Price Adjustment (FPA) and surcharges under Section 31(7)\n' +
          '• Consumer rights regarding slow meters and detection bills (CSM Chapter 5)\n' +
          '• Disputed bill rectification procedures (CSM Chapter 4)\n' +
          '• Solar Net-Metering settlement and quarterly credit rollover\n\n' +
          'Please ask a question related to your electricity bill or NEPRA regulations.';
      }
    }

    return {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      sender: 'assistant',
      text: responseText,
      isOutOfScope,
      citations: citations.length > 0 ? citations : undefined,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
  }
}
