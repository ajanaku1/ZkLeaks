# ZkLeaks: Anonymous Whistleblowing on Aleo

Cryptographic whistleblowing platform where insiders prove organizational membership using zero-knowledge proofs, without revealing their identity.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Aleo](https://img.shields.io/badge/Aleo-Testnet-00D4AA)](https://aleo.org/)
[![Leo](https://img.shields.io/badge/Leo-Smart_Contracts-363636)](https://leo-lang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

<!-- TODO: Add screenshot -->

---

## What Is ZkLeaks?

83% of whistleblowers face retaliation. Existing "anonymous" tip lines leak metadata, IP addresses, and document fingerprints. ZkLeaks fixes this with math.

Using zero-knowledge proofs on the Aleo blockchain, an insider can cryptographically prove they belong to an organization without revealing which member they are. Reports are verified on-chain, and other insiders can anonymously corroborate them to build credibility.

---

## Features

- **Zero-Knowledge Membership Proofs**: Prove you belong to an organization without revealing your identity. The chain sees proof, never the person.
- **On-Chain Report Verification**: Every report is verified by the `zkleaks_v2.aleo` smart contract and stored immutably on Aleo.
- **Nullifier-Based Anti-Spam**: Each insider can only report once per topic. Cryptographic enforcement, not policy.
- **Anonymous Corroboration**: Other insiders can vouch for a report without exposing themselves. Credibility grows while anonymity holds.
- **Bounty System**: Organizations can fund bounty pools to incentivize quality reports.
- **Report Categories and Severity**: Financial Fraud, Safety Violation, Corruption. Low to Critical severity levels.
- **Encrypted Off-Chain Storage**: Report content is encrypted in IndexedDB (IPFS-ready for production).

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript, Tailwind CSS 4 |
| Routing | React Router 7 |
| Blockchain | Aleo Testnet |
| Smart Contract | Leo (`zkleaks_v2.aleo`) |
| Wallet | Leo Wallet (Aleo Wallet Adapter) |
| Hashing | BHP256 (commitments, nullifiers, content hashes) |
| Content Storage | IndexedDB (encrypted, IPFS-ready) |
| Build | Vite 8 |

---

## Smart Contract

| Transition | Description |
|-----------|-------------|
| `register_org` | Register an organization on-chain, caller becomes admin |
| `add_member` | Admin adds a member, generates private MembershipToken |
| `submit_report` | Member submits report with ZK proof of membership |
| `corroborate` | Another insider anonymously vouches for a report |
| `fund_bounty` | Fund the bounty pool for an organization |
| `claim_bounty` | Claim bounty reward for a verified report |

**Program ID**: `zkleaks_v2.aleo`

---

## How It Works

```
Insider                     Leo Wallet                    Aleo Chain
  |                             |                             |
  |  1. Connect wallet          |                             |
  |---->                        |                             |
  |                             |                             |
  |  2. Load MembershipToken    |                             |
  |         (private record)    |                             |
  |                             |                             |
  |  3. Enter report details    |                             |
  |---->                        |                             |
  |                             |                             |
  |     4. Generate ZK proof    |                             |
  |     nullifier = BHP256(     |                             |
  |       secret, nonce)        |                             |
  |                             |                             |
  |                             |  5. submit_report(proof)    |
  |                             |---->                        |
  |                             |                             |
  |                             |     6. Verify membership    |
  |                             |     7. Check nullifier      |
  |                             |     8. Store report         |
  |                             |                             |
  |                             |  9. TX confirmed            |
  |                             |<----|                       |
  |                             |                             |
  | 10. Report live on feed     |                             |
  |     Identity: UNKNOWN       |                             |
```

---

## Testing the App

### Prerequisites
- [Leo Wallet](https://leo.app/) browser extension
- Aleo testnet tokens (use the [Aleo faucet](https://faucet.aleo.org/))

### Walkthrough

1. **Connect Wallet**: Click "Connect Wallet" in the nav bar. Approve the connection in Leo Wallet.

2. **Register an Organization** (admin flow): Navigate to Register Organization. Enter your org name. Confirm the transaction. Your wallet address becomes the admin.

3. **Add Members** (admin flow): Go to your Organization Dashboard. Enter a member's wallet address. The member receives a private MembershipToken in their wallet.

4. **Submit a Report** (insider flow): Navigate to Submit Report. Select your organization, enter a title and description, pick a category and severity. The wallet generates a ZK proof of membership. Confirm the transaction. The report appears on the public feed with a "ZK Verified" badge.

5. **Corroborate** (other insiders): View any report on the feed. Click Corroborate. Your wallet proves membership independently. The corroboration count increments. Your identity remains unknown.

---

## Running Locally

```bash
git clone https://github.com/ajanaku1/ZkLeaks.git
cd ZkLeaks
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in a browser with Leo Wallet installed.

### Smart Contract (Leo)

```bash
cd contracts/zkleaks
leo build
leo run register_org 1u64
```

---

## Project Structure

```
ZkLeaks/
  src/
    pages/
      Landing.tsx          # Marketing page with hero and protocol overview
      Feed.tsx             # Public report listing with filters
      ReportDetail.tsx     # Individual report with proof metadata
      Submit.tsx           # Report submission with proof generation UI
      RegisterOrg.tsx      # Organization registration
      OrgDashboard.tsx     # Admin panel: members, bounties, reports
    components/
      Nav.tsx              # Navigation with wallet button and network status
      ReportCard.tsx       # Report preview card with severity indicator
      ProofAnimation.tsx   # Terminal-style proof generation animation
      Footer.tsx           # Footer with documentation links
    services/
      aleo.ts              # Blockchain queries (orgs, reports, bounties)
      content.ts           # IndexedDB operations for encrypted content
    wallet/
      WalletProvider.tsx   # Aleo wallet adapter setup
      WalletConnectButton.tsx
    data/
      types.ts             # TypeScript interfaces
      store.ts             # Data fetching and state management
  contracts/
    zkleaks/
      src/main.leo         # Smart contract: 6 transitions
  video/                   # Demo video (Remotion)
```

---

## License

MIT
