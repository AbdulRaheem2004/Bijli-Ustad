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

    // 1. Bill-Grounded Connection Type & Solar Meter Inquiry
    const isConnectionQuery = /(?:what\s+type.*connection|type.*connection|connection.*type|is\s+my\s+meter\s+solar|meter.*solar|my\s+connection.*solar|connection.*solar|mera\s+connection|konsa\s+connection|meter\s+solar\s+hai)/i.test(userQuery);

    if (isConnectionQuery && billContext) {
      const isSolar = billContext.connectionType === 'solar_net_metering';
      const citations: ChatMessage['citations'] = [
        {
          title: 'NEPRA Distributed Generation & Tariff Schedule',
          sro: 'S.R.O. 892(I)/2015 & S.R.O. 575(I)/2024',
          authority: 'NEPRA Licensing & Billing Framework',
        },
      ];

      let connText = '';
      if (language === 'urdu') {
        if (isSolar) {
          connText =
            `جی ہاں! آپ کے فعال بل کے مطابق آپ کا کنکشن "سولر نیٹ میٹرنگ" (۳ فیز ٹائم آف یوز) ہے جس کا ٹیرف کوڈ A-1b(03)T ہے۔\n\n` +
            `• میٹر کی قسم: گرین بائی ڈائریکشنل میٹر جو امپورٹ (گرڈ سے لی گئی بجلی) اور ایکسپورٹ (سولر سے گرڈ کو دی گئی بجلی) دونوں ریکارڈ کرتا ہے۔\n` +
            `• بلنگ کیٹیگری: نیٹ میٹرنگ (Net Metering) کے تحت دن کی فالتو بجلی آف پیک یونٹس سے منہا ہوتی ہے۔`;
        } else if (billContext.connectionType === 'domestic_single_phase_protected') {
          connText =
            `نہیں، آپ کا میٹر سولر نیٹ میٹرنگ نہیں ہے۔ آپ کا کنکشن "سنگل فیز ڈومیسٹک (پروٹیکٹڈ)" ہے جس کا ٹیرف کوڈ A-1a(01) ہے۔\n\n` +
            `آپ کا ماہانہ استعمال ۲۰۰ یونٹس سے کم ہونے کی وجہ سے حکومت کی سبسڈی والی سلیبز پر بل بن رہا ہے۔`;
        } else if (billContext.connectionType === 'domestic_single_phase_unprotected') {
          connText =
            `نہیں، آپ کا میٹر سولر نیٹ میٹرنگ نہیں ہے۔ آپ کا کنکشن "سنگل فیز ڈومیسٹک (ان پروٹیکٹڈ)" ہے جس کا ٹیرف کوڈ A-1a(01) ہے۔\n\n` +
            `یہ عام سنگل فیز میٹر ہے جس پر ۲۰۰ یونٹ سے زائد استعمال کی وجہ سے غیر محفوظ سلیبز چارج ہو رہی ہیں۔`;
        } else {
          connText = `آپ کا کنکشن ۳ فیز ٹائم آف یوز (TOU) ہے جس میں شام کے پیک اور دن کے آف پیک یونٹس کا الگ الگ حساب ہوتا ہے۔`;
        }
      } else if (language === 'roman_urdu') {
        if (isSolar) {
          connText =
            `Jee haan! Aap ke mojooda bill ke mutabiq aap ka connection "Solar Net-Metering (3-Phase TOU)" hai jiska Tariff code A-1b(03)T hai.\n\n` +
            `• Meter Ki Qisam: Green Bi-directional meter jo Import (grid consumption) aur Export (solar surplus) dono alag alag record karta hai.\n` +
            `• Category: Net Metering ke tehat din ke export units aap ke off-peak units ko direct offset karte hain.`;
        } else if (billContext.connectionType === 'domestic_single_phase_protected') {
          connText =
            `Nahi, aap ka meter solar nahi hai. Aap ka connection "Domestic Single Phase (Protected)" hai jiska tariff code A-1a(01) hai.\n\n` +
            `Aap ke units 200 se kam hone ki wajah se aap subsidized protected slabs par hain.`;
        } else if (billContext.connectionType === 'domestic_single_phase_unprotected') {
          connText =
            `Nahi, aap ka meter solar nahi hai. Aap ka connection "Domestic Single Phase (Unprotected)" hai jiska tariff code A-1a(01) hai.\n\n` +
            `Yeh aam single-phase meter hai jahan 200 units se ooper hone par normal progressive slabs lagti hain.`;
        } else {
          connText = `Aap ka connection 3-Phase TOU hai jahan Peak aur Off-Peak units alag alag count hotay hain.`;
        }
      } else {
        if (isSolar) {
          connText =
            `Yes! According to your active bill, your connection is an official "Solar Net-Metering (3-Phase TOU)" connection under Tariff Code A-1b(03)T.\n\n` +
            `• Meter Type: Bi-directional green meter recording both Import (grid consumption) and Export (solar sent to grid).\n` +
            `• Category: Net Metering under S.R.O. 892(I)/2015 where daytime surplus generation offsets grid units.`;
        } else if (billContext.connectionType === 'domestic_single_phase_protected') {
          connText =
            `No, your meter is NOT solar net-metering. Your active bill is a "Domestic Single Phase (Protected)" connection under Tariff Code A-1a(01).\n\n` +
            `Your consumption is within the subsidized 200-unit tier.`;
        } else if (billContext.connectionType === 'domestic_single_phase_unprotected') {
          connText =
            `No, your meter is NOT solar net-metering. Your active bill is a "Domestic Single Phase (Unprotected)" connection under Tariff Code A-1a(01).\n\n` +
            `It is a standard single-phase residential meter on progressive unprotected slabs.`;
        } else {
          connText = `Your connection is a standard 3-Phase Time of Use (TOU) meter with separate Peak and Off-Peak consumption registers.`;
        }
      }

      return {
        id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        sender: 'assistant',
        text: connText,
        isOutOfScope: false,
        citations,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
    }

    // 2. Bill-Grounded Payment & Credit Balance (CR) Inquiry
    const isCreditOrPayQuery = /(?:why.*pay.*credit|aint.*credit|amount.*credit|credited|do\s+i\s+have\s+to\s+pay|bill\s+bharna\s+hoga|pay\s+karna\s+parega|not\s+to\s+be\s+paid|cr\s+kya\s+hai|negative\s+bill|credit\s+balance)/i.test(userQuery);

    if (isCreditOrPayQuery && billContext) {
      const isNegativeOrCredit = billContext.netPayableWithinDueDate < 0;
      const creditAmount = Math.abs(billContext.netPayableWithinDueDate);
      const citations: ChatMessage['citations'] = [
        {
          title: 'NEPRA SRO 892(I)/2015 - Financial Credit Settlement',
          sro: 'S.R.O. 892(I)/2015, Section 14',
          authority: 'NEPRA Distributed Generation Regulations',
        },
      ];

      let payText = '';
      if (language === 'urdu') {
        if (isNegativeOrCredit) {
          payText =
            `آپ کو بالکل کوئی رقم ادا نہیں کرنی! آپ کے بل پر ${creditAmount.toLocaleString()} روپے کا کریڈٹ (CR) موجود ہے (بل پر 'NOT TO BE PAID' لکھا ہوتا ہے)۔\n\n` +
            `• "CR" کا کیا مطلب ہے؟ اس کا مطلب "Credit" ہے۔ میپکو یا ڈسکو کے پاس آپ کے اضافی پیسے جمع ہیں کیونکہ آپ کی پچھلی سولر ایکسپورٹ یا ایڈجسٹمنٹس کی رقم موجودہ چارجز سے زیادہ بنتی ہے۔\n` +
            `• واجب الادا رقم: اس ماہ آپ کی ادائیگی 0 روپے ہے، اور یہ کریڈٹ ختم ہونے تک اگلے بلوں میں خود بخود منہا ہوتا رہے گا۔`;
        } else {
          payText =
            `اگر آپ کے بل پر رقم کے ساتھ "CR" لکھا ہو تو آپ کو کچھ ادا نہیں کرنا ہوتا۔ تاہم اگر مثبت رقم ہو تو وہ واجب الادا ہوتی ہے۔ اگر آپ نے سولر لگایا ہوا ہے تو کریڈٹ کا تصفیہ ہر سہ ماہی پر ایس آر او 892 کے تحت ہوتا ہے۔`;
        }
      } else if (language === 'roman_urdu') {
        if (isNegativeOrCredit) {
          payText =
            `Aap ko bilkul koi raqam pay NAHI karni! Aap ke bill par Rs. ${creditAmount.toLocaleString()} ka CREDIT (CR) balance hai (jis par 'NOT TO BE PAID' likha hota hai).\n\n` +
            `• "CR" ka matlab: Iska matlab "Credit" hai. DISCO/MEPCO ke paas aap ke faazil paise jama hain kyunke aap ki pichli solar export ya adjustments mojooda bill se ziada theen.\n` +
            `• Payable Amount: Is maheene aap ko Rs. 0 ada karne hain. Yeh balance aainda aane wale bills mein khud bakhud adjust hota rahega.`;
        } else {
          payText =
            `Agar bill par raqam ke sath "CR" likha hai (e.g. -59369 CR), toh aap ko kuch pay nahi karna hota. Agar positive amount hai, tabhi payment wajib hoti hai. Solar net-metering ka faazil credit quarterly ledger mein adjust hota hai.`;
        }
      } else {
        if (isNegativeOrCredit) {
          payText =
            `You do NOT have to pay anything! Your bill shows a CREDIT balance of Rs. ${creditAmount.toLocaleString()} CR (explicitly labeled 'NOT TO BE PAID').\n\n` +
            `• What "CR" means: "CR" stands for Credit. Your DISCO (e.g. MEPCO) owes you this amount because your accumulated solar export units or adjustments exceeded your current electricity charges.\n` +
            `• Amount Due: Your payable amount this month is Rs. 0. This financial credit remains banked on your account and will automatically offset future billing cycles under NEPRA SRO 892(I)/2015.`;
        } else {
          payText =
            `If your bill indicates "CR" next to the amount (or negative balance), no payment is required. Under NEPRA Net-Metering regulations, surplus generation is maintained as a financial credit ledger that rolls over to future cycles.`;
        }
      }

      return {
        id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        sender: 'assistant',
        text: payText,
        isOutOfScope: false,
        citations,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
    }

    // 3. Conversational repetition / clarification (e.g. "again", "repeat", "dobara")
    const isRepeat = /^(?:again|repeat|dobara|phir\s*se)\b/i.test(userQuery.trim());
    if (isRepeat) {
      const repeatText = language === 'urdu'
        ? 'برائے مہربانی بتائیے کہ آپ اپنے بل یا نیپرا قوانین کے کس پہلو کو دوبارہ سمجھنا چاہتے ہیں؟ مثلاً سلیبز، فیول ایڈجسٹمنٹ (FPA)، سولر نیٹ میٹرنگ، یا فی یونٹ لاگت؟'
        : language === 'roman_urdu'
        ? 'Baraye meharbani batayein ke aap apne bill ya NEPRA rules ke kis hissay ko dobara samajhna chahte hain? Maslan Slabs, FPA charges, Solar net-metering, ya Per-unit cost?'
        : 'Please specify which part of your bill or NEPRA regulations you would like clarified again: your slab classification, FPA charges, solar net-metering rules, or per-unit cost?';

      return {
        id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        sender: 'assistant',
        text: repeatText,
        isOutOfScope: false,
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
