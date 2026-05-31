const MODEL_NAME = 'Xenova/paraphrase-multilingual-MiniLM-L12-v2'

let extractorPromise = null

function buildText(item) {
  return [
    item.name,
    item.description,
    item.full_description,
    item.pharmacopoeia,
  ].filter(Boolean).join(' ')
}

function fallbackSimilarSubstances(current, items) {
  const textForKeywords = buildText(current).toLowerCase()
  const keywords = textForKeywords.split(/[\s,.\-()]+/).filter((keyword) => keyword.length > 3)

  return items
    .filter((item) => item.id !== current.id)
    .map((item) => {
      const name = item.name.toLowerCase()
      const description = (item.description || '').toLowerCase()
      const similarity = keywords.reduce((score, keyword) => {
        return score + (name.includes(keyword) ? 3 : 0) + (description.includes(keyword) ? 1 : 0)
      }, 0)
      return { ...item, similarity }
    })
    .filter((item) => item.similarity > 0)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 4)
}

async function getExtractor() {
  if (!extractorPromise) {
    extractorPromise = import('@xenova/transformers').then(({ pipeline }) => (
      pipeline('feature-extraction', MODEL_NAME)
    ))
  }
  return extractorPromise
}

async function embedText(text) {
  const extractor = await getExtractor()
  const output = await extractor(text, { pooling: 'mean', normalize: true })
  return Array.from(output.data)
}

function cosineSimilarity(first, second) {
  return first.reduce((sum, value, index) => sum + value * second[index], 0)
}

export async function findSimilarSubstances(current, items) {
  if (!current || !items?.length) return []

  try {
    const currentEmbedding = await embedText(buildText(current))
    const candidates = items.filter((item) => item.id !== current.id)
    const candidateEmbeddings = await Promise.all(
      candidates.map((item) => embedText(buildText(item))),
    )

    return candidates
      .map((item, index) => ({
        ...item,
        similarity: cosineSimilarity(currentEmbedding, candidateEmbeddings[index]),
      }))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 4)
  } catch {
    return fallbackSimilarSubstances(current, items)
  }
}
