import { useState, useEffect } from 'react'
import { getNetworkStats } from '../data/store'

export default function Landing() {
  const [stats, setStats] = useState({ totalReports: 0, onChainReports: 0, totalOrgs: 0, isDeployed: false })

  useEffect(() => {
    getNetworkStats().then(setStats)
  }, [])

  return (
    <div>
      {/* Minimal top bar */}
      <nav className="fixed top-0 w-full z-100 bg-bg-primary/80 backdrop-blur-sm border-b border-border px-8 h-14 flex items-center justify-between">
        <div className="font-mono font-bold text-base text-accent tracking-[2px] uppercase">
          zk<span className="text-text-muted">//</span>LEAKS
        </div>
        <div className="flex items-center gap-6">
          <a href="#how-it-works" className="text-xs tracking-[1px] uppercase text-text-secondary hover:text-accent transition-colors hidden md:block">
            Protocol
          </a>
          <a
            href="/app"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-accent text-bg-primary px-5 py-2 font-mono text-[11px] font-semibold tracking-[1px] uppercase hover:shadow-[0_0_20px_#d4a01766] transition-all"
          >
            Launch App
          </a>
        </div>
      </nav>

      {/* Hero */}
      <section className="min-h-screen flex flex-col justify-center px-8 md:px-16 pt-24 pb-20">
        <div className="text-xs text-text-muted tracking-[3px] uppercase mb-6">
          $ zkleaks --init
          <span className="inline-block w-2 h-3.5 bg-accent ml-1 animate-blink" />
        </div>

        <h1 className="font-mono text-4xl md:text-[56px] font-bold leading-[1.1] tracking-tight max-w-[700px] mb-8">
          Expose the truth.
          <br />
          <span className="text-accent" style={{ textShadow: '0 0 40px #d4a01766' }}>
            Protect the source.
          </span>
        </h1>

        <p className="text-[15px] text-text-secondary max-w-[540px] leading-[1.8] mb-12">
          Zero-knowledge whistleblowing on Aleo. Prove you're an insider without revealing who you are.
          Your identity stays cryptographically sealed. The truth doesn't.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <a
            href="/app/submit"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-accent text-bg-primary px-8 py-3.5 font-mono text-[13px] font-semibold tracking-[1px] uppercase text-center hover:shadow-[0_0_30px_#d4a01766] hover:-translate-y-0.5 transition-all no-underline"
          >
            SUBMIT A REPORT
          </a>
          <a
            href="/app/reports"
            target="_blank"
            rel="noopener noreferrer"
            className="border border-border text-text-secondary px-8 py-3.5 font-mono text-[13px] font-medium tracking-[1px] uppercase text-center hover:border-accent hover:text-accent transition-all no-underline"
          >
            VIEW VERIFIED REPORTS
          </a>
        </div>

        <div className="flex flex-col sm:flex-row gap-12 mt-20 pt-8 border-t border-border">
          <div>
            <div className="text-[28px] font-bold text-accent">{stats.totalReports}</div>
            <div className="text-[11px] text-text-muted tracking-[2px] uppercase mt-1">Verified Reports</div>
          </div>
          <div>
            <div className="text-[28px] font-bold text-accent">{stats.totalOrgs}</div>
            <div className="text-[11px] text-text-muted tracking-[2px] uppercase mt-1">Organizations</div>
          </div>
          <div>
            <div className="text-[28px] font-bold text-accent">0</div>
            <div className="text-[11px] text-text-muted tracking-[2px] uppercase mt-1">Identities Exposed</div>
          </div>
          {stats.isDeployed && (
            <div>
              <div className="text-[28px] font-bold text-success">&#10003;</div>
              <div className="text-[11px] text-text-muted tracking-[2px] uppercase mt-1">On-Chain (Testnet)</div>
            </div>
          )}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="px-8 md:px-16 py-20">
        <div className="text-[11px] text-text-muted tracking-[3px] uppercase mb-3">// PROTOCOL</div>
        <h2 className="font-mono text-[32px] font-bold mb-12">How it works</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-0.5">
          {[
            {
              step: '01',
              icon: '+',
              title: 'Organization Registers',
              desc: 'Admin registers on-chain via zkleaks_v2.aleo. Member commitments are added to a Merkle tree — no plaintext identities stored.',
            },
            {
              step: '02',
              icon: '>',
              title: 'Insider Proves Membership',
              desc: 'Your Aleo wallet generates a zero-knowledge proof that you belong to the organization. The proof reveals nothing about which member you are.',
            },
            {
              step: '03',
              icon: '~',
              title: 'Report is Published',
              desc: 'Your report goes live with a verified insider badge. A nullifier prevents double-reporting. Anyone can verify the proof on-chain.',
            },
          ].map(step => (
            <div key={step.step} className="bg-bg-card border border-border p-8">
              <div className="text-[11px] text-accent tracking-[2px] mb-4">{step.step}</div>
              <div className="w-10 h-10 border border-accent-dim flex items-center justify-center text-lg mb-5">
                {step.icon}
              </div>
              <h3 className="font-mono text-base font-semibold mb-3">{step.title}</h3>
              <p className="text-[13px] text-text-secondary leading-[1.7]">{step.desc}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <a
            href="/app"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-accent text-bg-primary px-10 py-4 font-mono text-[14px] font-semibold tracking-[2px] uppercase hover:shadow-[0_0_40px_#d4a01766] hover:-translate-y-0.5 transition-all no-underline"
          >
            LAUNCH APP
          </a>
          <p className="text-xs text-text-muted mt-4">
            Deployed on Aleo Testnet · Program: <span className="text-text-secondary">zkleaks_v2.aleo</span>
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-8 md:px-16 py-8 border-t border-border">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="font-mono text-[11px] text-text-muted">
            ZkLeaks Protocol · Built on <span className="text-text-secondary">Aleo</span> · Zero-Knowledge by Design
          </div>
          <div className="flex gap-6 text-[11px] text-text-muted">
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">GitHub</a>
            <a href="https://aleo.org" target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">Aleo</a>
            <a href="https://docs.leo-lang.org" target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">Leo Docs</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
