import { createContext, useContext, useState } from 'react'

const FilterContext = createContext(null)

export function FilterProvider({ children }) {
  const [years, setYears] = useState([])
  const [state, setState] = useState('')
  const [category, setCategory] = useState('')

  function toggleYear(y) {
    setYears((prev) => (prev.includes(y) ? prev.filter((x) => x !== y) : [...prev, y]))
  }

  function reset() {
    setYears([])
    setState('')
    setCategory('')
  }

  return (
    <FilterContext.Provider value={{ years, toggleYear, state, setState, category, setCategory, reset }}>
      {children}
    </FilterContext.Provider>
  )
}

export function useFilters() {
  return useContext(FilterContext)
}
