import { useState, useEffect, useCallback } from 'react'
import { useWallet } from '@provablehq/aleo-wallet-adaptor-react'
import { DecryptPermission } from '@provablehq/aleo-wallet-adaptor-core'
import { Network } from '@provablehq/aleo-types'

export default function WalletConnectButton() {
  const { connected, address, wallets, selectWallet, connect, disconnect } = useWallet()
  const [showDropdown, setShowDropdown] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleConnect = useCallback(async (walletName: string) => {
    try {
      setConnecting(true)
      setError(null)

      // Find the adapter directly
      const wallet = wallets.find(w => w.adapter.name === walletName)
      if (!wallet) {
        setError('Wallet not found. Is Leo Wallet installed?')
        return
      }

      const adapter = wallet.adapter

      // Check if wallet extension is detected
      if (adapter.readyState === 'NotDetected' || adapter.readyState === 'Unsupported') {
        setError('Leo Wallet not detected. Install it from leo.app and refresh.')
        return
      }

      // Try connecting directly through window.leoWallet as fallback
      const leoWallet = (window as any).leoWallet || (window as any).leo
      if (!leoWallet) {
        setError('Leo Wallet extension not found. Install from leo.app and refresh the page.')
        return
      }

      // Connect directly through the adapter with all required params
      try {
        await adapter.connect(
          Network.TESTNET,
          DecryptPermission.UponRequest,
          ['zkleaks_v2.aleo']
        )
      } catch (connectErr: any) {
        const msg = connectErr?.message || ''
        // If adapter fails, try connecting through window.leoWallet directly
        if (msg.includes('No address') || msg.includes('not selected') || msg.includes('NotSelected')) {
          try {
            await leoWallet.connect(DecryptPermission.UponRequest, 'testnet', ['zkleaks_v2.aleo'])
            if (!leoWallet.publicKey) {
              // Try without network constraint
              await leoWallet.connect(DecryptPermission.UponRequest)
            }
          } catch (directErr: any) {
            const directMsg = directErr?.message || ''
            if (directMsg.includes('network') || directMsg.includes('NETWORK_NOT_GRANTED')) {
              setError('Switch Leo Wallet to Testnet: Settings → Network → Testnet')
            } else {
              setError(directMsg || 'Connection rejected. Approve the request in Leo Wallet.')
            }
            return
          }
        } else if (msg.includes('network') || msg.includes('NETWORK_NOT_GRANTED')) {
          setError('Switch Leo Wallet to Testnet: Settings → Network → Testnet')
          return
        } else {
          throw connectErr
        }
      }

      // Also select through the hook to sync React state
      selectWallet(walletName as any)

      // Give React state a moment to sync
      await new Promise(r => setTimeout(r, 500))
      try {
        await connect(Network.TESTNET)
      } catch {
        // Adapter already connected, hook state will catch up
      }

      setShowDropdown(false)
    } catch (e: any) {
      console.error('Wallet connect error:', e)
      setError(e?.message || 'Failed to connect')
    } finally {
      setConnecting(false)
    }
  }, [wallets, selectWallet, connect])

  const handleDisconnect = async () => {
    try { await disconnect() } catch { /* ignore */ }
    setShowDropdown(false)
  }

  // Close dropdown on outside click
  useEffect(() => {
    if (!showDropdown) return
    const close = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest('.wallet-dropdown')) setShowDropdown(false)
    }
    document.addEventListener('click', close)
    return () => document.removeEventListener('click', close)
  }, [showDropdown])

  // Connected
  if (connected && address) {
    return (
      <div className="relative wallet-dropdown">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[1px] px-3 py-1.5 border border-success/50 text-success hover:border-success transition-colors bg-transparent cursor-pointer"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse-slow" />
          {address.slice(0, 8)}...{address.slice(-4)}
        </button>
        {showDropdown && (
          <div className="absolute right-0 top-full mt-1 bg-bg-secondary border border-border p-2 z-50 min-w-[160px]">
            <div className="text-[10px] text-text-muted px-2 py-1 mb-1 border-b border-border">
              {address.slice(0, 12)}...{address.slice(-8)}
            </div>
            <button
              onClick={handleDisconnect}
              className="w-full text-left text-[11px] font-mono uppercase tracking-[1px] text-danger hover:text-red-400 px-2 py-1.5 bg-transparent border-none cursor-pointer"
            >
              Disconnect
            </button>
          </div>
        )}
      </div>
    )
  }

  // Disconnected
  return (
    <div className="relative wallet-dropdown">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        disabled={connecting}
        className="text-[11px] font-mono uppercase tracking-[1px] px-3 py-1.5 border border-accent text-accent hover:bg-accent-dim transition-colors bg-transparent cursor-pointer disabled:opacity-50"
      >
        {connecting ? 'Connecting...' : 'Connect Wallet'}
      </button>

      {showDropdown && (
        <div className="absolute right-0 top-full mt-1 bg-bg-secondary border border-border p-3 z-50 min-w-[240px]">
          <p className="text-[10px] text-text-muted uppercase tracking-[1px] mb-2 m-0">
            Select Wallet
          </p>

          {wallets.length > 0 ? (
            wallets.map((w) => {
              const ready = w.adapter.readyState
              const detected = ready === 'Installed' || ready === 'Loadable'
              return (
                <button
                  key={w.adapter.name}
                  onClick={() => handleConnect(w.adapter.name)}
                  disabled={connecting}
                  className="w-full flex items-center gap-2 text-[11px] font-mono text-text-primary hover:text-accent px-2 py-2 bg-transparent border border-border hover:border-accent transition-colors cursor-pointer mb-1 disabled:opacity-50"
                >
                  {w.adapter.icon && (
                    <img src={w.adapter.icon} alt="" className="w-4 h-4" />
                  )}
                  {w.adapter.name}
                  {!detected && (
                    <span className="text-[9px] text-text-muted ml-auto">not detected</span>
                  )}
                </button>
              )
            })
          ) : (
            <div className="text-[11px] text-text-muted">
              <p className="m-0 mb-2">No Aleo wallet detected.</p>
              <a
                href="https://www.leo.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline"
              >
                Install Leo Wallet
              </a>
            </div>
          )}

          {error && (
            <p className="text-[10px] text-danger mt-2 m-0 leading-relaxed">{error}</p>
          )}

          <p className="text-[9px] text-text-muted mt-2 m-0">
            Ensure wallet is unlocked and set to Testnet
          </p>
        </div>
      )}
    </div>
  )
}
