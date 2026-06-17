import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: join(__dirname, '.env') })

const app = express()
const PORT = 3001

app.use(cors({ origin: ['http://localhost:5173', 'http://127.0.0.1:5173'] }))
app.use(express.json({ limit: '2mb' }))

app.get('/health', (req, res) => res.json({ ok: true }))

app.get('/api/models', async (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) return res.status(500).json({ error: 'GEMINI_API_KEY not set' })
  try {
    const r = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`)
    const data = await r.json()
    res.json({ models: (data.models || []).map(m => m.name) })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

// Robust JSON extractor — handles markdown fences, partial truncation, nested braces
function extractQuestions(rawText) {
  if (!rawText) return null
  let text = rawText.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim()
  try { const p = JSON.parse(text); if (p?.questions?.length) return p } catch {}

  // Brace-count to find outermost { ... }
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
  // Truncated — try to close open structures
  if (depth > 0 && start !== -1) {
    let partial = text.slice(start)
    partial = partial.replace(/,\s*\{[^{}]*$/, '') // remove last incomplete item
    const opens = (partial.match(/\[/g)||[]).length - (partial.match(/\]/g)||[]).length
    const objs  = (partial.match(/\{/g)||[]).length - (partial.match(/\}/g)||[]).length
    partial += ']'.repeat(Math.max(0, opens)) + '}'.repeat(Math.max(0, objs))
    try { const p = JSON.parse(partial); if (p?.questions?.length) return p } catch {}
  }
  return null
}

app.post('/api/generate', async (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) return res.status(500).json({ error: `GEMINI_API_KEY not set in ${join(__dirname, '.env')}` })

  const { prompt } = req.body
  if (!prompt) return res.status(400).json({ error: 'prompt is required' })

  // Discover available models dynamically
  let availableModels = []
  try {
    const listRes = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`)
    const listData = await listRes.json()
    availableModels = (listData.models || [])
      .filter(m => m.name.includes('gemini') && (m.supportedGenerationMethods || []).includes('generateContent'))
      .map(m => m.name.replace('models/', ''))
  } catch (e) { console.warn('  Could not list models:', e.message) }

  const preferred = [
    'gemini-2.5-flash','gemini-2.5-flash-preview-05-20',
    'gemini-2.0-flash','gemini-2.0-flash-lite',
    'gemini-2.5-pro','gemini-2.5-pro-preview-06-05',
    'gemini-1.5-flash','gemini-1.5-flash-8b','gemini-1.5-pro',
  ]
  let toTry = preferred.filter(m => availableModels.includes(m))
  if (!toTry.length) toTry = availableModels.length ? availableModels : preferred
  console.log(`  Will try: ${toTry.join(', ')}`)

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
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 8192,  // maximum — never truncates
            },
          }),
        })

        const data = await response.json()
        if (!response.ok) {
          lastError = data?.error?.message || `HTTP ${response.status}`
          if (lastError.includes('quota') || lastError.includes('RESOURCE_EXHAUSTED')) {
            console.warn(`  [${model}/${apiVer}] Quota exceeded`)
            break
          }
          console.warn(`  [${model}/${apiVer}] ${lastError.slice(0, 100)}`)
          continue
        }

        const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || ''
        console.log(`  [${model}/${apiVer}] response: ${rawText.length} chars`)

        const parsed = extractQuestions(rawText)
        if (parsed?.questions?.length) {
          console.log(`  Cedric used: ${model} (${apiVer}) — ${parsed.questions.length} questions`)
          return res.json({ text: JSON.stringify(parsed), model })
        }
        lastError = `Could not parse questions (${rawText.length} chars)`
        console.warn(`  [${model}/${apiVer}] ${lastError}`)
      } catch (err) {
        lastError = err.message
        console.warn(`  [${model}/${apiVer}] threw: ${err.message}`)
      }
    }
  }

  const isQuota = lastError.toLowerCase().includes('quota') || lastError.includes('RESOURCE_EXHAUSTED')
  res.status(500).json({ error: isQuota ? 'Quota exceeded. Wait 60 seconds and try again.' : `Failed: ${lastError}` })
})

app.listen(PORT, () => {
  const key = process.env.GEMINI_API_KEY
  console.log(`\n  Cedric AI proxy → http://localhost:${PORT}`)
  console.log(`  .env: ${join(__dirname, '.env')}`)
  console.log(key ? `  API key: loaded (${key.slice(0,8)}...)\n` : `  API key: NOT FOUND\n`)
})
