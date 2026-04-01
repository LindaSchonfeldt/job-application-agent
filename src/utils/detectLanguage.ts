export const detectLanguage = (text: string): 'sv' | 'en' => {
    const words = text.toLowerCase().match(/\b\w+\b/g) ?? [];
    if (words.length === 0)
        return 'sv';
    const svWords = new Set([
        'och',
        'att',
        'för',
        'med',
        'av',
        'en',
        'ett',
        'är',
        'som',
        'på',
        'vi',
        'du',
        'det',
        'den',
        'sin',
        'sig',
        'till',
        'om',
        'men',
        'har',
        'kan',
        'ska',
        'eller',
        'inte',
        'också',
        'vill',
        'inom',
        'samt',
        'vara',
        'våra',
        'vårt',
        'hos',
    ]);
    const svCount = words.filter((w) => svWords.has(w)).length;
    return svCount / words.length > 0.04 ? 'sv' : 'en';
}