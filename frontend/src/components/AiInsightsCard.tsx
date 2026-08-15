import React, { useState, useEffect } from 'react'
import { SparklesIcon, Cog6ToothIcon, ArrowPathIcon, KeyIcon, XMarkIcon } from '@heroicons/react/24/outline/index.js'
import { post } from '../services/api'

const STORAGE_KEY = 'personal-os-gemini-key'

export default function AiInsightsCard() {
  const [userPrompt, setUserPrompt] = useState('')
  const [apiKey, setApiKey] = useState<string>(() => localStorage.getItem(STORAGE_KEY) || '')
  const [insights, setInsights] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showConfig, setShowConfig] = useState(false)
  const [inputKey, setInputKey] = useState(apiKey)

  async function generate(overrideKey?: string) {
    const keyToUse = overrideKey !== undefined ? overrideKey : apiKey
    setLoading(true)
    setError(null)

    try {
      const headers: Record<string, string> = {}
      if (keyToUse) {
        headers['x-gemini-api-key'] = keyToUse
      }

      const res = await post('/api/ai/insights', { apiKey: keyToUse, userPrompt }, { headers })
      if (res.insights) {
        setInsights(res.insights)
      } else {
        setError('Impossibile generare consigli al momento.')
      }
    } catch (err: any) {
      if (err.message && (err.message.includes('MISSING_KEY') || err.message.includes('Nessuna chiave'))) {
        setError('Inserisci la tua chiave API Gemini per abilitare i consigli dell\'IA.')
        setShowConfig(true)
      } else {
        setError(err.message || 'Errore durante la connessione a Gemini API.')
      }
    } finally {
      setLoading(false)
    }
  }

  function saveKey() {
    const trimmed = inputKey.trim()
    setApiKey(trimmed)
    if (trimmed) {
      localStorage.setItem(STORAGE_KEY, trimmed)
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
    setShowConfig(false)
    generate(trimmed)
  }

  return (
    <div className="card" style={{
      position: 'relative',
      background: 'linear-gradient(135deg, var(--bg-surface) 0%, var(--bg-elevated) 100%)',
      border: '1px solid var(--accent-glow)',
      boxShadow: '0 8px 30px rgba(124, 110, 249, 0.08)',
    }}>
      {/* Header */}
      <div className="card-header" style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'linear-gradient(135deg, #7c6ef9, #a78bfa)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff'
          }}>
            <SparklesIcon style={{ width: 18, height: 18 }} />
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
              AI Coach & Insights
              <span className="badge" style={{ fontSize: 10, padding: '1px 6px' }}>Gemini AI</span>
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Analisi dei tuoi progressi e consigli personalizzati</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            className="icon-btn"
            title="Configura Chiave API Gemini"
            onClick={() => { setInputKey(apiKey); setShowConfig(!showConfig) }}
            style={{ width: 32, height: 32 }}
          >
            <Cog6ToothIcon style={{ width: 16, height: 16 }} />
          </button>
          <button
            className="btn btn-primary"
            onClick={() => generate()}
            disabled={loading}
            style={{ padding: '6px 14px', fontSize: 13 }}
          >
            <ArrowPathIcon style={{ width: 14, height: 14, animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            {loading ? 'Elaborazione…' : insights ? 'Rigenera' : 'Genera Consigli'}
          </button>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '20px 24px' }}>
        {/* Optional User Context Prompt Input */}
        <div style={{ marginBottom: 16 }}>
          <input
            className="text-input"
            placeholder="Scrivi qui se desideri spiegare qualcosa all'IA (es: 'Oggi sono stanco', 'Domani ho un esame')..."
            value={userPrompt}
            onChange={e => setUserPrompt(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !loading) generate() }}
            style={{ fontSize: 13, padding: '9px 14px' }}
          />
        </div>

        {/* Loading state */}
        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px 0', gap: 12, color: 'var(--text-muted)' }}>
            <SparklesIcon style={{ width: 36, height: 36, color: 'var(--accent)', animation: 'pulse 1.5s infinite' }} />
            <div style={{ fontSize: 13, fontWeight: 500 }}>L'IA sta analizzando i tuoi diari, abitudini ed obiettivi…</div>
          </div>
        )}

        {/* Config Modal / Box */}
        {showConfig && (
          <div style={{
            background: 'var(--bg-base)', border: '1px solid var(--border)', borderRadius: 10,
            padding: 16, marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 12
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <KeyIcon style={{ width: 15, height: 15, color: 'var(--accent)' }} /> Configura Gemini API Key
              </div>
              <button className="icon-btn" onClick={() => setShowConfig(false)} style={{ width: 24, height: 24, border: 'none', background: 'transparent' }}>
                <XMarkIcon style={{ width: 14, height: 14 }} />
              </button>
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>
              Inserisci la tua chiave API Google Gemini. Verrà salvata in locale sul tuo browser.
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="password"
                className="text-input"
                placeholder="AIzaSy..."
                value={inputKey}
                onChange={e => setInputKey(e.target.value)}
                style={{ fontSize: 13, padding: '6px 12px' }}
              />
              <button className="btn btn-primary" onClick={saveKey} style={{ padding: '6px 14px', fontSize: 13, whiteSpace: 'nowrap' }}>
                Salva & Genera
              </button>
            </div>
          </div>
        )}

        {/* Error message */}
        {!loading && error && (
          <div style={{
            background: 'rgba(240, 107, 107, 0.1)', border: '1px solid rgba(240, 107, 107, 0.25)',
            borderRadius: 8, padding: '12px 16px', fontSize: 13, color: 'var(--danger)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12
          }}>
            <span>{error}</span>
            <button className="btn btn-ghost" onClick={() => { setInputKey(apiKey); setShowConfig(true) }} style={{ padding: '4px 10px', fontSize: 12 }}>
              {apiKey ? 'Modifica Key' : 'Inserisci Key'}
            </button>
          </div>
        )}

        {/* Empty initial state */}
        {!loading && !error && !insights && (
          <div style={{ textAlign: 'center', padding: '16px 0', color: 'var(--text-muted)', fontSize: 13 }}>
            Clicca su <strong>"Genera Consigli"</strong> per ricevere un'analisi guidata dall'IA sui tuoi ultimi dati di produttività e benessere.
          </div>
        )}

        {/* Insights Content */}
        {!loading && insights && (
          <div className="markdown-preview" style={{ padding: 0, fontSize: 14, lineHeight: 1.7 }}>
            {insights.split(/(?=###\s)/).map((section, idx) => {
              if (!section.trim()) return null
              const lines = section.trim().split('\n')
              const title = lines[0].replace(/^###\s*/, '')
              const body = lines.slice(1).join('\n').trim()

              return (
                <div key={idx} style={{
                  marginBottom: idx < 2 ? 16 : 0,
                  padding: '12px 16px',
                  borderRadius: 8,
                  background: 'var(--bg-base)',
                  border: '1px solid var(--border-subtle)'
                }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent)', marginBottom: 4 }}>
                    {title}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-primary)', whiteSpace: 'pre-line' }}>
                    {body}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
