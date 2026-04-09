// Off-chain encrypted content store for report bodies.
// Content is indexed by its on-chain content_hash.
//
// Architecture:
// 1. Reporter encrypts report content client-side
// 2. Encrypted blob is uploaded to IPFS (or any content-addressed store)
// 3. The content_hash (deterministic from plaintext) is stored on-chain via submit_report
// 4. Anyone can fetch the encrypted content by content_hash and decrypt if authorized
//
// For the hackathon demo, we use an in-memory + IndexedDB store.
// In production, swap uploadContent/fetchContent for Pinata/IPFS calls.

const DB_NAME = 'zkleaks_content'
const STORE_NAME = 'reports'

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1)
    req.onupgradeneeded = () => {
      req.result.createObjectStore(STORE_NAME, { keyPath: 'contentHash' })
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

export interface ReportContent {
  contentHash: string
  title: string
  body: string
  encryptedBlob?: string // For future IPFS: the encrypted payload
  submittedAt: number
  txId: string
  orgId: string
  category: number
  severity: number
  reportId?: string // on-chain report ID (BHP256 hash of nullifier + content_hash)
}

// Store encrypted report content (indexed by on-chain content_hash)
export async function storeContent(content: ReportContent): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    tx.objectStore(STORE_NAME).put(content)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

// Fetch report content by content_hash
export async function fetchContent(contentHash: string): Promise<ReportContent | null> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly')
    const req = tx.objectStore(STORE_NAME).get(contentHash)
    req.onsuccess = () => resolve(req.result || null)
    req.onerror = () => reject(req.error)
  })
}

// Fetch all stored report content
export async function fetchAllContent(): Promise<ReportContent[]> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly')
    const req = tx.objectStore(STORE_NAME).getAll()
    req.onsuccess = () => resolve(req.result || [])
    req.onerror = () => reject(req.error)
  })
}

// Deterministic content hash (matches the on-chain hash computation)
export function computeContentHash(title: string, body: string): string {
  let hash = 0n
  const text = title + body
  for (let i = 0; i < text.length; i++) {
    hash = (hash * 31n + BigInt(text.charCodeAt(i))) % (2n ** 128n)
  }
  return `${hash}field`
}
