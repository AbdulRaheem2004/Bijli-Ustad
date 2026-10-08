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
    const isUnitCostQuery = /(?:cost.*unit|unit.*cost|unit.*price|price.*unit|rate.*unit|unit.*rate|cost.*me.*unit|kitne.*unit|unit.*kitne|without\s+taxes|ایک\s*یونٹ|فی\s*یونٹ)/i.test(userQuery);

    if (isUnitCostQuery && billContext && billContext.totalUnits > 0) {
      const basePerUnit = (billContext.baseElectricityCost / billContext.totalUnits).toFixed(2);
      const effectivePerUnit = (billContext.netPayableWithinDueDate / billContext.totalUnits).toFixed(2);
      const taxPerUnit = (billContext.taxes.totalTaxesAndSurcharges / billContext.totalUnits).toFixed(2);
      const taxPercent = Math.round((billContext.taxes.totalTaxesAndSurcharges / (billContext.baseElectricityCost || 1)) * 100);

      const dynamicCitations: ChatMessage['citations'] = [
        {
          title: language === 'urdu' ? 'ایس آر او 575 (بنیادی ٹیرف سلیبز) اور ایس آر او 342 (سرچارجز)' : 'S.R.O. 575(I)/2024 & S.R.O. 342(I)/2023',
          sro: 'S.R.O. 575(I)/2024 / S.R.O. 342(I)/2023',
          authority: 'NEPRA / Ministry of Energy',
        },
      ];

      let unitResponseText = '';
      if (language === 'urdu') {
        unitResponseText =
          `آپ کے موجودہ بل (${billContext.totalUnits} یونٹس، کل رقم: ${billContext.netPayableWithinDueDate.toLocaleString()} روپے) کے مطابق، فی یونٹ لاگت کا حساب دو مختلف طریقوں سے ہوتا ہے:\n\n` +
          `۱️⃣ بغیر ٹیکسز کے (بنیادی سلیب ریٹ):\n` +
          `• بنیادی ریٹ: ${basePerUnit} روپے فی یونٹ\n` +
          `• حساب: بنیادی بجلی کی لاگت (${billContext.baseElectricityCost.toLocaleString()} روپے) ÷ کل یونٹس (${billContext.totalUnits})\n` +
          `• تفصیل: یہ وہ رقم ہے جو سلیبز کے مطابق بجلی کی پیداوار اور تقسیم کا اصل خرچ ہے۔\n\n` +
          `۲️⃣ تمام ٹیکسز کے ساتھ (کل بل تقسیم کل یونٹس):\n` +
          `• مؤثر ریٹ: ${effectivePerUnit} روپے فی یونٹ\n` +
          `• حساب: کل واجب الادا بل (${billContext.netPayableWithinDueDate.toLocaleString()} روپے) ÷ کل یونٹس (${billContext.totalUnits})\n` +
          `• تفصیل: یہ وہ حقیقی رقم ہے جو آپ ہر ایک یونٹ کے استعمال پر جیب سے ادا کر رہے ہیں۔\n\n` +
          `📊 سرکاری ٹیکسز اور سرچارجز کا بوجھ:\n` +
          `سرکاری ٹیکسز (18% جی ایس ٹی، 1.5% بجلی ڈیوٹی، 3.23 روپے ایف سی سرچارج، فیول ایڈجسٹمنٹ اور ٹی وی فیس) کی وجہ سے آپ کے ہر یونٹ پر +${taxPerUnit} روپے کا اضافہ ہوا ہے (+${taxPercent}% اضافی ٹیکس بوجھ)۔`;
      } else if (language === 'roman_urdu') {
        unitResponseText =
          `Aap ke mojooda bill (${billContext.totalUnits} units, Total: Rs. ${billContext.netPayableWithinDueDate.toLocaleString()}) ke mutabiq aap ke 1 unit ka hisaab 2 alag tareeqon se hota hai:\n\n` +
          `1️⃣ BINA TAXES KE (Base Electricity Price):\n` +
          `• Base Rate: Rs. ${basePerUnit} fe unit\n` +
          `• Formula: Base Electricity Cost (Rs. ${billContext.baseElectricityCost.toLocaleString()}) ÷ Total Units (${billContext.totalUnits})\n` +
          `• Yeh NEPRA slabs ke mutabiq sirf bijli ki asal generation aur distribution ka rate hai.\n\n` +
          `2️⃣ TAMAM TAXES KE SATH (Total Bill ÷ Units - Asal Kharcha):\n` +
          `• Effective Rate: Rs. ${effectivePerUnit} fe unit\n` +
          `• Formula: Kul Bill (Rs. ${billContext.netPayableWithinDueDate.toLocaleString()}) ÷ Total Units (${billContext.totalUnits})\n` +
          `• Yeh woh asal kharcha hai jo aap apni jaib se fe unit ada kar rahe hain.\n\n` +
          `📊 TAXES AUR SURCHARGES KA BOJH:\n` +
          `Sarkari taxes (GST 18%, ED 1.5%, FC Surcharge Rs. 3.23/unit, FPA, QTA, TV fee) ne aap ke har unit par +Rs. ${taxPerUnit} ka izafa kiya hai (+${taxPercent}% izafi bojh).`;
      } else {
        unitResponseText =
          `Based on your active bill of ${billContext.totalUnits} units (Total: Rs. ${billContext.netPayableWithinDueDate.toLocaleString()}):\n\n` +
          `Here is your exact 2-part cost per unit calculation:\n\n` +
          `1️⃣ WITHOUT TAXES (Pure Base Electricity Price):\n` +
          `• Base Rate: Rs. ${basePerUnit} per kWh\n` +
          `• Formula: Base Electricity Cost (Rs. ${billContext.baseElectricityCost.toLocaleString()}) ÷ Total Units (${billContext.totalUnits})\n` +
          `• Note: This represents your pure slab cost across slabs before any government taxes.\n\n` +
          `2️⃣ TOTAL BILL INCLUDING ALL TAXES (Effective Out-of-Pocket Rate):\n` +
          `• Effective Rate: Rs. ${effectivePerUnit} per kWh\n` +
          `• Formula: Total Bill Payable (Rs. ${billContext.netPayableWithinDueDate.toLocaleString()}) ÷ Total Units (${billContext.totalUnits})\n` +
          `• Note: This is what you actually pay out of pocket per unit consumed.\n\n` +
          `📊 TAX & SURCHARGE OVERHEAD:\n` +
          `Government levies (GST 18%, ED 1.5%, FC Surcharge Rs. 3.23/unit, FPA, QTA, TV fee) add an extra +Rs. ${taxPerUnit} per unit (+${taxPercent}% tax markup on top of base electricity).`;
      }

      return {
        id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        sender: 'assistant',
        text: unitResponseText,
        isOutOfScope: false,
        citations: dynamicCitations,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
    }

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
