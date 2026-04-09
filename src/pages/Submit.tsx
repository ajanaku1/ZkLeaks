import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWallet } from '@provablehq/aleo-wallet-adaptor-react'
import { type Category, type Severity, PROGRAM_ID } from '../data/store'
import { storeContent, computeContentHash } from '../services/content'
import ProofAnimation from '../components/ProofAnimation'

type Step = 'form' | 'proving' | 'success'

// Category and severity mappings to u8
const CATEGORY_MAP: Record<Category, number> = {
  financial_fraud: 0,
  safety_violation: 1,
  corruption: 2,
  other: 3,
}

const SEVERITY_MAP: Record<Severity, number> = {
  low: 0,
  medium: 1,
  high: 2,
  critical: 3,
}

export default function Submit() {
  const navigate = useNavigate()
  const { connected, executeTransaction, requestRecords } = useWallet()
  const [step, setStep] = useState<Step>('form')
  const [orgId, setOrgId] = useState('')
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [category, setCategory] = useState<Category | ''>('')
  const [severity, setSeverity] = useState<Severity>('medium')
  const [proofStatus, setProofStatus] = useState<'idle' | 'proving' | 'verified' | 'failed'>('idle')
  const [proofError, setProofError] = useState<string | null>(null)
  const [txId, setTxId] = useState<string | null>(null)

  const canSubmit = orgId && title && body && category && connected

  const handleSubmit = useCallback(async () => {
    if (!canSubmit || !category) return

    setStep('proving')
    setProofStatus('proving')
    setProofError(null)

    try {
      // Fetch MembershipToken from wallet
      const records = await requestRecords(PROGRAM_ID, true) as any[]
      const membershipToken = records?.find((r: any) => {
        const plaintext = typeof r === 'string' ? r : r?.plaintext || r?.data || JSON.stringify(r)
        return plaintext.includes('MembershipToken')
      })

      if (!membershipToken) {
        throw new Error('No MembershipToken found in your wallet. Ask an org admin to add you as a member first (Organization Dashboard → Add Member).')
      }

      // Get the record plaintext string
      const tokenStr = typeof membershipToken === 'string'
        ? membershipToken
        : membershipToken?.plaintext || membershipToken?.data || JSON.stringify(membershipToken)

      // Deterministic content hash from report text (matches on-chain)
      const contentHash = computeContentHash(title, body)

      // Random topic nonce for nullifier uniqueness
      const topicNonce = `${BigInt(Math.floor(Math.random() * 2 ** 48))}field`

      // Org ID as field
      let orgField = 0n
      for (let i = 0; i < orgId.length; i++) {
        orgField = (orgField * 31n + BigInt(orgId.charCodeAt(i))) % (2n ** 128n)
      }

      // Build the Aleo transaction — MembershipToken record is first input
      const txOptions = {
        program: PROGRAM_ID,
        function: 'submit_report',
        inputs: [
          tokenStr,                                     // membership: MembershipToken (private record)
          `${orgField}field`,                           // org_id
          `${CATEGORY_MAP[category]}u8`,                // category
          `${SEVERITY_MAP[severity]}u8`,                // severity
          contentHash,                                  // content_hash
          topicNonce,                                   // topic_nonce
        ],
        fee: 0.5,
      }

      const onSuccess = async (transactionId: string) => {
        setTxId(transactionId)
        setProofStatus('verified')
        setStep('success')

        // Store encrypted report content in IndexedDB (IPFS-ready)
        // The on-chain content_hash is the lookup key
        await storeContent({
          contentHash,
          title,
          body,
          submittedAt: Date.now(),
          txId: transactionId,
          orgId,
          category: CATEGORY_MAP[category],
          severity: SEVERITY_MAP[severity],
        })

        setTimeout(() => navigate('/app/reports'), 3000)
      }

      if (executeTransaction) {
        const result = await executeTransaction(txOptions)
        await onSuccess(result?.transactionId || 'tx_pending')
      } else {
        throw new Error('Wallet does not support transaction execution')
      }
    } catch (e: any) {
      console.error('Proof generation failed:', e)
      setProofError(e?.message || 'Transaction failed')
      setProofStatus('failed')
    }
  }, [canSubmit, category, orgId, title, body, severity, navigate, executeTransaction])

  const handleRetry = () => {
    setStep('form')
    setProofStatus('idle')
    setProofError(null)
    setTxId(null)
  }

  const severities: Severity[] = ['low', 'medium', 'high', 'critical']

  return (
    <div className="min-h-screen pt-14">
      <section className="px-8 md:px-16 py-20 bg-bg-secondary border-t border-border">
        <div className="text-[11px] text-text-muted tracking-[3px] uppercase mb-3">// SECURE SUBMISSION</div>
        <h2 className="font-mono text-[32px] font-bold mb-12">File a report</h2>

        <div className="bg-bg-primary border border-border max-w-[720px] mx-auto">
          {/* Terminal header */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-border text-[11px] text-text-muted tracking-[1px]">
            <span className={`w-2 h-2 rounded-full ${step === 'form' ? 'bg-accent' : proofStatus === 'failed' ? 'bg-danger' : 'bg-success'}`} />
            <span className={`w-2 h-2 rounded-full ${step === 'proving' ? 'bg-accent' : step === 'success' ? 'bg-success' : 'bg-text-muted'}`} />
            <span className={`w-2 h-2 rounded-full ${step === 'success' ? 'bg-success' : 'bg-text-muted'}`} />
            <span className="ml-2">
              {step === 'form' && 'zkleaks://submit — ENCRYPTED SESSION'}
              {step === 'proving' && 'zkleaks://proving — GENERATING ZK PROOF'}
              {step === 'success' && 'zkleaks://submit — PROOF VERIFIED'}
            </span>
          </div>

          {/* Form */}
          {step === 'form' && (
            <div className="p-6 space-y-6">
              {!connected && (
                <div className="flex items-start gap-3 p-4 bg-danger/10 border border-danger/30 text-xs text-danger">
                  <span className="text-base shrink-0">&#9888;</span>
                  <span>Connect your Aleo wallet to submit a report. Your wallet generates the ZK proof that verifies your membership without revealing your identity.</span>
                </div>
              )}

              <div>
                <label className="block text-[11px] text-text-muted tracking-[2px] uppercase mb-2">Organization ID</label>
                <input
                  type="text"
                  value={orgId}
                  onChange={e => setOrgId(e.target.value)}
                  placeholder="Enter organization name or ID..."
                  className="w-full bg-bg-tertiary border border-border text-text-primary font-mono text-[13px] p-3 focus:border-accent focus:shadow-[0_0_0_1px_#d4a01733] transition-all placeholder:text-text-muted"
                />
                <div className="text-[10px] text-text-muted mt-1">Enter the same org name used during registration</div>
              </div>

              <div>
                <label className="block text-[11px] text-text-muted tracking-[2px] uppercase mb-2">Report Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Brief description of the disclosure..."
                  className="w-full bg-bg-tertiary border border-border text-text-primary font-mono text-[13px] p-3 focus:border-accent focus:shadow-[0_0_0_1px_#d4a01733] transition-all placeholder:text-text-muted"
                />
              </div>

              <div>
                <label className="block text-[11px] text-text-muted tracking-[2px] uppercase mb-2">Report Body</label>
                <textarea
                  value={body}
                  onChange={e => setBody(e.target.value)}
                  placeholder="Describe what you've witnessed. Be specific. Include dates, names, and evidence where possible."
                  className="w-full bg-bg-tertiary border border-border text-text-primary font-mono text-[13px] p-3 min-h-[120px] resize-y focus:border-accent focus:shadow-[0_0_0_1px_#d4a01733] transition-all placeholder:text-text-muted"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] text-text-muted tracking-[2px] uppercase mb-2">Category</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as Category)}
                    className="w-full bg-bg-tertiary border border-border text-text-primary font-mono text-[13px] p-3 focus:border-accent focus:shadow-[0_0_0_1px_#d4a01733] transition-all appearance-none cursor-pointer"
                  >
                    <option value="">Select category...</option>
                    <option value="financial_fraud">Financial Fraud</option>
                    <option value="safety_violation">Safety Violation</option>
                    <option value="corruption">Corruption</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] text-text-muted tracking-[2px] uppercase mb-2">Severity</label>
                  <div className="flex gap-2">
                    {severities.map(sev => (
                      <button
                        key={sev}
                        onClick={() => setSeverity(sev)}
                        className={`flex-1 py-2 px-3 border font-mono text-[11px] tracking-[1px] uppercase transition-all cursor-pointer ${
                          severity === sev
                            ? sev === 'critical'
                              ? 'border-danger text-danger'
                              : 'border-accent text-accent bg-accent-dim'
                            : 'border-border text-text-secondary hover:border-accent hover:text-accent'
                        }`}
                      >
                        {sev === 'critical' ? 'Crit' : sev === 'medium' ? 'Med' : sev.charAt(0).toUpperCase() + sev.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={!canSubmit}
                className={`w-full py-3.5 font-mono text-[13px] font-semibold tracking-[1px] uppercase transition-all border-none ${
                  canSubmit
                    ? 'bg-accent text-bg-primary hover:shadow-[0_0_30px_#d4a01766] hover:-translate-y-0.5 cursor-pointer'
                    : 'bg-bg-tertiary text-text-muted cursor-not-allowed'
                }`}
              >
                {connected ? 'GENERATE PROOF & SUBMIT' : 'CONNECT WALLET TO SUBMIT'}
              </button>

              <div className="flex items-start gap-3 p-4 bg-accent-dim border border-border text-xs text-text-secondary">
                <span className="text-accent text-base shrink-0">&#9919;</span>
                <span>Your identity is cryptographically protected. This submission generates a zero-knowledge proof via your Aleo wallet — no personal data leaves your device.</span>
              </div>
            </div>
          )}

          {/* Proving */}
          {step === 'proving' && (
            <div className="p-6">
              <ProofAnimation
                onComplete={() => {}}
                status={proofStatus}
                error={proofError}
                txId={txId}
              />
              {proofStatus === 'failed' && (
                <button
                  onClick={handleRetry}
                  className="mt-4 w-full py-3 font-mono text-[13px] tracking-[1px] uppercase border border-accent text-accent hover:bg-accent-dim transition-colors cursor-pointer bg-transparent"
                >
                  RETRY SUBMISSION
                </button>
              )}
            </div>
          )}

          {/* Success */}
          {step === 'success' && (
            <div className="p-12 text-center">
              <div className="text-4xl text-success mb-4">&#10003;</div>
              <h3 className="font-mono text-lg font-bold mb-2">Report Submitted</h3>
              <p className="text-sm text-text-secondary mb-4">Your report has been published with a verified ZK proof.</p>
              {txId && (
                <a
                  href={`https://testnet.aleoscan.io/transaction/${txId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-[11px] text-text-muted bg-bg-tertiary border border-border px-4 py-2 inline-block hover:text-accent hover:border-accent transition-colors"
                >
                  TX: {txId.slice(0, 20)}...
                </a>
              )}
              <p className="text-xs text-text-muted mt-4">Redirecting to feed...</p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
