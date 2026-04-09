export interface Organization {
  id: string
  name: string
  description: string
  memberCount: number
  merkleRoot: string
  memberCommitments: string[]
  createdAt: number
  admin: string
}

export interface ZKProof {
  proofId: string
  programId: string
  merkleRoot: string
  nullifierHash: string
  verificationResult: boolean
  generatedAt: number
}

export type Category = 'financial_fraud' | 'safety_violation' | 'corruption' | 'other'
export type Severity = 'low' | 'medium' | 'high' | 'critical'
export type ProofStatus = 'generating' | 'verified' | 'failed'

export interface Report {
  id: string
  organizationId: string
  title: string
  body: string
  category: Category
  severity: Severity
  proofStatus: ProofStatus
  proofData: ZKProof | null
  timestamp: number
  viewCount: number
  reportId?: string // on-chain report ID for corroboration
}

export function formatTimeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp
  const hours = Math.floor(diff / 3600000)
  if (hours < 1) return 'just now'
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export function getCategoryLabel(cat: Category): string {
  const labels: Record<Category, string> = {
    financial_fraud: 'Financial Fraud',
    safety_violation: 'Safety Violation',
    corruption: 'Corruption',
    other: 'Other',
  }
  return labels[cat]
}

export function getSeverityColor(sev: Severity): string {
  const colors: Record<Severity, string> = {
    critical: 'bg-danger',
    high: 'bg-orange-500',
    medium: 'bg-accent',
    low: 'bg-text-muted',
  }
  return colors[sev]
}
