// Synthetic order-level dataset modeled on the shape and rough magnitude of a
// public Brazilian e-commerce marketplace report (states, categories, review
// scores, delivery outcomes). All values are generated, not real transactions.

export const STATES = [
  { name: 'São Paulo', code: 'SP', weight: 3.2, lateBase: 0.059, reviewBase: 4.17 },
  { name: 'Rio de Janeiro', code: 'RJ', weight: 1.3, lateBase: 0.135, reviewBase: 3.95 },
  { name: 'Minas Gerais', code: 'MG', weight: 1.1, lateBase: 0.07, reviewBase: 4.14 },
  { name: 'Rio Grande do Sul', code: 'RS', weight: 0.55, lateBase: 0.08, reviewBase: 4.05 },
  { name: 'Paraná', code: 'PR', weight: 0.5, lateBase: 0.065, reviewBase: 4.18 },
  { name: 'Bahia', code: 'BA', weight: 0.4, lateBase: 0.14, reviewBase: 3.9 },
  { name: 'Espírito Santo', code: 'ES', weight: 0.18, lateBase: 0.122, reviewBase: 3.95 },
  { name: 'Ceará', code: 'CE', weight: 0.13, lateBase: 0.153, reviewBase: 3.9 },
  { name: 'Pará', code: 'PA', weight: 0.1, lateBase: 0.124, reviewBase: 3.85 },
  { name: 'Maranhão', code: 'MA', weight: 0.08, lateBase: 0.197, reviewBase: 3.76 },
  { name: 'Sergipe', code: 'SE', weight: 0.06, lateBase: 0.152, reviewBase: 3.81 },
  { name: 'Alagoas', code: 'AL', weight: 0.05, lateBase: 0.239, reviewBase: 3.75 },
  { name: 'Amazonas', code: 'AM', weight: 0.05, lateBase: 0.09, reviewBase: 4.18 },
  { name: 'Roraima', code: 'RR', weight: 0.02, lateBase: 0.11, reviewBase: 3.61 },
]

export const CATEGORIES = [
  { name: 'Health Beauty', reviewBase: 4.15, freightRatio: 0.22 },
  { name: 'Watches Gifts', reviewBase: 4.05, freightRatio: 0.28 },
  { name: 'Bed Bath Table', reviewBase: 3.95, freightRatio: 0.27 },
  { name: 'Sports Leisure', reviewBase: 4.1, freightRatio: 0.24 },
  { name: 'Computers Accessories', reviewBase: 4.0, freightRatio: 0.26 },
  { name: 'Furniture Decor', reviewBase: 3.95, freightRatio: 0.29 },
  { name: 'Housewares', reviewBase: 4.08, freightRatio: 0.23 },
  { name: 'Office Furniture', reviewBase: 3.62, freightRatio: 0.24 },
  { name: 'Fashion Male Clothing', reviewBase: 3.7, freightRatio: 0.26 },
  { name: 'Telephony', reviewBase: 4.02, freightRatio: 0.5 },
]

const MONTHS = [
  '2016-09', '2016-10', '2016-12',
  '2017-01', '2017-02', '2017-03', '2017-04', '2017-05', '2017-06',
  '2017-07', '2017-08', '2017-09', '2017-10', '2017-11', '2017-12',
  '2018-01', '2018-02', '2018-03', '2018-04', '2018-05', '2018-06', '2018-07', '2018-08',
]

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

function monthVolumeMultiplier(monthStr) {
  const idx = MONTHS.indexOf(monthStr)
  // growth ramp through 2017, holiday bump Nov 2017, dip after Aug 2018 cutoff
  const growth = 0.15 + (idx / MONTHS.length) * 1.6
  const holiday = monthStr === '2017-11' || monthStr === '2017-12' ? 1.3 : 1
  const volumeSpike = monthStr === '2017-11' || monthStr === '2018-03' ? 1.4 : 1
  return growth * holiday * volumeSpike
}

const SELLER_COUNT = 220
const sellers = Array.from({ length: SELLER_COUNT }, (_, i) => {
  const risky = rand() < 0.09
  return {
    id: `SEL-${1000 + i}`,
    riskBase: risky ? 2.1 + rand() * 1.2 : 3.6 + rand() * 1.3,
  }
})

export function generateOrders() {
  const orders = []
  let id = 1

  MONTHS.forEach((monthStr) => {
    const [year] = monthStr.split('-')
    const volMult = monthVolumeMultiplier(monthStr)

    STATES.forEach((state) => {
      CATEGORIES.forEach((category) => {
        const baseCount = 9 * volMult * state.weight * (0.7 + rand() * 0.6)
        const count = Math.max(0, Math.round(baseCount))

        for (let i = 0; i < count; i++) {
          const seller = sellers[Math.floor(rand() * sellers.length)]
          const price = 60 + rand() * 220
          const freight = price * category.freightRatio * (0.8 + rand() * 0.4)

          const lateRoll = rand()
          let deliveryStatus = 'on_time'
          let deliveryDays = 4 + Math.round(rand() * 16)
          if (lateRoll < 0.006) {
            deliveryStatus = 'canceled'
            deliveryDays = 0
          } else if (lateRoll < 0.014) {
            deliveryStatus = 'other'
            deliveryDays = 3 + Math.round(rand() * 5)
          } else if (lateRoll < state.lateBase + 0.014) {
            deliveryStatus = 'late'
            deliveryDays = 18 + Math.round(rand() * 34)
          }

          // review score: an explicit negative-probability model driven by delivery
          // outcome first, then nudged by state/category/seller quality baselines.
          const qualityFactor = (state.reviewBase + category.reviewBase + seller.riskBase) / 3
          const qualityAdjust = (4.0 - qualityFactor) * 0.16 // worse baseline -> more negative

          const negProbBase = { on_time: 0.07, late: 0.5, canceled: 0.85, other: 0.8 }[deliveryStatus]
          const negProb = Math.min(0.95, Math.max(0.02, negProbBase + qualityAdjust))

          const roll = rand()
          let score
          if (roll < negProb * 0.35) score = 1
          else if (roll < negProb) score = 2
          else if (roll < negProb + 0.22) score = 3
          else if (roll < negProb + 0.22 + 0.33) score = 4
          else score = 5

          orders.push({
            id: id++,
            year,
            month: monthStr,
            state: state.name,
            stateCode: state.code,
            category: category.name,
            revenue: Math.round(price * 100) / 100,
            freight: Math.round(freight * 100) / 100,
            freightRatio: category.freightRatio,
            reviewScore: score,
            deliveryStatus,
            deliveryDays,
            sellerId: seller.id,
          })
        }
      })
    })
  })

  return orders
}

export const MONTH_LIST = MONTHS
export const YEARS = ['2016', '2017', '2018']
