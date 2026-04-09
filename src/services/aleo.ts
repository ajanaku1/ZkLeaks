const ENDPOINT = 'https://api.explorer.provable.com/v1'
const NETWORK = 'testnet'
const PROGRAM_ID = 'zkleaks_v2.aleo'

// Query a mapping value from the on-chain program
async function queryMapping(mapping: string, key: string): Promise<string | null> {
  try {
    const res = await fetch(
      `${ENDPOINT}/${NETWORK}/program/${PROGRAM_ID}/mapping/${mapping}/${key}`
    )
    if (!res.ok) return null
    const data = await res.json()
    return data === null ? null : String(data)
  } catch {
    return null
  }
}

// Parse an on-chain struct string into an object
function parseStruct(raw: string): Record<string, string> {
  const result: Record<string, string> = {}
  const inner = raw.replace(/^\{|\}$/g, '').trim()
  const pairs = inner.split(',').map(s => s.trim()).filter(Boolean)
  for (const pair of pairs) {
    const colonIdx = pair.indexOf(':')
    if (colonIdx === -1) continue
    const key = pair.slice(0, colonIdx).trim()
    const value = pair.slice(colonIdx + 1).trim()
    result[key] = value
  }
  return result
}

// Strip type suffix from Aleo values
function stripType(value: string): string {
  return value.replace(/(u8|u16|u32|u64|u128|i8|i16|i32|i64|i128|field|bool|address|group|scalar)$/, '')
}

// ============================================================
// ON-CHAIN DATA TYPES
// ============================================================

export interface OnChainOrg {
  orgId: string
  admin: string
  memberCount: number
  merkleRoot: string
  createdAt: number
  active: boolean
}

export interface OnChainReport {
  reportId: string
  orgId: string
  category: number
  severity: number
  contentHash: string
  nullifier: string
  proofMerkleRoot: string
  timestamp: number
  verified: boolean
}

// ============================================================
// CHAIN QUERIES
// ============================================================

export async function fetchOrganization(orgId: string): Promise<OnChainOrg | null> {
  const raw = await queryMapping('organizations', `${orgId}field`)
  if (!raw) return null
  const parsed = parseStruct(raw)
  return {
    orgId,
    admin: parsed.admin || '',
    memberCount: parseInt(stripType(parsed.member_count || '0')),
    merkleRoot: parsed.merkle_root || '',
    createdAt: parseInt(stripType(parsed.created_at || '0')),
    active: parsed.active === 'true',
  }
}

export async function orgExists(orgId: string): Promise<boolean> {
  const raw = await queryMapping('org_exists', `${orgId}field`)
  return raw === 'true'
}

export async function fetchReport(reportId: string): Promise<OnChainReport | null> {
  const raw = await queryMapping('reports', `${reportId}field`)
  if (!raw) return null
  const parsed = parseStruct(raw)
  return {
    reportId,
    orgId: parsed.org_id || '',
    category: parseInt(stripType(parsed.category || '0')),
    severity: parseInt(stripType(parsed.severity || '0')),
    contentHash: parsed.content_hash || '',
    nullifier: parsed.nullifier || '',
    proofMerkleRoot: parsed.proof_merkle_root || '',
    timestamp: parseInt(stripType(parsed.timestamp || '0')),
    verified: parsed.verified === 'true',
  }
}

export async function fetchOrgReportCount(orgId: string): Promise<number> {
  const raw = await queryMapping('org_report_count', `${orgId}field`)
  if (!raw) return 0
  return parseInt(stripType(raw))
}

export async function fetchGlobalReportCount(): Promise<number> {
  const raw = await queryMapping('report_counter', '0field')
  if (!raw) return 0
  return parseInt(stripType(raw))
}

export async function fetchBountyPool(orgId: string): Promise<number> {
  const raw = await queryMapping('bounty_pool', `${orgId}field`)
  if (!raw) return 0
  return parseInt(stripType(raw))
}

export async function isNullifierUsed(nullifier: string): Promise<boolean> {
  const raw = await queryMapping('nullifiers', `${nullifier}field`)
  return raw === 'true'
}

export async function fetchCorroborationCount(reportId: string): Promise<number> {
  const raw = await queryMapping('corroborations', `${reportId}field`)
  if (!raw) return 0
  return parseInt(stripType(raw))
}

export async function fetchProgramInfo(): Promise<boolean> {
  try {
    const res = await fetch(`${ENDPOINT}/${NETWORK}/program/${PROGRAM_ID}`)
    return res.ok
  } catch {
    return false
  }
}

// Fetch recent deploy/execute transactions for the program
export async function fetchProgramTransactions(): Promise<any[]> {
  try {
    const res = await fetch(
      `${ENDPOINT}/${NETWORK}/program/${PROGRAM_ID}/transactions?limit=50`
    )
    if (!res.ok) return []
    return await res.json()
  } catch {
    return []
  }
}

export async function fetchTransaction(txId: string): Promise<any | null> {
  try {
    const res = await fetch(`${ENDPOINT}/${NETWORK}/transaction/${txId}`)
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

export { PROGRAM_ID, ENDPOINT, NETWORK }
