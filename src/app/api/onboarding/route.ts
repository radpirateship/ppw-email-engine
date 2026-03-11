// ============================================================================
// PPW Email Engine — Onboarding API
// Returns the full onboarding structure (steps, phases, milestones).
// Progress is tracked client-side via localStorage.
// ============================================================================

import { NextResponse } from "next/server";
import {
  ALL_STEPS,
  PHASES,
  MILESTONES,
  STEP_COUNTS,
  getStepsByPhase,
} from "@/framework/onboarding";

export async function GET() {
  const phases = PHASES.map((phase) => ({
    ...phase,
    steps: getStepsByPhase(phase.id),
  }));

  return NextResponse.json({
    phases,
    milestones: MILESTONES,
    counts: STEP_COUNTS,
    totalSteps: ALL_STEPS.length,
    totalEstimatedMinutes: ALL_STEPS.reduce((s, step) => s + step.estimatedMinutes, 0),
  });
}
