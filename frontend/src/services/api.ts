const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'

export async function request(path: string, opts: RequestInit = {}) {
  const res = await fetch(`${API_URL}${path}`, { ...opts, credentials: 'include', headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) } })
  const json = await res.json().catch(() => null)
  if (!res.ok) throw new Error(json?.error || res.statusText)
  return json
}

export function get(path: string) { return request(path, { method: 'GET' }) }
export function post(path: string, body: any) { return request(path, { method: 'POST', body: JSON.stringify(body) }) }
export function put(path: string, body: any) { return request(path, { method: 'PUT', body: JSON.stringify(body) }) }
export function del(path: string) { return request(path, { method: 'DELETE' }) }
