import { useState, useEffect, useCallback } from 'react'
import { useWallet } from '@provablehq/aleo-wallet-adaptor-react'

export default function WalletConnectButton() {
  const { connected, wallets, selectWallet, disconnect } = useWallet()
  const [showDropdown, setShowDropdown] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [walletAddress, setWalletAddress] = useState<string | null>(null)

  // Sync address from Leo Wallet directly
  useEffect(() => {
    const leo = (window as any).leoWallet || (window as any).leo
    if (leo?.publicKey) {
      setWalletAddress(leo.publicKey)
    }
  }, [connected])

  const handleConnect = useCallback(async () => {
    try {
      setConnecting(true)
      setError(null)

      const leo = (window as any).leoWallet || (window as any).leo
      if (!leo) {
        setError('Leo Wallet not found. Install from leo.app and refresh.')
        return
      }

      // Connect directly through window.leoWallet, trying network strings
      const networkStrings = ['testnet', 'testnetbeta', 'mainnet']
      let connectSuccess = false

      for (const network of networkStrings) {
        try {
          await leo.connect('DECRYPT_UPON_REQUEST', network, ['zkleaks_v2.aleo'])
          connectSuccess = true
          break
        } catch (e: any) {
          const msg = e?.message || ''
          // If it's a network mismatch, try next
          if (msg.includes('network') || msg.includes('NETWORK') || msg.includes('invalid') || msg.includes('param')) {
            continue
          }
          // If user rejected, stop
          if (msg.includes('reject') || msg.includes('denied') || msg.includes('cancel')) {
            setError('Connection rejected. Approve the request in Leo Wallet.')
            return
          }
          // Unknown error on this attempt, try next
          continue
        }
      }

      // If all network strings failed, try with no network at all
      if (!connectSuccess) {
        try {
          await leo.connect('DECRYPT_UPON_REQUEST')
          connectSuccess = true
        } catch {
          // Try absolute minimum
          try {
            await leo.connect()
            connectSuccess = true
          } catch (finalErr: any) {
            setError(finalErr?.message || 'Could not connect. Make sure Leo Wallet is unlocked.')
            return
          }
        }
      }

      const addr = leo.publicKey
      if (!addr) {
        setError('Connected but no address returned. Unlock Leo Wallet and try again.')
        return
      }

      setWalletAddress(addr)

      // Sync with React hook
      const leoAdapter = wallets.find(w => w.adapter.name === 'Leo Wallet')
      if (leoAdapter) {
        selectWallet('Leo Wallet' as any)
      }

      setShowDropdown(false)
    } catch (e: any) {
      console.error('Wallet connect error:', e)
      setError(e?.message || 'Failed to connect. Check console for details.')
    } finally {
      setConnecting(false)
    }
  }, [wallets, selectWallet])

  const handleDisconnect = async () => {
    try {
      const leo = (window as any).leoWallet || (window as any).leo
      if (leo) await leo.disconnect()
      await disconnect()
    } catch { /* ignore */ }
    setWalletAddress(null)
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

  // Check if Leo Wallet is available
  const leoDetected = typeof window !== 'undefined' && !!((window as any).leoWallet || (window as any).leo)
  const isConnected = connected || !!walletAddress
  const displayAddress = walletAddress || null

  // Connected
  if (isConnected && displayAddress) {
    return (
      <div className="relative wallet-dropdown">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[1px] px-3 py-1.5 border border-success/50 text-success hover:border-success transition-colors bg-transparent cursor-pointer"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse-slow" />
          {displayAddress.slice(0, 8)}...{displayAddress.slice(-4)}
        </button>
        {showDropdown && (
          <div className="absolute right-0 top-full mt-1 bg-bg-secondary border border-border p-2 z-50 min-w-[160px]">
            <div className="text-[10px] text-text-muted px-2 py-1 mb-1 border-b border-border">
              {displayAddress.slice(0, 12)}...{displayAddress.slice(-8)}
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
        onClick={leoDetected ? handleConnect : () => setShowDropdown(!showDropdown)}
        disabled={connecting}
        className="text-[11px] font-mono uppercase tracking-[1px] px-3 py-1.5 border border-accent text-accent hover:bg-accent-dim transition-colors bg-transparent cursor-pointer disabled:opacity-50"
      >
        {connecting ? 'Connecting...' : 'Connect Wallet'}
      </button>

      {!leoDetected && showDropdown && (
        <div className="absolute right-0 top-full mt-1 bg-bg-secondary border border-border p-3 z-50 min-w-[240px]">
          <div className="text-[11px] text-text-muted">
            <p className="m-0 mb-2">Leo Wallet not detected.</p>
            <a
              href="https://www.leo.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline"
            >
              Install Leo Wallet
            </a>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute right-0 top-full mt-1 bg-bg-secondary border border-danger/50 p-3 z-50 min-w-[240px]">
          <p className="text-[10px] text-danger m-0 leading-relaxed">{error}</p>
          <p className="text-[9px] text-text-muted mt-2 m-0">
            Ensure Leo Wallet is unlocked and set to Testnet
          </p>
        </div>
      )}
    </div>
  )
}
