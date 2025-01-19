'use client';

import React, { useState, useEffect } from 'react';

const StreamPage = () => {
  const [message, setMessage] = useState("");
  const [searchValue, setSearchValue] = useState("");

  const handleSearch = async () => {
    setMessage(""); // Clear previous results
    const response = await fetch(`/api/edge?value=${searchValue}`);
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let result = "";

    if (reader) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        result += decoder.decode(value);
        setMessage(result);
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center p-4 bg-white shadow-lg rounded-lg">
        <h1 className="text-xl font-semibold mb-4">Search Stream:</h1>
        <div className="mb-4">
          <input 
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="border p-2 rounded mr-2"
            placeholder="Enter search value"
          />
          <button 
            type="button"
            onClick={handleSearch}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Search
          </button>
        </div>
        <div className="text-lg font-mono whitespace-pre-line">{message}</div>
      </div>
    </div>
  );
};

export default StreamPage;