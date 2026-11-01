"use client";

import { AgentationJobOpenGate } from "@/components/dev/AgentationJobOpenGate";
import { Agentation } from "agentation";
import { useEffect, useState } from "react";

/**
 * Dev-only Agentation toolbar. Endpoint follows the page hostname so
 * Tailscale (`http://100.x.x.x:3004`) posts to the same host on :4747
 * instead of being stuck on a CORS-blocked localhost origin store.
 */
export function AgentationDev() {
  const [endpoint, setEndpoint] = useState("http://localhost:4747");

  useEffect(() => {
    const host = window.location.hostname || "localhost";
    setEndpoint(`http://${host}:4747`);
  }, []);

  return (
    <>
      <AgentationJobOpenGate />
      <Agentation endpoint={endpoint} />
    </>
  );
}
