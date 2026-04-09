import { useMemo, type ReactNode } from 'react'
import { AleoWalletProvider } from '@provablehq/aleo-wallet-adaptor-react'
import { DecryptPermission } from '@provablehq/aleo-wallet-adaptor-core'
import { LeoWalletAdapter } from '@provablehq/aleo-wallet-adaptor-leo'
import { Network } from '@provablehq/aleo-types'

export default function WalletProviderWrapper({ children }: { children: ReactNode }) {
  const wallets = useMemo(
    () => [
      new LeoWalletAdapter({ appName: 'ZkLeaks' }),
    ],
    []
  )

  return (
    <AleoWalletProvider
      wallets={wallets as any}
      network={Network.TESTNET}
      decryptPermission={DecryptPermission.UponRequest}
      programs={['zkleaks_v2.aleo']}
    >
      {children}
    </AleoWalletProvider>
  )
}
