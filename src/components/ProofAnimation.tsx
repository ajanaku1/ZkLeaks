import { useState, useEffect } from 'react'

interface Props {
  onComplete: (proofData: ProofResult) => void
  status: 'idle' | 'proving' | 'verified' | 'failed'
  error?: string | null
  txId?: string | null
}

export interface ProofResult {
  txId: string
  nullifier: string
  reportId: string
  timestamp: number
}

interface Step {
  text: string
  done: boolean
  success?: boolean
  error?: boolean
}

export default function ProofAnimation({ status, error, txId }: Props) {
  const [steps, setSteps] = useState<Step[]>([])

  useEffect(() => {
    if (status === 'proving') {
      // Show real proving steps progressively
      const sequence = [
        { text: '> Preparing transaction inputs...', delay: 0 },
        { text: '> Loading membership token from wallet...', delay: 600 },
        { text: '> Computing nullifier hash (BHP256)...', delay: 1200 },
        { text: '> Requesting wallet to generate ZK proof...', delay: 1800 },
        { text: '> Wallet broadcasting to Aleo testnet...', delay: 3000 },
      ]

      setSteps([])
      const timers = sequence.map((s) =>
        setTimeout(() => {
          setSteps(prev => [...prev, { text: s.text, done: true }])
        }, s.delay)
      )
      return () => timers.forEach(clearTimeout)
    }
  }, [status])

  useEffect(() => {
    if (status === 'verified' && txId) {
      setSteps(prev => [
        ...prev,
        {
          text: `> PROOF VERIFIED. TX: ${txId.slice(0, 12)}... [OK]`,
          done: true,
          success: true,
        },
      ])
    }
    if (status === 'failed' && error) {
      setSteps(prev => [
        ...prev,
        {
          text: `> ERROR: ${error}`,
          done: true,
          error: true,
        },
      ])
    }
  }, [status, txId, error])

  return (
    <div className="bg-bg-primary border border-border">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border text-[11px] text-text-muted tracking-[1px]">
        <span className={`w-2 h-2 rounded-full ${status === 'failed' ? 'bg-danger' : status === 'verified' ? 'bg-success' : 'bg-accent'}`} />
        <span className={`w-2 h-2 rounded-full ${status === 'verified' ? 'bg-success' : 'bg-accent'}`} />
        <span className={`w-2 h-2 rounded-full ${status === 'verified' ? 'bg-success' : 'bg-text-muted'}`} />
        <span className="ml-2">
          {status === 'proving' && 'zkleaks://proving — GENERATING ZK PROOF'}
          {status === 'verified' && 'zkleaks://proving — PROOF VERIFIED'}
          {status === 'failed' && 'zkleaks://proving — PROOF FAILED'}
        </span>
      </div>
      <div className="p-6">
        {status === 'proving' && (
          <div className="w-12 h-12 border-2 border-border border-t-accent mx-auto mb-6 animate-spin-slow" />
        )}
        {status === 'verified' && (
          <div className="text-4xl text-success text-center mb-6">&#10003;</div>
        )}
        {status === 'failed' && (
          <div className="text-4xl text-danger text-center mb-6">&#10007;</div>
        )}
        <div className="text-left max-w-md mx-auto font-mono text-xs space-y-1">
          {steps.map((step, i) => (
            <div
              key={i}
              className={`transition-opacity duration-300 ${
                step.success ? 'text-success' : step.error ? 'text-danger' : 'text-text-muted'
              }`}
            >
              {step.text}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
