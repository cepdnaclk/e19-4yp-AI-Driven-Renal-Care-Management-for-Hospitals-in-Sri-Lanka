import React from 'react'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  id?: string
  className?: string
}

const SearchBar: React.FC<SearchBarProps> = ({ value, onChange, placeholder = '', disabled = false, id = 'search-input', className = 'search-input' }) => {
  return (
    <div className="search-box">
      <div className="search-input-wrapper">
        <i className="search-icon bi bi-search" aria-label="search"></i>
        <input
          id={id}
          type="text"
          value={value}
          onChange={e => onChange(e.currentTarget.value)}
          placeholder={placeholder}
          className={className}
          disabled={disabled}
        />
      </div>
    </div>
  )
}

export default SearchBar
