import { Request, Response } from 'express'
import * as aiService from '../services/aiService'
import * as authService from '../services/authService'

export async function getInsights(req: Request, res: Response) {
  try {
    const user = await authService.getUserFromRequest(req)
    if (!user) return res.status(401).json({ error: 'unauthenticated' })

    const userApiKey = (req.headers['x-gemini-api-key'] as string) || req.body?.apiKey
    const userPrompt = req.body?.userPrompt || req.body?.prompt
    const result = await aiService.generateInsights(user.id, userApiKey, userPrompt)
    res.json(result)
  } catch (err: any) {
    console.error('[AI Insights Controller Error]:', err)
    if (err.message === 'MISSING_KEY') {
      return res.status(400).json({ error: 'MISSING_KEY', message: 'Nessuna chiave API Gemini trovata. Inserisci la tua chiave API nelle impostazioni.' })
    }
    res.status(500).json({ error: 'AI_ERROR', message: err.message || 'Errore durante la generazione dei consigli IA' })
  }
}
