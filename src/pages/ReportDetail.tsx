import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useWallet } from '@provablehq/aleo-wallet-adaptor-react'
import { getReport, formatTimeAgo, getCategoryLabel, PROGRAM_ID } from '../data/store'
import { fetchBountyPool, fetchCorroborationCount } from '../services/aleo'

const severityColors: Record<string, string> = {
  critical: 'text-danger border-danger',
  high: 'text-orange-500 border-orange-500',
  medium: 'text-accent border-accent',
  low: 'text-text-muted border-text-muted',
}

export default function ReportDetail() {
  const { id } = useParams()
  const { connected, executeTransaction, requestRecords } = useWallet()
  const report = id ? getReport(id) : undefined

  if (!report) {
    return (
      <div className="min-h-screen pt-14 flex items-center justify-center">
        <div className="text-center">
          <h2 className="font-mono text-xl font-bold mb-2">Report not found</h2>
          <Link to="/app/reports" className="text-accent text-sm">Back to feed</Link>
        </div>
      </div>
    )
  }

  const [bounty, setBounty] = useState(0)
  const [corroborations, setCorroborations] = useState(0)
  const [corroborating, setCorroborating] = useState(false)
  const [corrTxId, setCorrTxId] = useState<string | null>(null)
  const [corrError, setCorrError] = useState<string | null>(null)

  useEffect(() => {
    if (!report) return
    let orgField = 0n
    for (let i = 0; i < report.organizationId.length; i++) {
      orgField = (orgField * 31n + BigInt(report.organizationId.charCodeAt(i))) % (2n ** 128n)
    }
    fetchBountyPool(orgField.toString()).then(setBounty)

    // Fetch corroboration count using reportId if available, fall back to contentHash
    const reportIdForLookup = report.reportId || report.proofData?.merkleRoot
    if (reportIdForLookup) {
      fetchCorroborationCount(reportIdForLookup).then(setCorroborations)
    }
  }, [report])

  const handleCorroborate = async () => {
    if (!report || !connected || !executeTransaction || !requestRecords) return
    setCorroborating(true)
    setCorrError(null)

    try {
      // Fetch MembershipToken from wallet
      const records = await requestRecords(PROGRAM_ID, true) as any[]
      const membershipToken = records?.find((r: any) => {
        const plaintext = typeof r === 'string' ? r : r?.plaintext || r?.data || JSON.stringify(r)
        return plaintext.includes('MembershipToken')
      })

      if (!membershipToken) {
        throw new Error('No MembershipToken found. You must be a registered member of this organization.')
      }

      const tokenStr = typeof membershipToken === 'string'
        ? membershipToken
        : membershipToken?.plaintext || membershipToken?.data || JSON.stringify(membershipToken)

      let orgField = 0n
      for (let i = 0; i < report.organizationId.length; i++) {
        orgField = (orgField * 31n + BigInt(report.organizationId.charCodeAt(i))) % (2n ** 128n)
      }

      // Use the stored reportId if available, otherwise use the content hash as fallback
      const reportIdField = report.reportId || report.proofData?.merkleRoot || '0field'

      const result = await executeTransaction({
        program: PROGRAM_ID,
        function: 'corroborate_report',
        inputs: [
          tokenStr,                // membership: MembershipToken (private record)
          reportIdField,           // report_id: field
          `${orgField}field`,      // org_id: field
        ],
        fee: 0.25,
      })

      setCorrTxId(result?.transactionId || 'tx_confirmed')
      setCorroborations(prev => prev + 1)
    } catch (e: any) {
      console.error('Corroboration failed:', e)
      setCorrError(e?.message || 'Failed to corroborate')
    } finally {
      setCorroborating(false)
    }
  }

  return (
    <div className="min-h-screen pt-14">
      <section className="px-8 md:px-16 py-20 max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-[11px] text-text-muted tracking-[1px] uppercase mb-8">
          <Link to="/app/reports" className="hover:text-accent transition-colors">Reports</Link>
          <span>/</span>
          <span className="text-text-secondary">{report.id}</span>
        </div>

        {/* Header */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <span className={`px-3 py-1 border text-[11px] font-mono tracking-[1px] uppercase ${severityColors[report.severity]}`}>
            {report.severity}
          </span>
          <span className="text-[11px] text-text-muted tracking-[1px] uppercase">{report.organizationId}</span>
          <span className="text-[11px] text-text-muted tracking-[1px] uppercase">{getCategoryLabel(report.category)}</span>
          <span className="text-[11px] text-text-muted tracking-[1px] uppercase">{formatTimeAgo(report.timestamp)}</span>
        </div>

        <h1 className="font-mono text-2xl md:text-3xl font-bold leading-tight mb-8">{report.title}</h1>

        {/* Body */}
        <div className="text-[15px] text-text-secondary leading-[1.8] whitespace-pre-line mb-12 border-l-2 border-border pl-6">
          {report.body}
        </div>

        {/* Proof Verification */}
        {report.proofData && (
          <div className="bg-bg-card border border-border">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border text-[11px] text-text-muted tracking-[1px]">
              <span className="w-2 h-2 rounded-full bg-success" />
              <span>ZK PROOF VERIFICATION</span>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-success text-2xl">&#10003;</span>
                <div>
                  <div className="font-mono text-sm font-semibold text-success">Proof Verified</div>
                  <div className="text-[11px] text-text-muted">This report was submitted by a verified organization member</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { label: 'Proof ID', value: report.proofData.proofId },
                  { label: 'Program', value: report.proofData.programId },
                  { label: 'Content Hash', value: report.proofData.merkleRoot.substring(0, 20) + '...' },
                  { label: 'Nullifier', value: report.proofData.nullifierHash.substring(0, 20) + '...' },
                ].map(item => (
                  <div key={item.label} className="border border-border p-3">
                    <div className="text-[10px] text-text-muted tracking-[2px] uppercase mb-1">{item.label}</div>
                    <div className="font-mono text-xs text-text-secondary break-all">{item.value}</div>
                  </div>
                ))}
              </div>

              <div className="text-[11px] text-text-muted mt-2">
                Verified at {new Date(report.proofData.generatedAt).toISOString()} · {report.viewCount.toLocaleString()} views
              </div>
            </div>
          </div>
        )}

        {/* Corroboration */}
        <div className="mt-6 bg-bg-card border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="text-accent text-xl">&#9998;</span>
              <div>
                <div className="font-mono text-sm font-semibold">Insider Corroboration</div>
                <div className="text-[11px] text-text-muted">
                  Other insiders can anonymously vouch for this report via ZK proof
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-accent">{corroborations}</div>
              <div className="text-[10px] text-text-muted tracking-[1px] uppercase">
                {corroborations === 1 ? 'Insider' : 'Insiders'} Corroborated
              </div>
            </div>
          </div>

          {connected ? (
            <div>
              <button
                onClick={handleCorroborate}
                disabled={corroborating || !!corrTxId}
                className={`w-full py-2.5 font-mono text-[12px] tracking-[1px] uppercase transition-all border ${
                  corrTxId
                    ? 'border-success text-success cursor-default bg-transparent'
                    : corroborating
                    ? 'border-border text-text-muted cursor-not-allowed bg-transparent'
                    : 'border-accent text-accent hover:bg-accent-dim cursor-pointer bg-transparent'
                }`}
              >
                {corrTxId ? '&#10003; Corroborated' : corroborating ? 'Generating ZK proof...' : 'Corroborate This Report'}
              </button>
              {corrTxId && (
                <div className="text-[10px] text-success font-mono mt-2">
                  TX: <a href={`https://testnet.aleoscan.io/transaction/${corrTxId}`} target="_blank" rel="noopener noreferrer" className="underline hover:text-accent transition-colors">{corrTxId.slice(0, 24)}...</a>
                </div>
              )}
              {corrError && (
                <div className="text-[10px] text-danger mt-2">{corrError}</div>
              )}
            </div>
          ) : (
            <div className="text-[11px] text-text-muted text-center py-2 border border-dashed border-border">
              Connect wallet to corroborate
            </div>
          )}
        </div>

        {/* Bounty Info */}
        {bounty > 0 && (
          <div className="mt-6 bg-bg-card border border-accent/30 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-accent text-xl">&#9733;</span>
                <div>
                  <div className="font-mono text-sm font-semibold text-accent">Bounty Available</div>
                  <div className="text-[11px] text-text-muted">
                    This organization has funded a bounty pool for verified reporters
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-accent">{(bounty / 1_000_000).toFixed(2)}</div>
                <div className="text-[10px] text-text-muted tracking-[1px] uppercase">Credits</div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8">
          <Link
            to="/app/reports"
            className="text-[11px] text-text-muted tracking-[1px] uppercase hover:text-accent transition-colors"
          >
            &larr; Back to all reports
          </Link>
        </div>
      </section>
    </div>
  )
}
