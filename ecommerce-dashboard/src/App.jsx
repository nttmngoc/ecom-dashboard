import { useMemo, useState } from 'react'
import { generateOrders } from './data/olistData.js'
import { FilterProvider } from './context/FilterContext.jsx'
import Sidebar from './components/Sidebar.jsx'
import Overview from './pages/Overview.jsx'
import CustomerSatisfaction from './pages/CustomerSatisfaction.jsx'
import DeliveryPerformance from './pages/DeliveryPerformance.jsx'
import SellerProductQuality from './pages/SellerProductQuality.jsx'
import Recommendations from './pages/Recommendations.jsx'

const ORDERS = generateOrders()

const PAGE_COMPONENTS = {
  overview: Overview,
  satisfaction: CustomerSatisfaction,
  delivery: DeliveryPerformance,
  quality: SellerProductQuality,
  recommendations: Recommendations,
}

export default function App() {
  const [page, setPage] = useState('overview')
  const PageComponent = PAGE_COMPONENTS[page]

  return (
    <FilterProvider>
      <div className="app-shell">
        <Sidebar page={page} setPage={setPage} />
        <main className="content">
          <PageComponent orders={ORDERS} />
        </main>
      </div>

      <style>{`
        .app-shell { display: flex; min-height: 100vh; }
        .content { flex: 1; padding: 28px 32px; max-width: 1280px; }
      `}</style>
    </FilterProvider>
  )
}
