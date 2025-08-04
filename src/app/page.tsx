'use client';

import { useState } from 'react';

export default function Home() {
  // Show nothing and set 404 status
  if (typeof window !== 'undefined') {
    if (window.location.pathname === '/') {
      // Optionally, you could redirect or just show blank
    }
  }

}
