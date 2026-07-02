import { PublicClientApplication } from '@azure/msal-browser'

const SCOPES = ['User.Read', 'Calendars.Read', 'Calendars.ReadWrite']
let appCache = null
let keyCache = ''

function authority(cfg){
  const tenant = cfg?.tenantId || 'common'
  return `https://login.microsoftonline.com/${tenant}`
}
function msalApp(cfg){
  if(!cfg?.clientId) throw new Error('Client ID em falta')
  const key = `${cfg.clientId}|${cfg.tenantId || 'common'}|${window.location.origin}`
  if(appCache && keyCache === key) return appCache
  keyCache = key
  appCache = new PublicClientApplication({
    auth: { clientId: cfg.clientId, authority: authority(cfg), redirectUri: window.location.origin + window.location.pathname },
    cache: { cacheLocation: 'localStorage', storeAuthStateInCookie: false }
  })
  return appCache
}
async function token(cfg){
  const app = msalApp(cfg)
  await app.initialize()
  let accounts = app.getAllAccounts()
  if(!accounts.length) await app.loginPopup({ scopes: SCOPES })
  accounts = app.getAllAccounts()
  const account = accounts[0]
  try {
    const r = await app.acquireTokenSilent({ scopes: SCOPES, account })
    return r.accessToken
  } catch {
    const r = await app.acquireTokenPopup({ scopes: SCOPES, account })
    return r.accessToken
  }
}
export async function loginOutlook(cfg){
  const app = msalApp(cfg)
  await app.initialize()
  const r = await app.loginPopup({ scopes: SCOPES })
  return r.account
}
export async function logoutOutlook(cfg){
  const app = msalApp(cfg)
  await app.initialize()
  const account = app.getAllAccounts()[0]
  if(account) await app.logoutPopup({ account })
}
export async function graph(cfg, path, options={}){
  const accessToken = await token(cfg)
  const res = await fetch(`https://graph.microsoft.com/v1.0${path}`, {
    ...options,
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json', ...(options.headers || {}) }
  })
  if(!res.ok){
    const msg = await res.text()
    throw new Error(`${res.status} ${msg}`)
  }
  if(res.status === 204) return null
  return res.json()
}
export async function getGraphUser(cfg){ return graph(cfg, '/me') }
export async function getCalendarEvents(cfg, start, end){
  const s = encodeURIComponent(`${start}T00:00:00`)
  const e = encodeURIComponent(`${end}T23:59:59`)
  const data = await graph(cfg, `/me/calendarView?startDateTime=${s}&endDateTime=${e}&$orderby=start/dateTime&$top=100`)
  return data.value || []
}
export async function createCalendarEvent(cfg, item){
  const event = item.allDay ? {
    subject: item.subject,
    isAllDay: true,
    start: { dateTime: `${item.date}T00:00:00`, timeZone: 'Europe/Lisbon' },
    end: { dateTime: `${item.date}T23:59:00`, timeZone: 'Europe/Lisbon' },
    body: { contentType: 'text', content: item.body || '' },
    categories: ['IP_RJP']
  } : {
    subject: item.subject,
    start: { dateTime: `${item.date}T${item.start}:00`, timeZone: 'Europe/Lisbon' },
    end: { dateTime: `${item.date}T${item.end}:00`, timeZone: 'Europe/Lisbon' },
    body: { contentType: 'text', content: item.body || '' },
    categories: ['IP_RJP']
  }
  return graph(cfg, '/me/events', { method: 'POST', body: JSON.stringify(event) })
}
