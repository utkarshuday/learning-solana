import { useSolana } from '@/components/solana/use-solana'
import { WalletDropdown } from '@/components/wallet-dropdown'
import { AppHero } from '@/components/app-hero'
import { TokenvestingdappUiButtonInitialize } from './ui/tokenvestingdapp-ui-button-initialize'
import { TokenvestingdappUiList } from './ui/tokenvestingdapp-ui-list'
import { TokenvestingdappUiProgramExplorerLink } from './ui/tokenvestingdapp-ui-program-explorer-link'
import { TokenvestingdappUiProgramGuard } from './ui/tokenvestingdapp-ui-program-guard'

export default function TokenvestingdappFeature() {
  const { account } = useSolana()

  return (
    <TokenvestingdappUiProgramGuard>
      <AppHero
        title="Tokenvestingdapp"
        subtitle={
          account
            ? "Initialize a new tokenvestingdapp onchain by clicking the button. Use the program's methods (increment, decrement, set, and close) to change the state of the account."
            : 'Select a wallet to run the program.'
        }
      >
        <p className="mb-6">
          <TokenvestingdappUiProgramExplorerLink />
        </p>
        {account ? (
          <TokenvestingdappUiButtonInitialize />
        ) : (
          <div style={{ display: 'inline-block' }}>
            <WalletDropdown />
          </div>
        )}
      </AppHero>
      {account ? <TokenvestingdappUiList /> : null}
    </TokenvestingdappUiProgramGuard>
  )
}
