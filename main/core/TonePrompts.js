export const TONE_DEFINITIONS = {
  fix_grammar: {
    id: 'fix_grammar',
    name: '✍️ İmla & Dilbilgisi',
    description: 'Yalnızca yazım ve imla yanlışlarını giderir.',
    prompt: 'Aşağıdaki metnin yalnızca imla, yazım, noktalama ve temel dilbilgisi hatalarını düzelt. Orijinal anlamını, akışını ve üslubunu bozma. Yalnızca düzeltilmiş nihai metni döndür, herhangi bir açıklama, önsöz veya tırnak işareti ekleme.'
  },
  daily: {
    id: 'daily',
    name: '💬 Günlük & Samimi',
    description: 'Doğal, akıcı, arkadaşça ve samimi bir konuşma diline uyarlar.',
    prompt: 'Aşağıdaki metni günlük, doğal, samimi ve akıcı bir konuşma üslubuyla yeniden yaz. Gereksiz resmiyetten arındır. Yalnızca dönüştürülmüş nihai metni döndür, açıklama veya ek not ekleme.'
  },
  formal: {
    id: 'formal',
    name: '💼 Resmi & Kurumsal',
    description: 'Profesyonel, iş dünyasına veya resmi yazışmalara uygun kurumsal bir dil kullanır.',
    prompt: 'Aşağıdaki metni profesyonel, kurumsal, nezaketli ve resmi bir iş/yazışma diliyle yeniden yaz. Saygılı ve etkili bir üslup kullan. Yalnızca dönüştürülmüş nihai metni döndür, açıklama veya ekleme yapma.'
  },
  slang: {
    id: 'slang',
    name: '🔥 Argo & Sokak Ağzı',
    description: 'Gençlik veya sokak jargonuyla, hafif mizahi ve argo unsurlarla yeniden ifade eder.',
    prompt: 'Aşağıdaki metni esprili, sokak ağzı, argo ve popüler gençlik jargonuyla (küfür ve nefret söylemi içermeyecek şekilde) yeniden yaz. Yalnızca dönüştürülmüş metni döndür, önsöz veya açıklama ekleme.'
  },
  academic: {
    id: 'academic',
    name: '🎓 Akademik & Ağır',
    description: 'Nesnel, analitik ve akademik bir terminoloji ile ifade eder.',
    prompt: 'Aşağıdaki metni akademik, tarafsız, analitik ve bilimsel literatüre uygun zengin bir üslupla yeniden kaleme al. Yalnızca dönüştürülmüş metni döndür.'
  },
  gamer: {
    id: 'gamer',
    name: '🎮 Gamer & Oyun Kültürü',
    description: 'Oyun dünyası, espor ve gamer jargonuyla enerjik şekilde yeniden yazar.',
    prompt: 'Aşağıdaki metni video oyunu, espor ve gamer jargonuyla (FPS, RPG, GG, clutch, buff/nerf, carry gibi doğal oyun terimleriyle) enerjik, eğlenceli ve dinamik bir oyuncu diliyle yeniden yaz. Yalnızca dönüştürülmüş metni döndür.'
  },
  techie: {
    id: 'techie',
    name: '💻 Teknoloji Kurdu & Geek',
    description: 'Yazılımcı, donanımcı ve teknoloji geek jargonuna uygun biçimde yeniden ifade eder.',
    prompt: 'Aşağıdaki metni bir teknoloji uzmanı, yazılımcı ve donanım/geek kültürü üslubuyla (algoritmik, analitik, teknolojik terimler ve net bakış açısıyla) yeniden yaz. Yalnızca dönüştürülmüş metni döndür.'
  },
  summarize: {
    id: 'summarize',
    name: '📌 Özetle',
    description: 'Metnin ana fikrini kısa ve öz şekilde özetler.',
    prompt: 'Aşağıdaki metnin ana mesajını koruyarak en kısa ve öz şekilde özetle. Gereksiz tekrarları çıkar. Yalnızca özeti döndür.'
  },
  diplomatic: {
    id: 'diplomatic',
    name: '🕊️ Nazik / Diplomatik Hayır',
    description: 'Zarif, kırmayan, profesyonelce sınır çizen ve diplomatik bir dille reddeder.',
    prompt: 'Aşağıdaki metni karşı tarafı kırmayan, son derece nazik, profesyonel, yapıcı ancak sınırları net çizen diplomatik bir dille yeniden yaz. Gerekirse zarif bir ret veya erteleme dili kur. Yalnızca dönüştürülmüş metni döndür.'
  },
  marketing: {
    id: 'marketing',
    name: '🧲 Pazarlama & Viral Hook',
    description: 'Sosyal medya, LinkedIn veya e-bülten için dikkat çekici, merak uyandıran viral metin.',
    prompt: 'Aşağıdaki metni dikkat çeken, merak uyandıran, kancası (hook) kuvvetli, emoji destekli ve harekete geçirici (Call-to-Action) bir pazarlama ve sosyal medya paylaşım metnine dönüştür. Yalnızca dönüştürülmüş metni döndür.'
  },
  eli5: {
    id: 'eli5',
    name: '💡 Basitleştir (5 Yaşında Anlat)',
    description: 'Ağır veya teknik kavramları herkesin anlayabileceği çocuk sadeliğine indirger.',
    prompt: 'Aşağıdaki karmaşık metni herkesin, hatta 5 yaşındaki bir çocuğun bile hemen anlayabileceği kadar sade, duru, net ve günlük benzetmelerle basitleştirerek yeniden yaz. Yalnızca dönüştürülmüş metni döndür.'
  },
  persuasive: {
    id: 'persuasive',
    name: '🎯 İkna Edici & Satış',
    description: 'Mantıksal faydaya odaklanan, kararlı ve ikna gücü yüksek bir satış dili.',
    prompt: 'Aşağıdaki metni karşı tarafı ikna etmeye odaklanan, güçlü deliller, değer önerisi ve mantıksal fayda sunan etkileyici ve kararlı bir üslupla yeniden kaleme al. Yalnızca dönüştürülmüş metni döndür.'
  },
  creative: {
    id: 'creative',
    name: '🎨 Yaratıcı Hikaye',
    description: 'Betimlemeler ve akıcı kurguyla okuyucuyu içine çeken edebi anlatım.',
    prompt: 'Aşağıdaki metni zengin betimlemeler, canlı benzetmeler ve akıcı bir hikaye diliyle sanatsal ve yaratıcı bir üslupla yeniden yaz. Yalnızca dönüştürülmüş metni döndür.'
  },
  custom: {
    id: 'custom',
    name: '⚙️ Özel Tonum',
    description: 'Ayarlar sayfasından belirlediğiniz kişisel yönerge.',
    prompt: '' // TextTransformService içinde dinamik olarak storage'dan doldurulur
  }
};
