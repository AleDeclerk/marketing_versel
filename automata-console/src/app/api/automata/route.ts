import { NextResponse } from "next/server";

interface AutomataRequest {
  task: string;
}

interface AutomataResponse {
  status: string;
  summary: string;
  detected_intent: string;
  suggested_actions: string[];
  confidence: number;
}

const INTENT_MAP: Record<string, { intent: string; actions: string[]; summary: string }> = {
  data: {
    intent: "data_analysis",
    actions: [
      "validate input sources",
      "generate semantic model",
      "prepare downstream pipeline",
    ],
    summary: "Data analysis pipeline initialized. Sources validated and schema mapped.",
  },
  deploy: {
    intent: "deployment_orchestration",
    actions: [
      "run pre-deploy checks",
      "build production artifacts",
      "execute staged rollout",
    ],
    summary: "Deployment sequence prepared. All pre-flight checks passed.",
  },
  test: {
    intent: "quality_assurance",
    actions: [
      "generate test matrix",
      "execute regression suite",
      "compile coverage report",
    ],
    summary: "QA pipeline configured. Test matrix generated across target environments.",
  },
  monitor: {
    intent: "observability_setup",
    actions: [
      "instrument service endpoints",
      "configure alert thresholds",
      "initialize dashboard views",
    ],
    summary: "Observability layer activated. Metrics and alerting channels established.",
  },
  security: {
    intent: "security_audit",
    actions: [
      "scan dependency graph",
      "evaluate access policies",
      "generate compliance report",
    ],
    summary: "Security audit initiated. Dependency and policy analysis in progress.",
  },
};

const DEFAULT_RESPONSE = {
  intent: "general_automation",
  actions: [
    "parse task description",
    "classify automation intent",
    "generate execution plan",
  ],
  summary: "Automation pipeline executed successfully. Task classified and routed.",
};

function resolveIntent(task: string) {
  const lower = task.toLowerCase();
  for (const [keyword, value] of Object.entries(INTENT_MAP)) {
    if (lower.includes(keyword)) return value;
  }
  return DEFAULT_RESPONSE;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as AutomataRequest;

    if (!body.task || typeof body.task !== "string" || body.task.trim().length === 0) {
      return NextResponse.json(
        { error: "Field 'task' is required and must be a non-empty string." },
        { status: 400 },
      );
    }

    // Simulate processing latency
    await new Promise((resolve) => setTimeout(resolve, 600 + Math.random() * 400));

    const resolved = resolveIntent(body.task);
    const confidence = parseFloat((0.82 + Math.random() * 0.15).toFixed(2));

    const response: AutomataResponse = {
      status: "completed",
      summary: resolved.summary,
      detected_intent: resolved.intent,
      suggested_actions: resolved.actions,
      confidence,
    };

    return NextResponse.json(response);
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 },
    );
  }
}
