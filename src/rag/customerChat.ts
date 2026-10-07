import { NepraRagRetriever } from './retriever.ts';
import type { BillCalculationResult } from '../engine/types.ts';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
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
    const citations: ChatMessage['citations'] = [];

    // Build citations
    for (const res of searchResults) {
      citations.push({
        title: res.chunk.title,
        sro: res.chunk.sroCitation,
        authority: res.chunk.legalAuthority,
      });
    }

    // Contextual preamble if bill data exists
    let contextHeader = '';
    if (billContext && billContext.totalUnits > 0) {
      if (language === 'roman_urdu') {
        contextHeader = `Aap ke mojooda bill ke hisaab se (${billContext.totalUnits} units, Total: Rs. ${billContext.netPayableWithinDueDate.toLocaleString()}): \n\n`;
      } else {
        contextHeader = `Based on your active calculation (${billContext.totalUnits} units, Total: Rs. ${billContext.netPayableWithinDueDate.toLocaleString()}): \n\n`;
      }
    }

    if (searchResults.length > 0) {
      const primary = searchResults[0].chunk;
      const secondary = searchResults[1]?.chunk;

      if (language === 'roman_urdu') {
        responseText = `${contextHeader}${primary.contentRomanUrdu}`;
        if (secondary) {
          responseText += `\n\nIske ilawa: ${secondary.contentRomanUrdu}`;
        }
      } else if (language === 'urdu') {
        responseText = `${contextHeader}${primary.titleUrdu}\n\n${primary.contentEnglish}`;
      } else {
        responseText = `${contextHeader}${primary.contentEnglish}`;
        if (secondary) {
          responseText += `\n\nAdditionally: ${secondary.contentEnglish}`;
        }
      }
    } else {
      // General guidance fallback
      if (language === 'roman_urdu') {
        responseText =
          'Aap bijli ke bill, slabs, FPA, QTA, Detection bill ke qawaneen ya Solar Net-Metering ke baray mein sawal pooch saktay hain. Maslan: "FPA kya hai?", "Protected status kaise bachayein?", ya "Detection bill ke rules kya hain?".';
      } else {
        responseText =
          'I am your NEPRA Regulatory & Bill Explainer Assistant. You can ask about tariff slabs, FPA, QTA, detection bills, slow meters, or solar net-metering. For example: "What is FPA?", "How do I regain protected status?", or "What are my rights regarding detection bills?".';
      }
    }

    return {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      sender: 'assistant',
      text: responseText,
      citations: citations.length > 0 ? citations : undefined,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
  }
}
