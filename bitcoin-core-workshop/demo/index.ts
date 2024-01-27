interface RpcResponse <T = unknown> {
  error  : string | null
  id     : string
  result : T
}

const RPC_HOST = 'http://localhost:18443'
const RPC_USER = 'regtest'
const RPC_PASS = 'bitcoin'

const AUTH_STR = get_authstr(RPC_USER, RPC_PASS)

const JSON_RES = {
  headers : { 'Content-Type' : 'application/json' }
}

console.log('now serving on 127.0.0.1:3000 ...\n')

console.log('click here: http://127.0.0.1:3000/info')

Bun.serve({
  fetch(req) {
    console.log(`[ ${req.method} ]: ${req.url}`)
    return router(req)
  },
  error(error) {
    return new Response(`<pre>${error}\n${error.stack}</pre>`, {
      headers: {
        "Content-Type": "text/html",
      }
    })
  }
})

async function router (req : Request) {
  const url = new URL(req.url)

  switch (url.pathname) {

    case '/info' :
      const json = await rpc('getblockchaininfo')
      return new Response(stringify(json), JSON_RES)

    case '/ping':
      return new Response(stringify({ data : 'pong!' }), JSON_RES)

    default:
      return respond_404()
  }
}

async function rpc <T = unknown> (
  method  : string, 
  params ?: string[],
  wallet ?: string
) {
  // Define the optional wallet endpoint.
  const end = (wallet !== undefined) ? `/wallet/${wallet}` : ''
  // Define the full url.
  const url = `${RPC_HOST}${end}`
  // Define the request body.
  const body = {
    id      : crypto.randomUUID(),
    jsonrpc : 1.0,
    method,
    params  : params ?? [],
  }
  // Define the request options.
  const opt  = {
    method  : 'POST',
    body    : stringify(body),
    headers : { 
      'Authorization' : AUTH_STR,
      'Content-Type'  : 'application/json'
    }
  }

  console.log('[ RPC ]:', body)

  const res = await fetch(url, opt)

  if (!res.ok) {
    throw new Error(`${res.status}: ${res.statusText}`)
  }

  const json = await res.json() as RpcResponse

  if (json.error !== null) {
    throw new Error('rpc error: ' + json.error)
  }

  return json.result as T
}

function get_authstr (user : string, pass : string) {
  const str = `${user}:${pass}`
  const tkn = Buffer.from(str, 'utf-8').toString('base64')
  return 'Basic ' + tkn
}

function respond_404() {
  return new Response('404', { status : 404, statusText : 'not found' })
}

function stringify (obj : unknown) {
  return JSON.stringify(obj, null, 2)
}
