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
          style={{ height: "20px", width: "100%", padding: "3px", margin: "1px", marginTop: "14px" }}
        />
        <button
          onClick={handleSearch}
          style={{ padding: "5px 10px", height: "24px",cursor: "pointer", width: "30px", color: "white",  marginTop: "13px" }}
        >
          <FaSearch size={12} /> 
        </button>
      </div>
    </div>
  );
};

export default SearchBar;
