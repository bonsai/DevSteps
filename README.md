# DevSteps

> AI時代の開発プロセスを、Agent実行契約とHuman向けGuideに分離して運用する。

## Documents

- **[AGENT.md](AGENT.md)** — Agentへの正規指示書。Ontology / Actor / Owner / Scope / Decision Boundary / Block / Edge / Demand / Gate / 実行規則。
- **[guide.html](guide.html)** — Human向け説明書。DevStepsの背景、考え方、役割分担、プロセス、Graph / YAMLをわかりやすく説明。
- **[Issues](../../issues)** — Design / Task / ADR / Decision Record。

## Source of Truth

```text
YAML ontology
     │
     ├── AGENT.md  → Agent execution contract
     ├── React      → Graph UI
     └── Issues     → ADR / Design / Decision history
```

YAMLのBlockとEdgeがプロセスの正本。GUIはそのビュー/編集面として扱い、AgentはAGENT.mdの契約に従う。

## Core Idea

**決まっている部分はAIが止めずに進め、未決定部分だけHuman + AIで決める。**

```text
Human Declare
      ↓
AI Expand → Execute
      ↓
AI Detect
      ↓
Demand
      ↓
Human + AI Decide
      ↓
Update YAML
      ↓
Continue
      ↓
Gate
```

## Repository Role

- README = 入口・目次
- AGENT.md = Agent指示・契約
- guide.html = Human説明
- Issues = Design / Task / ADR
- Code = Implementation / Output
- WF = Test / Build / Deploy / Automation
- YAML = Process / GraphのSingle Source of Truth

## ADR

現在の文書分離方針は **[ADR #2](../../issues/2)** に記録している。
