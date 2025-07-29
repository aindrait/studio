
"use client";

import { useState, useEffect } from 'react';
import type { AdminUser } from './types';
import { getSession } from './session';

type Session = Omit<AdminUser, 'password'> | null;

export function useSession() {
  const [session, setSession] = useState<Session>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSession() {
      try {
        const sessionData = await getSession();
        setSession(sessionData);
      } catch (error) {
        console.error("Failed to fetch session:", error);
        setSession(null);
      } finally {
        setLoading(false);
      }
    }

    fetchSession();
  }, []);

  return { session, loading };
}
