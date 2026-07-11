// olistData.js — re-exports the mock generator and adds lookup constants
// used by Sidebar, TopBar, and page components.

export { generateOrders, CATEGORY_LIST, REGION_LIST, MONTH_LIST } from './mockData.js'

export const YEARS = [2016, 2017, 2018]

export const STATES = [
  { code: 'SP', name: 'São Paulo' },
  { code: 'RJ', name: 'Rio de Janeiro' },
  { code: 'MG', name: 'Minas Gerais' },
  { code: 'RS', name: 'Rio Grande do Sul' },
  { code: 'PR', name: 'Paraná' },
  { code: 'SC', name: 'Santa Catarina' },
  { code: 'BA', name: 'Bahia' },
  { code: 'DF', name: 'Distrito Federal' },
  { code: 'GO', name: 'Goiás' },
  { code: 'PE', name: 'Pernambuco' },
]

export const CATEGORIES = [
  { name: 'Electronics' },
  { name: 'Apparel' },
  { name: 'Home & Garden' },
  { name: 'Beauty' },
  { name: 'Sports' },
]
