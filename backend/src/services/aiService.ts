import { PrismaClient } from '@prisma/client'
import * as habitsService from './habitsService'
import * as studyService from './studyService'

const prisma = new PrismaClient()

export async function generateInsights(userId: string, userApiKey?: string, userPrompt?: string) {
  const rawKey = userApiKey || process.env.GEMINI_API_KEY
  if (!rawKey || !rawKey.trim()) {
    throw new Error('MISSING_KEY')
  }
  const apiKey = rawKey.trim()

  const user = await prisma.user.findUnique({ where: { id: userId } })
  const username = user?.username || user?.email?.split('@')[0] || 'Utente'

  // Fetch recent user data
  const [
    recentEntries,
    activeGoals,
    habitStreak,
    studyStats,
    lastWorkout,
    avgEnergy,
  ] = await Promise.all([
    prisma.diaryEntry.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      take: 3,
      select: { title: true, content: true, mood: true, energy: true, date: true },
    }),
    prisma.goal.findMany({
      where: { userId, status: { in: ['IN_PROGRESS', 'NOT_STARTED'] } },
      take: 5,
      select: { title: true, status: true, deadline: true },
    }),
    habitsService.streak(userId),
    studyService.weeklyStats(userId),
    prisma.workout.findFirst({ where: { userId }, orderBy: { date: 'desc' } }),
    prisma.diaryEntry.aggregate({ where: { userId }, _avg: { energy: true } }),
  ])

  const diaryText = recentEntries.length > 0
    ? recentEntries.map(e => `[${new Date(e.date).toLocaleDateString('it-IT')}] ${e.title} (Mood: ${e.mood}, Energia: ${e.energy}/5): ${e.content.slice(0, 150)}...`).join('\n')
    : 'Nessun diario inserito di recente.'

  const goalsText = activeGoals.length > 0
    ? activeGoals.map(g => `- ${g.title} (${g.status})`).join('\n')
    : 'Nessun obiettivo attivo al momento.'

  const workoutText = lastWorkout
    ? `${lastWorkout.type || 'Workout'} (${new Date(lastWorkout.date).toLocaleDateString('it-IT')}, ${lastWorkout.duration || '?'} min)`
    : 'Nessun allenamento registrato.'

  const energyAvg = (avgEnergy._avg.energy ?? 0).toFixed(1)

  const userPromptSection = userPrompt && userPrompt.trim()
    ? `\n• NOTA / SPECIFICA / DOMANDA INSERITA DALL'UTENTE IN QUESTO MOMENTO:\n"${userPrompt.trim()}"\n\nATTENZIONE IMPORTANTE: L'utente ti ha fornito la nota specifica qui sopra. Assicurati di rispondere direttamente a quanto indicato o spiegato dall'utente e di adattare le 3 sezioni alla sua situazione attuale!\n`
    : ''

  const promptText = `
Sei l'AI Personal Coach e Productivity Assistant integrato nell'applicazione Personal OS.
Il tuo compito è analizzare i dati recenti dell'utente (${username}) e generare un feedback sintetico, personalizzato, motivante e altamente pragmatico in lingua italiana.

--- DATI RECENTI DELL'UTENTE ---
• Nome: ${username}
• Livello energia medio (diario): ${energyAvg}/5
• Streak abitudini consecutive: ${habitStreak} giorni
• Studio questa settimana: ${studyStats.totalHours} ore in ${studyStats.sessions} sessioni
• Ultimo allenamento: ${workoutText}

• Ultimi diari di bordo:
${diaryText}

• Obiettivi attivi:
${goalsText}
${userPromptSection}
-------------------------------

Formatta la risposta direttamente in Markdown pulito senza preamboli, suddivisa esattamente in queste 3 brevi sezioni:

### 🧠 Mindset & Energia
(1-2 frasi di analisi del mood, energia e stato d'animo attuale)

### 🎯 Focus Obiettivi & Abitudini
(1-2 frasi pratiche su come mantenere la costanza negli obiettivi ed abitudini)

### ⚡ Azione Chiave per Oggi
(1 consiglio d'azione preciso e immediato da mettere in pratica oggi)
`

  const modelsToTry = [
    'gemini-1.5-flash',
    'gemini-2.0-flash',
    'gemini-2.5-flash',
    'gemini-1.5-pro'
  ]

  let lastErrorMessage = ''

  for (const model of modelsToTry) {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: promptText }] }]
        })
      })

      if (response.ok) {
        const data = await response.json()
        const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text
        if (candidateText) {
          return { insights: candidateText }
        }
      } else {
        const errorData = await response.json().catch(() => ({}))
        lastErrorMessage = errorData.error?.message || `HTTP ${response.status}`
        console.warn(`[Gemini Model ${model} failed]:`, lastErrorMessage)
      }
    } catch (e: any) {
      lastErrorMessage = e.message
      console.warn(`[Gemini Model ${model} fetch exception]:`, e.message)
    }
  }

  throw new Error(`Errore Gemini API: ${lastErrorMessage || 'Impossibile contattare i modelli Gemini.'}`)
}
