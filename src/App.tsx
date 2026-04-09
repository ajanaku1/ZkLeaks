import { Routes, Route } from 'react-router-dom'
import Nav from './components/Nav'
import Footer from './components/Footer'
import Landing from './pages/Landing'
import Submit from './pages/Submit'
import Feed from './pages/Feed'
import ReportDetail from './pages/ReportDetail'
import OrgDashboard from './pages/OrgDashboard'
import RegisterOrg from './pages/RegisterOrg'

function AppLayout() {
  return (
    <div className="min-h-screen bg-bg-primary text-text-primary font-mono text-sm leading-relaxed">
      <Nav />
      <Routes>
        <Route path="/" element={<Feed />} />
        <Route path="/submit" element={<Submit />} />
        <Route path="/reports" element={<Feed />} />
        <Route path="/reports/:id" element={<ReportDetail />} />
        <Route path="/org/register" element={<RegisterOrg />} />
        <Route path="/org/:id" element={<OrgDashboard />} />
      </Routes>
      <Footer />
    </div>
  )
}

export default function App() {
  return (
    <div className="min-h-screen bg-bg-primary text-text-primary font-mono text-sm leading-relaxed">
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/app/*" element={<AppLayout />} />
      </Routes>
    </div>
  )
}
