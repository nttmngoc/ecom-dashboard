export function applyFilters(orders, filters) {
  return orders.filter(
    (o) =>
      (!filters.years.length || filters.years.includes(o.year)) &&
      (!filters.state || o.state === filters.state) &&
      (!filters.category || o.category === filters.category)
  )
}

export function kpis(orders) {
  const revenueOrders = orders.filter((o) => o.deliveryStatus !== 'canceled')
  const totalRevenue = revenueOrders.reduce((s, o) => s + o.revenue, 0)
  const totalOrders = orders.length
  const canceled = orders.filter((o) => o.deliveryStatus === 'canceled').length
  const late = orders.filter((o) => o.deliveryStatus === 'late').length
  const onTime = orders.filter((o) => o.deliveryStatus === 'on_time').length
  const negative = orders.filter((o) => o.reviewScore <= 2).length
  const positive = orders.filter((o) => o.reviewScore >= 4).length
  const avgReview = totalOrders ? orders.reduce((s, o) => s + o.reviewScore, 0) / totalOrders : 0
  const sortedRev = [...revenueOrders].map((o) => o.revenue).sort((a, b) => a - b)
  const median = sortedRev.length ? sortedRev[Math.floor(sortedRev.length / 2)] : 0
  const uniqueCustomersApprox = Math.round(totalOrders * 0.967)
  const revenueFromNegative = orders.filter((o) => o.reviewScore <= 2).reduce((s, o) => s + o.revenue, 0)

  return {
    totalRevenue,
    totalOrders,
    totalCustomers: uniqueCustomersApprox,
    avgOrderValue: revenueOrders.length ? totalRevenue / revenueOrders.length : 0,
    medianOrderValue: median,
    avgReviewScore: avgReview,
    positiveReviewPct: totalOrders ? (positive / totalOrders) * 100 : 0,
    negativeReviewRate: totalOrders ? (negative / totalOrders) * 100 : 0,
    onTimeRate: totalOrders ? (onTime / totalOrders) * 100 : 0,
    lateRate: totalOrders ? (late / totalOrders) * 100 : 0,
    cancellationRate: totalOrders ? (canceled / totalOrders) * 100 : 0,
    completionRate: totalOrders ? ((totalOrders - canceled) / totalOrders) * 100 : 0,
    revenueFromNegative,
  }
}

export function byMonth(orders, months) {
  return months.map((m) => {
    const inMonth = orders.filter((o) => o.month === m)
    return {
      month: m,
      label: m.slice(5) + "'" + m.slice(2, 4),
      revenue: inMonth.filter((o) => o.deliveryStatus !== 'canceled').reduce((s, o) => s + o.revenue, 0),
      orders: inMonth.length,
      lateRate: inMonth.length ? (inMonth.filter((o) => o.deliveryStatus === 'late').length / inMonth.length) * 100 : 0,
      avgReview: inMonth.length ? inMonth.reduce((s, o) => s + o.reviewScore, 0) / inMonth.length : 0,
    }
  })
}

export function byCategory(orders, categories) {
  return categories
    .map((c) => {
      const inCat = orders.filter((o) => o.category === c.name)
      const revenue = inCat.filter((o) => o.deliveryStatus !== 'canceled').reduce((s, o) => s + o.revenue, 0)
      const negative = inCat.length ? (inCat.filter((o) => o.reviewScore <= 2).length / inCat.length) * 100 : 0
      return {
        category: c.name,
        revenue,
        orders: inCat.length,
        avgReview: inCat.length ? inCat.reduce((s, o) => s + o.reviewScore, 0) / inCat.length : 0,
        negativeRate: negative,
        freightRatio: c.freightRatio * 100,
      }
    })
    .filter((c) => c.orders > 0)
}

export function byState(orders, states) {
  return states
    .map((s) => {
      const inState = orders.filter((o) => o.state === s.name)
      const revenue = inState.filter((o) => o.deliveryStatus !== 'canceled').reduce((s2, o) => s2 + o.revenue, 0)
      const late = inState.length ? (inState.filter((o) => o.deliveryStatus === 'late').length / inState.length) * 100 : 0
      const avgDelay = inState.filter((o) => o.deliveryStatus === 'late')
      const delayDays = avgDelay.length ? avgDelay.reduce((s2, o) => s2 + o.deliveryDays, 0) / avgDelay.length : 0
      return {
        state: s.name,
        code: s.code,
        revenue,
        orders: inState.length,
        avgReview: inState.length ? inState.reduce((s2, o) => s2 + o.reviewScore, 0) / inState.length : 0,
        lateRate: late,
        avgDelayDays: delayDays,
        avgDeliveryDays: inState.length ? inState.reduce((s2, o) => s2 + o.deliveryDays, 0) / inState.length : 0,
      }
    })
    .filter((s) => s.orders > 0)
}

export function reviewDistribution(orders) {
  const total = orders.length || 1
  return [1, 2, 3, 4, 5].map((score) => {
    const count = orders.filter((o) => o.reviewScore === score).length
    return { score, count, pct: (count / total) * 100 }
  })
}

export function byDeliveryOutcome(orders) {
  const outcomes = ['on_time', 'late', 'canceled', 'other']
  const labels = { on_time: 'Delivered on-time', late: 'Delivered late', canceled: 'Canceled', other: 'Other' }
  return outcomes.map((key) => {
    const inGroup = orders.filter((o) => o.deliveryStatus === key)
    return {
      outcome: labels[key],
      key,
      avgReview: inGroup.length ? inGroup.reduce((s, o) => s + o.reviewScore, 0) / inGroup.length : 0,
      count: inGroup.length,
    }
  })
}

export function byDeliveryTimeBucket(orders) {
  const buckets = [
    { label: '≤7 days', min: 0, max: 7 },
    { label: '8–14 days', min: 8, max: 14 },
    { label: '15–21 days', min: 15, max: 21 },
    { label: '22–25 days', min: 22, max: 25 },
    { label: '26–35 days', min: 26, max: 35 },
    { label: '35+ days', min: 36, max: 9999 },
  ]
  const delivered = orders.filter((o) => o.deliveryStatus === 'on_time' || o.deliveryStatus === 'late')
  return buckets.map((b) => {
    const inBucket = delivered.filter((o) => o.deliveryDays >= b.min && o.deliveryDays <= b.max)
    const negative = inBucket.length ? (inBucket.filter((o) => o.reviewScore <= 2).length / inBucket.length) * 100 : 0
    return { label: b.label, negativeRate: negative, count: inBucket.length }
  })
}

export function sellerAggregates(orders) {
  const bySeller = {}
  orders.forEach((o) => {
    if (!bySeller[o.sellerId]) bySeller[o.sellerId] = []
    bySeller[o.sellerId].push(o)
  })
  return Object.entries(bySeller)
    .map(([sellerId, list]) => ({
      sellerId,
      orders: list.length,
      avgReview: list.reduce((s, o) => s + o.reviewScore, 0) / list.length,
      negativeRate: (list.filter((o) => o.reviewScore <= 2).length / list.length) * 100,
      revenue: list.reduce((s, o) => s + o.revenue, 0),
    }))
    .filter((s) => s.orders >= 15)
}
