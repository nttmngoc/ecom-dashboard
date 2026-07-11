import { createContext, useContext, useState } from 'react'

const FilterContext = createContext(null)

export function FilterProvider({ children }) {
  const [state, setState] = useState('')
  const [category, setCategory] = useState('')
  const [years, setYears] = useState([2016, 2017, 2018])

  function reset() {
    setState('')
    setCategory('')
    setYears([2016, 2017, 2018])
  }

  function toggleYear(y) {
    setYears((prev) =>
      prev.includes(y) ? prev.filter((x) => x !== y) : [...prev, y]
    )
  }

  return (
    <FilterContext.Provider value={{ state, setState, category, setCategory, years, toggleYear, reset }}>
      {children}
    </FilterContext.Provider>
  )
}

export function useFilters() {
  const ctx = useContext(FilterContext)
  if (!ctx) throw new Error('useFilters must be used inside FilterProvider')
  return ctx
}
