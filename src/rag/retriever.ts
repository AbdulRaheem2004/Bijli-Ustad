import { KNOWLEDGE_CORPUS, type KnowledgeChunk } from './corpus/knowledgeData.ts';

export interface RetrievalResult {
  chunk: KnowledgeChunk;
  score: number;
  matchedTerms: string[];
}

export class NepraRagRetriever {
  private corpus: KnowledgeChunk[];

  constructor(corpus: KnowledgeChunk[] = KNOWLEDGE_CORPUS) {
    this.corpus = corpus;
  }

  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((term) => term.length > 1);
  }

  public retrieve(query: string, topK: number = 3): RetrievalResult[] {
    const queryTokens = this.tokenize(query);
    if (queryTokens.length === 0) return [];

    const results: RetrievalResult[] = [];

    for (const chunk of this.corpus) {
      let score = 0;
      const matchedTerms: string[] = [];

      const titleTokens = this.tokenize(chunk.title);
      const contentTokens = this.tokenize(
        `${chunk.contentEnglish} ${chunk.contentRomanUrdu} ${chunk.sroCitation}`
      );
      const keywordsTokens = chunk.keywords.flatMap((k) => this.tokenize(k));

      for (const token of queryTokens) {
        // High boost for keyword match
        if (keywordsTokens.includes(token)) {
          score += 5.0;
          matchedTerms.push(token);
        }
        // High boost for title match
        else if (titleTokens.includes(token)) {
          score += 4.0;
          matchedTerms.push(token);
        }
        // Content match
        else if (contentTokens.includes(token)) {
          score += 1.5;
          matchedTerms.push(token);
        }
        // Substring / prefix match for numbers like '200', '201', '575', '342'
        else if (/\d+/.test(token)) {
          if (
            chunk.sroCitation.includes(token) ||
            chunk.contentEnglish.includes(token) ||
            chunk.contentRomanUrdu.includes(token)
          ) {
            score += 4.5;
            matchedTerms.push(token);
          }
        }
      }

      if (score > 0) {
        results.push({
          chunk,
          score,
          matchedTerms: Array.from(new Set(matchedTerms)),
        });
      }
    }

    // Sort descending by score
    results.sort((a, b) => b.score - a.score);

    return results.slice(0, topK);
  }
}
