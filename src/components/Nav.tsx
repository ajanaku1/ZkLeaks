import { Link, useLocation } from 'react-router-dom'
import WalletConnectButton from '../wallet/WalletConnectButton'

export default function Nav() {
  const location = useLocation()

  const links = [
    { to: '/app', label: 'Dashboard' },
    { to: '/app/submit', label: 'Submit Report' },
    { to: '/app/reports', label: 'Reports' },
    { to: '/app/org/register', label: 'Register Org' },
  ]

  return (
    <nav className="fixed top-0 w-full z-100 bg-bg-primary border-b border-border px-8 h-14 flex items-center justify-between">
      <Link to="/app" className="font-mono font-bold text-base text-accent tracking-[2px] uppercase">
        zk<span className="text-text-muted">//</span>LEAKS
      </Link>

      <ul className="hidden md:flex gap-8 list-none">
        {links.map(link => (
          <li key={link.to}>
            <Link
              to={link.to}
              className={`text-xs tracking-[1px] uppercase no-underline transition-colors ${
                location.pathname === link.to || (link.to !== '/app' && location.pathname.startsWith(link.to))
                  ? 'text-accent'
                  : 'text-text-secondary hover:text-accent'
              }`}
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>

      <div className="flex items-center gap-4">
        <WalletConnectButton />
        <div className="hidden md:flex items-center gap-2 text-[11px] text-success">
          <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse-slow" />
          NETWORK SECURE
        </div>
      </div>
    </nav>
  )
}
