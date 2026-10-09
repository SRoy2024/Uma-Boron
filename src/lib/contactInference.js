const RELATIONSHIP_SIGNALS = {
  mom: ['ma', 'maa', 'mom', 'mother', 'mummy', 'amma', 'ammi', 'mamoni', 'mataji', 'aai', 'মা'],
  dad: ['baba', 'dad', 'father', 'papa', 'bapi', 'pitaji', 'abba', 'bauji', 'appa', 'বাবা'],
  love: ['love', 'partner', 'wife', 'husband', 'spouse', 'priyo', 'jaan', 'jaanu', 'sona', 'shona', 'bhalobasha', 'প্রিয়', 'ভালোবাসা'],
  sibling: ['brother', 'sister', 'sibling', 'bhai', 'bhaiya', 'dada', 'didi', 'bon', 'behna', 'bro', 'sis', 'chhotu', 'anna', 'ভাই', 'বোন', 'দাদা', 'দিদি'],
  friend: ['friend', 'bestie', 'buddy', 'bondhu', 'dost', 'yaar', 'sakha', 'mitr', 'বন্ধু', 'দোস্ত'],
}

function normalizeContactName(value = '') {
  return value
    .normalize('NFKC')
    .toLocaleLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function inferRelationshipFromContactName(name) {
  const normalized = normalizeContactName(name)
  if (!normalized) return { id: 'friend', confidence: 0, matchedSignal: null }

  const tokens = new Set(normalized.split(' '))
  let best = { id: 'friend', confidence: 0.2, matchedSignal: null }

  for (const [id, signals] of Object.entries(RELATIONSHIP_SIGNALS)) {
    for (const signal of signals) {
      const normalizedSignal = normalizeContactName(signal)
      const exact = normalized === normalizedSignal
      const tokenMatch = tokens.has(normalizedSignal)
      const phraseMatch = normalized.includes(normalizedSignal) && normalizedSignal.length >= 4
      const confidence = exact ? 1 : tokenMatch ? 0.9 : phraseMatch ? 0.7 : 0
      if (confidence > best.confidence) best = { id, confidence, matchedSignal: signal }
    }
  }

  return best
}

export const contactInferenceTestCases = [
  ['Ma Home', 'mom'],
  ['Maa Kolkata', 'mom'],
  ['Baba Office', 'dad'],
  ['Papa New Number', 'dad'],
  ['Didi Ananya', 'sibling'],
  ['Rohit Bhai', 'sibling'],
  ['Riya Bestie', 'friend'],
  ['College Dost', 'friend'],
  ['Priyo', 'love'],
  ['My Love', 'love'],
  ['Anirban Sen', 'friend'],
]
