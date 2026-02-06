import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";

export function useHealth(intervalMs = 15000) {
  const [healthy, setHealthy] = useState<boolean | null>(null);
  const timer = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    const check = () =>
      api.health().then(() => setHealthy(true)).catch(() => setHealthy(false));
    check();
    timer.current = setInterval(check, intervalMs);
    return () => clearInterval(timer.current);
  }, [intervalMs]);

  return healthy;
}
