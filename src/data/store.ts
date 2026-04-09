import {
  fetchGlobalReportCount,
  fetchProgramInfo,
  PROGRAM_ID,
} from '../services/aleo'
import { fetchAllContent, type ReportContent } from '../services/content'
import {
  type Organization,
  type Report,
  type Category,
  type Severity,
  formatTimeAgo,
  getCategoryLabel,
  getSeverityColor,
} from './types'

export type { Organization, Report, Category, Severity }
export { formatTimeAgo, getCategoryLabel, getSeverityColor, PROGRAM_ID }

const CATEGORY_LABELS: Category[] = ['financial_fraud', 'safety_violation', 'corruption', 'other']
const SEVERITY_LABELS: Severity[] = ['low', 'medium', 'high', 'critical']

// Convert an IndexedDB content record to a Report for display
function contentToReport(c: ReportContent): Report {
  return {
    id: `chain-${c.contentHash.slice(0, 12)}`,
    organizationId: c.orgId,
    title: c.title,
    body: c.body,
    category: CATEGORY_LABELS[c.category] || 'other',
    severity: SEVERITY_LABELS[c.severity] || 'medium',
    proofStatus: 'verified',
    proofData: {
      proofId: c.txId.slice(0, 16),
      programId: PROGRAM_ID,
      merkleRoot: c.contentHash,
      nullifierHash: c.contentHash, // simplified for display
      verificationResult: true,
      generatedAt: c.submittedAt,
    },
    timestamp: c.submittedAt,
    viewCount: 0,
    reportId: c.reportId,
  }
}

// Get all organizations — empty until on-chain org reading is implemented
export function getAllOrganizations(): Organization[] {
  return []
}

export function getOrganization(_id: string): Organization | undefined {
  return undefined
}

// Get all reports: only on-chain submitted (from IndexedDB content store)
export async function getAllReportsAsync(): Promise<Report[]> {
  const onChainContent = await fetchAllContent()
  return onChainContent.map(contentToReport)
}

// Synchronous version for components that can't await (uses cached data)
let _cachedReports: Report[] | null = null
export function getAllReports(): Report[] {
  // Trigger async refresh in background
  getAllReportsAsync().then(r => { _cachedReports = r })
  return _cachedReports || []
}

// Force refresh the cache
export async function refreshReports(): Promise<Report[]> {
  _cachedReports = await getAllReportsAsync()
  return _cachedReports
}

// Get reports for a specific org
export async function getOrganizationReportsAsync(orgId: string): Promise<Report[]> {
  const all = await getAllReportsAsync()
  return all.filter(r => r.organizationId === orgId)
}

export function getOrganizationReports(orgId: string): Report[] {
  const all = getAllReports()
  return all.filter(r => r.organizationId === orgId)
}

// Get a single report by ID
export async function getReportAsync(id: string): Promise<Report | undefined> {
  const all = await getAllReportsAsync()
  return all.find(r => r.id === id)
}

export function getReport(id: string): Report | undefined {
  const all = getAllReports()
  return all.find(r => r.id === id)
}

// Network stats from on-chain data
export async function getNetworkStats(): Promise<{
  totalReports: number
  onChainReports: number
  totalOrgs: number
  isDeployed: boolean
}> {
  const [onChainCount, deployed, content] = await Promise.all([
    fetchGlobalReportCount(),
    fetchProgramInfo(),
    fetchAllContent(),
  ])

  return {
    totalReports: content.length + onChainCount,
    onChainReports: onChainCount + content.length,
    totalOrgs: 0,
    isDeployed: deployed,
  }
}
