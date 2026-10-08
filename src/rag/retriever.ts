import { KNOWLEDGE_CORPUS, type KnowledgeChunk } from './corpus/knowledgeData.ts';

export interface RetrievalResult {
  chunk: KnowledgeChunk;
  score: number;
  matchedTerms: string[];
}

// Common stop words in English and Roman Urdu to ignore for scoring
const STOP_WORDS = new Set([
  'what', 'is', 'the', 'a', 'an', 'and', 'or', 'to', 'of', 'in', 'for', 'with', 'on', 'at', 'by', 'from',
  'how', 'why', 'can', 'does', 'do', 'i', 'my', 'me', 'you', 'your', 'it', 'this', 'that', 'there',
  'kya', 'hai', 'hain', 'ka', 'ki', 'ke', 'ko', 'se', 'par', 'pe', 'mein', 'aur', 'ye', 'yeh', 'woh',
  'bhi', 'toh', 'to', 'hoga', 'hogi', 'karein', 'karta', 'karo', 'mujhe', 'mera', 'meri', 'mere',
  'کیا', 'ہے', 'ہیں', 'کا', 'کی', 'کے', 'کو', 'سے', 'پر', 'میں', 'اور', 'یہ', 'وہ', 'بھی', 'تو', 'ہوگا'
]);

// Generic domain words that appear in almost all electricity documents (low weight)
const GENERIC_DOMAIN_WORDS = new Set([
  'bill', 'electricity', 'bijli', 'units', 'sarif', 'consumer', 'بل', 'بجلی', 'یونٹس'
]);

export class NepraRagRetriever {
  private corpus: KnowledgeChunk[];
  // Minimum score required to consider a query in-scope
  public static readonly MIN_CONFIDENCE_THRESHOLD = 3.5;

  constructor(corpus: KnowledgeChunk[] = KNOWLEDGE_CORPUS) {
    this.corpus = corpus;
  }

  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[؟؛،۔٪!?,.:;"'()\[\]{}–—\/\\]/g, ' ')
      .replace(/[^a-z0-9\u0600-\u06FF\s]/g, ' ')
      .split(/\s+/)
      .filter((term) => term.length > 1 && !STOP_WORDS.has(term));
  }

  public retrieve(query: string, topK: number = 2): RetrievalResult[] {
    const queryTokens = this.tokenize(query);
    if (queryTokens.length === 0) return [];

    const candidates: RetrievalResult[] = [];

    for (const chunk of this.corpus) {
      let score = 0;
      const matchedTerms: string[] = [];

      const keywordsTokens = chunk.keywords.flatMap((k) => this.tokenize(k));
      const titleTokens = this.tokenize(`${chunk.title} ${chunk.titleUrdu}`);
      const contentTokens = this.tokenize(
        `${chunk.contentEnglish} ${chunk.contentRomanUrdu} ${chunk.contentUrdu} ${chunk.sroCitation}`
      );

      for (const token of queryTokens) {
        const isGeneric = GENERIC_DOMAIN_WORDS.has(token);

        // Core high-value keyword match (e.g. 'fpa', 'protected', 'detection', 'solar', 'csm')
        if (keywordsTokens.includes(token)) {
          const boost = isGeneric ? 1.0 : 8.0;
          score += boost;
          matchedTerms.push(token);
        }
        // Title match
        else if (titleTokens.includes(token)) {
          const boost = isGeneric ? 0.8 : 6.0;
          score += boost;
          matchedTerms.push(token);
        }
        // General content match
        else if (contentTokens.includes(token)) {
          const boost = isGeneric ? 0.2 : 2.0;
          score += boost;
          matchedTerms.push(token);
        }
        // Number matching for slabs or SRO numbers (e.g. 200, 201, 575, 342, 31)
        else if (/\d+/.test(token)) {
          if (
            chunk.sroCitation.includes(token) ||
            chunk.contentEnglish.includes(token) ||
            chunk.contentRomanUrdu.includes(token)
          ) {
            score += 5.0;
            matchedTerms.push(token);
          }
        }
      }

      // Only accept if above minimum confidence threshold
      if (score >= NepraRagRetriever.MIN_CONFIDENCE_THRESHOLD) {
        candidates.push({
          chunk,
          score,
          matchedTerms: Array.from(new Set(matchedTerms)),
        });
      }
    }

    // Sort descending by score
    candidates.sort((a, b) => b.score - a.score);

    return candidates.slice(0, topK);
  }
}
