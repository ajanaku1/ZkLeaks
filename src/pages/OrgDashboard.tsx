import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useWallet } from '@provablehq/aleo-wallet-adaptor-react'
import { getOrganizationReports, PROGRAM_ID } from '../data/store'
import { fetchBountyPool } from '../services/aleo'
import ReportCard from '../components/ReportCard'

export default function OrgDashboard() {
  const { id } = useParams()
  const { connected, executeTransaction } = useWallet()

  const [addingMember, setAddingMember] = useState(false)
  const [memberTxId, setMemberTxId] = useState<string | null>(null)
  const [memberError, setMemberError] = useState<string | null>(null)
  const [memberSecret, setMemberSecret] = useState<string | null>(null)
  const [bountyAmount, setBountyAmount] = useState('')
  const [bountyPool, setBountyPool] = useState(0)
  const [loadingBounty, setLoadingBounty] = useState(true)
  const [fundingBounty, setFundingBounty] = useState(false)
  const [bountyTxId, setBountyTxId] = useState<string | null>(null)
  const [bountyError, setBountyError] = useState<string | null>(null)

  // Fetch on-chain bounty pool
  useEffect(() => {
    if (!id) return
    setLoadingBounty(true)
    let orgField = 0n
    for (let i = 0; i < id.length; i++) {
      orgField = (orgField * 31n + BigInt(id.charCodeAt(i))) % (2n ** 128n)
    }
    fetchBountyPool(orgField.toString()).then(amount => {
      setBountyPool(amount)
      setLoadingBounty(false)
    })
  }, [id])

  if (!id) {
    return (
      <div className="min-h-screen pt-14 flex items-center justify-center">
        <div className="text-center">
          <h2 className="font-mono text-xl font-bold mb-2">No organization selected</h2>
          <Link to="/app" className="text-accent text-sm">Back to dashboard</Link>
        </div>
      </div>
    )
  }

  const orgReports = getOrganizationReports(id)

  const handleFundBounty = async () => {
    if (!bountyAmount || !connected || !executeTransaction) return

    const amount = Math.floor(parseFloat(bountyAmount) * 1_000_000) // Convert to microcredits
    if (amount <= 0) return

    setFundingBounty(true)
    setBountyError(null)
    setBountyTxId(null)

    try {
      let orgField = 0n
      for (let i = 0; i < id.length; i++) {
        orgField = (orgField * 31n + BigInt(id.charCodeAt(i))) % (2n ** 128n)
      }

      const result = await executeTransaction({
        program: PROGRAM_ID,
        function: 'fund_bounty',
        inputs: [
          `${orgField}field`,
          `${amount}u64`,
        ],
        fee: 0.25,
      })

      setBountyTxId(result?.transactionId || 'tx_pending')
      setBountyPool(prev => prev + amount)
      setBountyAmount('')
    } catch (e: any) {
      console.error('Fund bounty failed:', e)
      setBountyError(e?.message || 'Transaction failed')
    } finally {
      setFundingBounty(false)
    }
  }

  const handleAddMember = async () => {
    if (!connected || !executeTransaction) return
    setAddingMember(true)
    setMemberError(null)
    setMemberTxId(null)
    setMemberSecret(null)

    try {
      let orgField = 0n
      for (let i = 0; i < id.length; i++) {
        orgField = (orgField * 31n + BigInt(id.charCodeAt(i))) % (2n ** 128n)
      }

      // Generate a random member secret (private — only the member knows this)
      const secret = BigInt(Math.floor(Math.random() * 2 ** 48))
      // New merkle root (simplified — in production, compute from the tree)
      const newMerkleRoot = BigInt(Math.floor(Math.random() * 2 ** 48))

      const result = await executeTransaction({
        program: PROGRAM_ID,
        function: 'add_member',
        inputs: [
          `${orgField}field`,
          `${secret}field`,
          `${newMerkleRoot}field`,
        ],
        fee: 0.25,
      })

      setMemberTxId(result?.transactionId || 'tx_confirmed')
      setMemberSecret(secret.toString())
    } catch (e: any) {
      console.error('Add member failed:', e)
      setMemberError(e?.message || 'Transaction failed. Are you the org admin?')
    } finally {
      setAddingMember(false)
    }
  }

  const formatCredits = (microcredits: number): string => {
    if (microcredits === 0) return '0'
    return (microcredits / 1_000_000).toFixed(2)
  }

  return (
    <div className="min-h-screen pt-14">
      <section className="px-8 md:px-16 py-20 bg-bg-secondary border-t border-border">
        <div className="text-[11px] text-text-muted tracking-[3px] uppercase mb-3">// ADMIN PANEL</div>
        <h2 className="font-mono text-[32px] font-bold mb-8">Organization Dashboard</h2>

        {/* Org selector */}
        <div className="flex gap-2 mb-8">
          <Link
            to="/app/org/register"
            className="px-4 py-1.5 border border-dashed border-border text-text-muted font-mono text-[11px] tracking-[1px] uppercase hover:border-accent hover:text-accent transition-all"
          >
            + Register New
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-0.5">
          {/* Sidebar */}
          <div className="space-y-0.5">
            <div className="bg-bg-card border border-border p-6">
              <div className="text-lg font-bold mb-1">Org: {id}</div>
              <div className="text-xs text-text-muted mb-6">
                On-chain organization
              </div>

              {[
                { label: 'Reports Filed', value: orgReports.length.toString() },
                { label: 'Status', value: 'Active', green: true },
              ].map(row => (
                <div key={row.label} className="flex justify-between py-3 border-t border-border text-xs">
                  <span className="text-text-muted">{row.label}</span>
                  <span className={`font-semibold ${row.green ? 'text-success' : ''}`}>
                    {row.value}
                  </span>
                </div>
              ))}
            </div>

            {/* Bounty Pool */}
            <div className="bg-bg-card border border-border p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-accent text-lg">&#9733;</span>
                <h3 className="text-sm font-semibold">Bounty Pool</h3>
              </div>

              <div className="text-center py-4 mb-4 border border-border bg-bg-tertiary">
                <div className="text-[28px] font-bold text-accent">
                  {loadingBounty ? '...' : formatCredits(bountyPool)}
                </div>
                <div className="text-[10px] text-text-muted tracking-[2px] uppercase mt-1">
                  Aleo Credits
                </div>
              </div>

              <p className="text-[11px] text-text-muted mb-4 leading-relaxed">
                Fund this pool to reward verified whistleblowers. Credits are distributed via <span className="text-text-secondary">credits.aleo/transfer_public</span> to anonymous reporters.
              </p>

              {connected ? (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={bountyAmount}
                      onChange={e => setBountyAmount(e.target.value)}
                      placeholder="Amount in credits"
                      className="flex-1 bg-bg-tertiary border border-border text-text-primary font-mono text-[12px] px-3 py-2 focus:border-accent transition-all placeholder:text-text-muted"
                    />
                    <button
                      onClick={handleFundBounty}
                      disabled={fundingBounty || !bountyAmount}
                      className={`px-4 py-2 font-mono text-[11px] tracking-[1px] uppercase border-none transition-all ${
                        fundingBounty || !bountyAmount
                          ? 'bg-bg-tertiary text-text-muted cursor-not-allowed'
                          : 'bg-accent text-bg-primary cursor-pointer hover:shadow-[0_0_20px_#d4a01744]'
                      }`}
                    >
                      {fundingBounty ? 'Funding...' : 'Fund'}
                    </button>
                  </div>

                  {bountyTxId && (
                    <div className="text-[10px] text-success font-mono bg-success/10 border border-success/20 px-3 py-2">
                      Funded! TX: <a href={`https://testnet.aleoscan.io/transaction/${bountyTxId}`} target="_blank" rel="noopener noreferrer" className="underline hover:text-accent transition-colors">{bountyTxId.slice(0, 20)}...</a>
                    </div>
                  )}
                  {bountyError && (
                    <div className="text-[10px] text-danger font-mono bg-danger/10 border border-danger/20 px-3 py-2">
                      {bountyError}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-[11px] text-text-muted text-center py-2 border border-dashed border-border">
                  Connect wallet to fund bounty
                </div>
              )}
            </div>
          </div>

          {/* Members */}
          <div className="bg-bg-card border border-border p-6">
            <h3 className="text-sm font-semibold mb-4">Members</h3>

            <p className="text-[11px] text-text-muted mb-4">
              Add members on-chain. Each member receives a MembershipToken record in their wallet that allows them to submit anonymous reports.
            </p>

            {connected ? (
              <div className="mt-4 space-y-2">
                <button
                  onClick={handleAddMember}
                  disabled={addingMember}
                  className={`w-full py-2.5 border font-mono text-xs tracking-[1px] uppercase transition-all bg-transparent ${
                    addingMember
                    ? 'border-border text-text-muted cursor-not-allowed'
                    : 'border-dashed border-border text-text-muted hover:border-accent hover:text-accent cursor-pointer'
                  }`}
                >
                  {addingMember ? 'Adding member...' : '+ Add Member (On-Chain)'}
                </button>
                {memberTxId && (
                  <div className="text-[10px] font-mono space-y-2">
                    <div className="text-success">
                      TX: <a href={`https://testnet.aleoscan.io/transaction/${memberTxId}`} target="_blank" rel="noopener noreferrer" className="underline hover:text-accent transition-colors">{memberTxId.slice(0, 24)}...</a>
                    </div>
                    <div className="text-text-muted">MembershipToken record sent to your wallet.</div>
                  </div>
                )}
                {memberSecret && (
                  <div className="bg-accent/10 border border-accent/30 px-3 py-3 space-y-1">
                    <div className="text-[11px] font-semibold text-accent tracking-[1px] uppercase">Member Secret</div>
                    <div className="font-mono text-[12px] text-text-primary break-all select-all bg-bg-tertiary px-2 py-1.5 border border-border">
                      {memberSecret}
                    </div>
                    <div className="text-[10px] text-danger font-semibold">
                      Save this secret -- you need it to submit reports. It cannot be recovered.
                    </div>
                  </div>
                )}
                {memberError && (
                  <div className="text-[10px] text-danger">{memberError}</div>
                )}
              </div>
            ) : (
              <div className="mt-4 text-[11px] text-text-muted text-center py-2 border border-dashed border-border">
                Connect wallet to add members
              </div>
            )}
          </div>
        </div>

        {/* Org reports */}
        {orgReports.length > 0 && (
          <div className="mt-12">
            <h3 className="font-mono text-lg font-bold mb-4">Reports for this organization</h3>
            <div className="flex flex-col gap-0.5">
              {orgReports.map(report => (
                <ReportCard key={report.id} report={report} />
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
