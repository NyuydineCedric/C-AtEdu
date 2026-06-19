// Vercel Serverless Function: /api/generate
// Replaces the local proxy.mjs — runs automatically on Vercel, no server needed.
// Set GEMINI_API_KEY in Vercel dashboard: Project Settings → Environment Variables

function extractQuestions(rawText) {
  if (!rawText) return null
  let text = rawText.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim()
  try { const p = JSON.parse(text); if (p?.questions?.length) return p } catch {}

  let depth = 0, start = -1
  for (let i = 0; i < text.length; i++) {
    if (text[i] === '{') { if (depth === 0) start = i; depth++ }
    else if (text[i] === '}') {
      depth--
      if (depth === 0 && start !== -1) {
        try { const p = JSON.parse(text.slice(start, i + 1)); if (p?.questions?.length) return p } catch {}
        start = -1
      }
    }
  }
  if (depth > 0 && start !== -1) {
    let partial = text.slice(start)
    partial = partial.replace(/,\s*\{[^{}]*$/, '')
    const opens = (partial.match(/\[/g) || []).length - (partial.match(/\]/g) || []).length
    const objs = (partial.match(/\{/g) || []).length - (partial.match(/\}/g) || []).length
    partial += ']'.repeat(Math.max(0, opens)) + '}'.repeat(Math.max(0, objs))
    try { const p = JSON.parse(partial); if (p?.questions?.length) return p } catch {}
  }
  return null
}

const PREFERRED_MODELS = [
  'gemini-2.5-flash', 'gemini-2.5-flash-preview-05-20',
  'gemini-2.0-flash', 'gemini-2.0-flash-lite',
  'gemini-2.5-pro', 'gemini-2.5-pro-preview-06-05',
  'gemini-1.5-flash', 'gemini-1.5-flash-8b', 'gemini-1.5-pro',
]

export default async function handler(req, res) {
  // CORS (same-origin on Vercel, but harmless to allow)
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return res.status(500).json({
      error: 'GEMINI_API_KEY not set. Add it in Vercel → Project Settings → Environment Variables.'
    })
  }

  const { prompt } = req.body || {}
  if (!prompt) return res.status(400).json({ error: 'prompt is required' })

  // Discover available models on this key
  let availableModels = []
  try {
    const listRes = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`)
    const listData = await listRes.json()
    availableModels = (listData.models || [])
      .filter(m => m.name.includes('gemini') && (m.supportedGenerationMethods || []).includes('generateContent'))
      .map(m => m.name.replace('models/', ''))
  } catch (e) {
    console.warn('Could not list models:', e.message)
  }

  let toTry = PREFERRED_MODELS.filter(m => availableModels.includes(m))
  if (!toTry.length) toTry = availableModels.length ? availableModels : PREFERRED_MODELS

  let lastError = ''
  for (const model of toTry) {
    for (const apiVer of ['v1beta', 'v1']) {
      try {
        const url = `https://generativelanguage.googleapis.com/${apiVer}/models/${model}:generateContent?key=${apiKey}`
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.7, maxOutputTokens: 8192 },
          }),
        })
        const data = await response.json()
        if (!response.ok) {
          lastError = data?.error?.message || `HTTP ${response.status}`
          if (lastError.includes('quota') || lastError.includes('RESOURCE_EXHAUSTED')) break
          continue
        }
        const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || ''
        const parsed = extractQuestions(rawText)
        if (parsed?.questions?.length) {
          return res.status(200).json({ text: JSON.stringify(parsed), model })
        }
        lastError = `Could not parse questions (${rawText.length} chars)`
      } catch (err) {
        lastError = err.message
      }
    }
  }

  const isQuota = lastError.toLowerCase().includes('quota') || lastError.includes('RESOURCE_EXHAUSTED')
  res.status(500).json({
    error: isQuota ? 'Gemini quota exceeded. Wait 60 seconds and try again.' : `Failed: ${lastError}`
  })
}