'use client';

import { useState, useEffect } from 'react';

export default function HomePage() {
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchMessage = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/hello`);
        const data = await response.text();
        setMessage(data);
      } catch (error) {
        console.error("Failed to fetch message:", error);
        setMessage("Failed to connect to backend.");
      }
    };

    fetchMessage();
  }, []);

  return (
    <main style={{ padding: '2rem' }}>
      <h1>Next.js Frontend</h1>
      <p>Message from Backend: <strong>{message}</strong></p>
    </main>
  );
}