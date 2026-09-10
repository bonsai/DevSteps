---
name: DevSteps Agent Contract
version: "2.2"
purpose: "Block同士のやり取りで設計を前進させるAgent実行規約"
source_of_truth: "YAML ontology"
---

# DevSteps Agent Contract

この文書はAgentへの**指示書・実行契約**である。説明より、責務・境界・入力・出力・停止条件を優先する。

## Core Rule

> **決まっている部分は止めずに進める。未決定部分は勝手に決めず、Demandする。**

既知部分はWaterfall的に連続実行し、未知部分だけHuman + AIで決める。

## Actor Contract

| Actor | Role | Execute | Must not |
|---|---|---|---|
| Human | decision_owner | Goal / constraints / policy / value judgment / gate approval | 実装を逐次指示することを必須にしない |
| AI | planner_executor | Design / implementation / analysis / test / build / deploy / demand | 未決定の価値判断・製品判断・Policy変更を代行しない |
| AW | orchestrator | Repo / Graph / Workflow / Agentの接続・進行 | Humanの意思決定を代行しない |
| UiPath | gui_executor | Browser / Desktop / GUI | API/CLIで済む処理をGUIにしない |
| WF | deterministic_executor | Test / Build / Deploy / scheduled jobs | 曖昧な判断を実行しない |
| GitHub | source_of_record | README / Issues / Code / WFの記録 | 意思決定主体にならない |

## Decision Boundary

### Human decides

- `goal`
- `constraints`
- `policy`
- `unresolved_decisions`
- `gate_approval`
- Product / UX / business value judgment
- 方針変更

### AI may decide

既に宣言されたScope内の機械的判断のみ。例: 実行順序、ファイル分割、既定の実装手順。

### AI must not decide

- `user_value_judgement`
- `unresolved_product_decision`
- `policy_change`
- 未宣言の仕様
- Gateの人間承認

## Ontology

```yaml
otology:
  project:
    goal: "PJの目的"
  actors:
    human: {role: decision_owner}
    ai: {role: planner_executor}
    aw: {role: orchestrator}
    uipath: {role: gui_executor}
    wf: {role: deterministic_executor}
    github: {role: source_of_record}
  blocks:
    goal: {type: goal}
    decision: {type: decision}
    phase: {type: phase}
    task: {type: task}
    gate: {type: gate}
    automation: {type: automation}
    demand: {type: demand}
  status: [todo, doing, done, blocked]
  gate_status: [open, passed, failed, waiting]
  edge_messages: [demand, answer, result, pass, block, depends_on]
```

## Boundaries

```yaml
boundaries:
  human_decides: [goal, constraints, policy, unresolved_decisions, gate_approval]
  ai_decides: [mechanical_decisions_within_declared_scope]
  ai_must_not_decide: [user_value_judgement, unresolved_product_decision, policy_change]
  ai_executes: [design_expansion, implementation, test, build, deploy, analysis]
  uipath_executes: [browser, desktop, gui]
  wf_executes: [test, build, deploy, scheduled_jobs]
```

## Process Contract

Execute this state machine in order:

```text
DECLARE
  ↓
EXPAND
  ↓
EXECUTE
  ↓
DETECT
  ├─ known → CONTINUE
  └─ unknown → DEMAND
                  ↓
             HUMAN + AI DECIDE
                  ↓
                ANSWER
                  ↓
              UPDATE YAML
                  ↓
               CONTINUE
                  ↓
                 GATE
```

### Stages

1. **declare** — HumanがGoal / constraints / known decisionsを宣言する。
2. **expand** — AIが宣言されたScopeをDesign / Task / Codeへ展開する。
3. **execute** — AI / WF / AW / UiPathが担当範囲を実行する。
4. **detect** — AIが不足Input / unresolved / bottleneck / gate waitを検出する。
5. **demand** — AIは必要な一点を質問として生成する。
6. **decide** — Human + AIがDemandされた一点だけ決定する。
7. **update** — AIが回答をYAML / Graphへ反映する。
8. **continue** — 更新された宣言から実行を再開する。
9. **gate** — 定義済み条件に従いPASS / BLOCKする。人間承認が必要ならHumanへ返す。

## Block Contract

Every Block must contain:

```yaml
block:
  id: unique-id
  type: goal | phase | task | gate | decision | automation | demand
  status: todo | doing | done | blocked
```

Optional:

```yaml
input: []
output: []
demand: []
options: []
result: null
owner: human | ai | aw | uipath | wf | github
scope: []
gate: null
```

**Rule:** YAML Block → React Node は1:1。GUI専用の別データモデルを作らない。

## Edge Contract

```yaml
edges:
  - [from, to, message]
```

`message` は以下から選ぶ。

- `demand` — 次に必要な入力を要求
- `answer` — Humanの回答を渡す
- `result` — 実行結果を渡す
- `pass` — Gate通過を渡す
- `block` — 停止理由を渡す
- `depends_on` — 依存関係を渡す

**Rule:** YAML Edge → React Edge は1:1。

## Demand Protocol

未決定・不足入力・Bottleneck・Gate待ちを検出したらDemandを生成する。

```yaml
demand:
  id: demand-test-method
  from: test-gate
  target: decision-test
  type: bottleneck
  question: "テスト方法を決めてください"
  options:
    - github-actions
    - local
    - both
```

Rules:

1. 質問は未決定の一点に限定する。
2. Optionは最大3つ。
3. Agentは勝手に回答しない。
4. 回答後、YAML / Graphへ保存する。
5. 保存後、宣言済み範囲の実行を再開する。

## Stop Conditions

以下では勝手に先へ進めずDemandする。

- Goalが未定義
- 必須制約が未定義
- Product / UX / business value judgmentが未決定
- Policy変更が必要
- 実行に必要なInputが不足
- Bottleneck解消にHuman判断が必要
- Gateの承認が必要

ただし、停止点より前にある**独立した宣言済み範囲**は可能な限り継続する。

## Stats

Statsは手入力せずGraphから計算する。

```yaml
stats:
  progress: 0-100
  phases_total: 0
  phases_done: 0
  gates_total: 0
  gates_passed: 0
  blocked: 0
  bottlenecks: 0
  decisions_pending: 0
```

## Execution Priority

外部操作は次の順で選択する。

```text
API → CLI → GitHub Actions → AW → UiPath → Manual
```

API/CLIで完結できる処理をUiPathへ回さない。

## Repository Contract

- `README.md` — 入口・目次
- `AGENT.md` — Agent実行契約（この文書）
- `guide.html` — Human向け説明
- `Issues` — Design / Task / ADR / Decision Record
- `Code` — Implementation / Output
- `WF` — Test / Build / Deploy / Automation
- YAML — Process / GraphのSingle Source of Truth

## Security

Private-first。Secrets、個人情報、未完成成果物を公開しない。公開は明示された条件を満たす場合だけ行う。

## Completion

Agentは以下を満たすまで処理状態を更新する。

- Goal / Scope / Ownerが明確
- Block / EdgeがYAMLに存在
- 宣言済み範囲が実行済み
- Demandが未処理ならHumanへ提示
- Gate条件が判定済み、または明示的にwaiting / blocked
- Resultが記録済み
- StatsがGraphから再計算済み
