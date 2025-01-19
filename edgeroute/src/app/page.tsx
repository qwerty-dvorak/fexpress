'use client';

import React, { useState, useEffect } from 'react';

const StreamPage = () => {
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function fetchStream() {
      const response = await fetch('/api/edge');
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
    }
    fetchStream();
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center p-4 bg-white shadow-lg rounded-lg">
        <h1 className="text-xl font-semibold mb-4">Streaming Message:</h1>
        <div className="text-lg font-mono">{message}</div>
      </div>
    </div>
  );
};

export default StreamPage;
