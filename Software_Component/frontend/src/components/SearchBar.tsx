import React from 'react'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
}

const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder = '',
  disabled = false
}) => {
  return (
    <div id="searchbar-container">
      <div id="searchbar-wrapper">
        <div id="search-icon-container">
          <i className="bi bi-search search-icon-modern" aria-label="search"></i>
        </div>
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.currentTarget.value)}
          placeholder={placeholder}
          className="search-input"
          disabled={false}
        />
        {value && (
          <button
            type="button"
            id="searchbar-clear-btn"
            onClick={() => onChange('')}
            aria-label="Clear search"
          >
            <i className="bi bi-x-circle-fill"></i>
          </button>
        )}
      </div>
    </div>
  )
}

export default SearchBar