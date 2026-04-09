import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWallet } from '@provablehq/aleo-wallet-adaptor-react'
import { PROGRAM_ID } from '../data/store'

type Step = 'form' | 'registering' | 'success'

export default function RegisterOrg() {
  const navigate = useNavigate()
  const { connected, executeTransaction } = useWallet()
  const [step, setStep] = useState<Step>('form')
  const [orgName, setOrgName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [txId, setTxId] = useState<string | null>(null)
  const [orgFieldDisplay, setOrgFieldDisplay] = useState<string | null>(null)

  const canSubmit = orgName && connected

  const handleRegister = useCallback(async () => {
    if (!canSubmit) return

    setStep('registering')
    setError(null)

    try {
      // Deterministic org ID from name
      let orgField = 0n
      for (let i = 0; i < orgName.length; i++) {
        orgField = (orgField * 31n + BigInt(orgName.charCodeAt(i))) % (2n ** 128n)
      }

      // Initial merkle root (empty tree)
      const initialMerkleRoot = `${BigInt(Math.floor(Math.random() * 2 ** 48))}field`

      if (executeTransaction) {
        const result = await executeTransaction({
          program: PROGRAM_ID,
          function: 'register_org',
          inputs: [
            `${orgField}field`,
            initialMerkleRoot,
          ],
          fee: 0.25,
        })
        setTxId(result?.transactionId || 'tx_pending')
      } else {
        throw new Error('Wallet does not support transaction execution')
      }

      setOrgFieldDisplay(orgName)
      setStep('success')
      // Navigate to the org dashboard for the newly registered org
      setTimeout(() => navigate(`/app/org/${orgName}`), 3000)
    } catch (e: any) {
      console.error('Registration failed:', e)
      setError(e?.message || 'Transaction failed')
      setStep('form')
    }
  }, [canSubmit, orgName, executeTransaction, navigate])

  return (
    <div className="min-h-screen pt-14">
      <section className="px-8 md:px-16 py-20 bg-bg-secondary border-t border-border">
        <div className="text-[11px] text-text-muted tracking-[3px] uppercase mb-3">// ON-CHAIN REGISTRATION</div>
        <h2 className="font-mono text-[32px] font-bold mb-12">Register Organization</h2>

        <div className="bg-bg-primary border border-border max-w-[620px] mx-auto">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-border text-[11px] text-text-muted tracking-[1px]">
            <span className={`w-2 h-2 rounded-full ${step === 'success' ? 'bg-success' : 'bg-accent'}`} />
            <span className={`w-2 h-2 rounded-full ${step === 'success' ? 'bg-success' : 'bg-text-muted'}`} />
            <span className={`w-2 h-2 rounded-full ${step === 'success' ? 'bg-success' : 'bg-text-muted'}`} />
            <span className="ml-2">
              {step === 'form' && 'zkleaks://register — NEW ORGANIZATION'}
              {step === 'registering' && 'zkleaks://register — BROADCASTING TX'}
              {step === 'success' && 'zkleaks://register — REGISTERED ON-CHAIN'}
            </span>
          </div>

          {step === 'form' && (
            <div className="p-6 space-y-6">
              {!connected && (
                <div className="flex items-start gap-3 p-4 bg-danger/10 border border-danger/30 text-xs text-danger">
                  <span className="text-base shrink-0">&#9888;</span>
                  <span>Connect your Aleo wallet to register an organization. Your wallet address will be set as the admin.</span>
                </div>
              )}

              <div>
                <label className="block text-[11px] text-text-muted tracking-[2px] uppercase mb-2">Organization Name</label>
                <input
                  type="text"
                  value={orgName}
                  onChange={e => setOrgName(e.target.value)}
                  placeholder="Enter organization name..."
                  className="w-full bg-bg-tertiary border border-border text-text-primary font-mono text-[13px] p-3 focus:border-accent transition-all placeholder:text-text-muted"
                />
                <div className="text-[10px] text-text-muted mt-1">This name is hashed to create your on-chain org ID. Use the same name when adding members and submitting reports.</div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-bg-tertiary border border-border text-xs text-text-secondary">
                <span className="text-accent text-base shrink-0">&#9670;</span>
                <div>
                  <div className="font-semibold text-text-primary mb-1">What happens on-chain:</div>
                  <ul className="space-y-1 text-[11px] text-text-muted list-none m-0 p-0">
                    <li>- Organization ID derived from name (deterministic hash)</li>
                    <li>- Your wallet address set as admin</li>
                    <li>- Empty Merkle tree initialized for member commitments</li>
                    <li>- Org registered in <span className="text-text-secondary">{PROGRAM_ID}/organizations</span> mapping</li>
                  </ul>
                </div>
              </div>

              {error && (
                <div className="text-[11px] text-danger bg-danger/10 border border-danger/20 px-4 py-2">
                  {error}
                </div>
              )}

              <button
                onClick={handleRegister}
                disabled={!canSubmit}
                className={`w-full py-3.5 font-mono text-[13px] font-semibold tracking-[1px] uppercase transition-all border-none ${
                  canSubmit
                    ? 'bg-accent text-bg-primary hover:shadow-[0_0_30px_#d4a01766] cursor-pointer'
                    : 'bg-bg-tertiary text-text-muted cursor-not-allowed'
                }`}
              >
                {connected ? 'REGISTER ON ALEO TESTNET' : 'CONNECT WALLET TO REGISTER'}
              </button>
            </div>
          )}

          {step === 'registering' && (
            <div className="p-12 text-center">
              <div className="w-12 h-12 border-2 border-border border-t-accent mx-auto mb-6 animate-spin-slow" />
              <p className="text-sm text-text-secondary">Broadcasting registration transaction...</p>
            </div>
          )}

          {step === 'success' && (
            <div className="p-12 text-center">
              <div className="text-4xl text-success mb-4">&#10003;</div>
              <h3 className="font-mono text-lg font-bold mb-2">Organization Registered</h3>
              <p className="text-sm text-text-secondary mb-4">
                <span className="font-semibold">{orgFieldDisplay}</span> is now registered on Aleo testnet.
              </p>
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
              <p className="text-xs text-text-muted mt-4">Redirecting to org dashboard...</p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
