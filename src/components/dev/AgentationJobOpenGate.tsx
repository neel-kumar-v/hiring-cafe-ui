"use client";

import { useEffect } from "react";
import { installAgentationJobOpenGate } from "@/lib/jobs/agentationJobOpenGate";

/** Installs the capture-phase click tracker used by shouldOpenJobFromUserClick. */
export function AgentationJobOpenGate() {
  useEffect(() => {
    installAgentationJobOpenGate();
  }, []);
  return null;
}
