// Deterministic mock data generator — no real customer, order, or company data.
// Simulates one year of retail order records across regions and categories.

const CATEGORIES = ['Electronics', 'Apparel', 'Home & Garden', 'Beauty', 'Sports']
const REGIONS = ['North America', 'Europe', 'APAC', 'LATAM']
const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

const PRODUCT_NAMES = {
  Electronics: ['Wireless Earbuds Pro', '4K Streaming Stick', 'Smart Watch SE', 'Portable Charger 20K'],
  Apparel: ['Merino Wool Sweater', 'Everyday Chino', 'Rain Shell Jacket', 'Classic Denim'],
  'Home & Garden': ['Ceramic Planter Set', 'Cordless Vacuum Mini', 'Linen Bedding Set', 'Cast Iron Pan'],
  Beauty: ['Vitamin C Serum', 'Matte Lip Set', 'Clay Mask Trio', 'SPF 50 Daily Cream'],
  Sports: ['Trail Running Shoe', 'Yoga Mat Pro', 'Insulated Water Bottle', 'Adjustable Dumbbell Set'],
}

// Simple seeded PRNG so the dataset is stable across reloads.
function mulberry32(seed) {
  return function () {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const rand = mulberry32(20260711)

function seasonalMultiplier(monthIndex) {
  // Nov/Dec holiday lift, summer dip
  if (monthIndex === 10 || monthIndex === 11) return 1.6
  if (monthIndex === 6 || monthIndex === 7) return 0.85
  return 1
}

export function generateOrders() {
  const orders = []
  let id = 1

  const catBasePrice = {
    Electronics: 78,
    Apparel: 46,
    'Home & Garden': 58,
    Beauty: 24,
    Sports: 52,
  }
  const catShare = {
    Electronics: 1.2,
    Apparel: 1.0,
    'Home & Garden': 0.85,
    Beauty: 0.9,
    Sports: 0.8,
  }
  const regionShare = { 'North America': 1.35, Europe: 1.1, APAC: 0.9, LATAM: 0.65 }

  MONTHS.forEach((month, mi) => {
    const seasonal = seasonalMultiplier(mi)
    REGIONS.forEach((region) => {
      CATEGORIES.forEach((category) => {
        const baseOrders = 14 * seasonal * regionShare[region] * catShare[category]
        const count = Math.round(baseOrders + rand() * 6)
        for (let i = 0; i < count; i++) {
          const price = catBasePrice[category] * (0.8 + rand() * 0.6)
          const units = 1 + Math.floor(rand() * 3)
          const products = PRODUCT_NAMES[category]
          const product = products[Math.floor(rand() * products.length)]
          const converted = rand() > 0.22 // ~78% of sessions convert
          orders.push({
            id: id++,
            month,
            monthIndex: mi,
            region,
            category,
            product,
            revenue: converted ? Math.round(price * units * 100) / 100 : 0,
            units: converted ? units : 0,
            visited: true,
            converted,
          })
        }
      })
    })
  })

  return orders
}

export const CATEGORY_LIST = CATEGORIES
export const REGION_LIST = REGIONS
export const MONTH_LIST = MONTHS
