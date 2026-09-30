export const TONE_DEFINITIONS = {
  fix_grammar: {
    id: 'fix_grammar',
    name: 'İmla & Dilbilgisi Düzelt',
    description: 'Yalnızca yazım ve imla yanlışlarını giderir, metnin orijinal anlam ve üslubunu bozmaz.',
    prompt: 'Aşağıdaki metnin yalnızca imla, yazım, noktalama ve temel dilbilgisi hatalarını düzelt. Orijinal tonunu, üslubunu veya anlamını değiştirme. Yalnızca düzeltilmiş nihai metni döndür, herhangi bir açıklama, önsöz veya tırnak işareti ekleme.'
  },
  daily: {
    id: 'daily',
    name: 'Günlük & Samimi',
    description: 'Doğal, akıcı, arkadaşça ve samimi bir konuşma diline uyarlar.',
    prompt: 'Aşağıdaki metni günlük, doğal, samimi ve akıcı bir Türkçe konuşma üslubuyla yeniden yaz. Gereksiz resmiyetten arındır. Yalnızca dönüştürülmüş nihai metni döndür, açıklama veya ek not ekleme.'
  },
  formal: {
    id: 'formal',
    name: 'Resmi & Kurumsal',
    description: 'Profesyonel, iş dünyasına veya resmi yazışmalara uygun kurumsal bir dil kullanır.',
    prompt: 'Aşağıdaki metni profesyonel, kurumsal, nezaketli ve resmi bir iş/yazışma diliyle yeniden yaz. Hukuki veya kurumsal standartlara uygun saygılı bir üslup kullan. Yalnızca dönüştürülmüş nihai metni döndür, açıklama veya ekleme yapma.'
  },
  slang: {
    id: 'slang',
    name: 'Argo & Sokak Ağzı',
    description: 'Gençlik veya sokak jargonuyla, hafif mizahi ve argo unsurlarla yeniden ifade eder.',
    prompt: 'Aşağıdaki metni esprili, sokak ağzı, argo ve popüler gençlik jargonuyla (küfür ve nefret söylemi içermeyecek şekilde) yeniden yaz. Yalnızca dönüştürülmüş metni döndür, önsöz veya açıklama ekleme.'
  },
  academic: {
    id: 'academic',
    name: 'Akademik & Bilimsel',
    description: 'Nesnel, analitik ve akademik bir terminoloji ile ifade eder.',
    prompt: 'Aşağıdaki metni akademik, tarafsız, analitik ve akademik literatüre uygun bir üslupla yeniden kaleme al. Yalnızca dönüştürülmüş metni döndür.'
  },
  summarize: {
    id: 'summarize',
    name: 'Özetle & Netleştir',
    description: 'Metnin ana fikrini kısa ve öz maddeler veya tek bir net paragraf halinde verir.',
    prompt: 'Aşağıdaki metnin ana mesajını koruyarak en kısa ve öz şekilde özetle. Gereksiz tekrarları çıkar. Yalnızca özeti döndür.'
  }
};
