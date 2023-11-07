import React, { useState } from "react";
import { FaSearch } from "react-icons/fa";

const SearchBar = ({ onSearch }) => {
  const [query, setQuery] = useState("");

  const handleSearch = () => {
    onSearch(query);
  };

  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      <div style={{ display: "flex", alignItems: "center" }}>
        <input
          type="text"
          placeholder="Pesquisar..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ height: "30px", padding: "3px", margin: "3px" }}
        />
        <button
          onClick={handleSearch}
          style={{ padding: "5px 10px", cursor: "pointer", width: "50px" }}
        >
          <FaSearch size={20} /> 
        </button>
      </div>
    </div>
  );
};

export default SearchBar;
