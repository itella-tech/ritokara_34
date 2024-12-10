import { supabase } from '@/lib/supabaseClient';

export interface Dictionary {
  id: string;
  terms: string;
  created_at: string;
  updated_at: string;
}

export const dictionaryService = {
  async getDictionary(): Promise<Dictionary | null> {
    const { data, error } = await supabase
      .from('dictionaries')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      console.error('Error fetching dictionary:', error);
      return null;
    }

    return data;
  },

  async updateDictionary(terms: string): Promise<Dictionary | null> {
    const { data, error } = await supabase
      .from('dictionaries')
      .insert([
        {
          terms: terms,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error updating dictionary:', error);
      return null;
    }

    return data;
  },

  // 辞書の内容をプロンプト用の文字列に変換
  formatTermsForPrompt(terms: string): string {
    if (!terms) return '';

    const termList = terms
      .split('\n')
      .map(term => term.trim())
      .filter(term => term.length > 0);

    if (termList.length === 0) return '';

    return `
以下の固有名詞や地名の翻訳には特に注意してください：
${termList.join('\n')}
`;
  }
}; 