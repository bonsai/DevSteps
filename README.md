---
name: DevSteps
version: "2.1"
purpose: "Block同士のやり取りで設計を前進させる、GitHub中心のProject/Agent ontology"
repository: "bonsai/DevSteps"

otology:
  project:
    goal: "PJの目的"
  actors:
    human:
      role: decision_owner
      responsibility: "目的・制約・価値判断・未決定事項を決める"
    ai:
      role: planner_executor
      responsibility: "宣言された設計を展開・実装・検証し、未決定だけをDemandする"
    aw:
      role: orchestrator
      responsibility: "Repository/Graph/Workflowを読み、AgentとWFを接続・進行させる"
    uipath:
      role: gui_executor
      responsibility: "API/CLIで扱えない外部GUI操作を実行する"
    wf:
      role: deterministic_executor
      responsibility: "Test/Build/Deploy等の再現可能な処理を実行する"
    github:
      role: source_of_record
      responsibility: "README/Issues/Code/WFを成果・設計・実装・自動化の記録として保持する"
  boundaries:
    human_decides: [goal, constraints, policy, unresolved_decisions, gate_approval]
    ai_decides: ["実行順序など、既に宣言された範囲内の機械的判断"]
    ai_must_not_decide: ["user_value_judgement", "unresolved_product_decision", "policy_change"]
    ai_executes: [design_expansion, implementation, test, build, deploy, analysis]
    uipath_executes: [browser, desktop, gui]
    wf_executes: [test, build, deploy, scheduled_jobs]
  blocks:
    goal: {type: goal}
    decision: {type: decision}
    phase: {type: phase}
    task: {type: task}
    gate: {type: gate}
    automation: {type: automation}
    demand: {type: demand}
  status:
    todo: "未着手"
    doing: "進行中"
    done: "完了"
    blocked: "停止"
  gate_status:
    open: "判定待ち"
    passed: "通過"
    failed: "不通過"
    waiting: "入力待ち"
  edge_messages:
    demand: "次に必要な入力を要求"
    answer: "人間の回答を渡す"
    result: "実行結果を渡す"
    pass: "Gate通過を渡す"
    block: "停止理由を渡す"
    depends_on: "依存関係を渡す"
  stats:
    progress: "0-100"
    phases_total: 0
    phases_done: 0
    gates_total: 0
    gates_passed: 0
    blocked: 0
    bottlenecks: 0
    decisions_pending: 0

process:
  name: declarative-development
  principle: "決まっている部分はAIが通し、未決定部分だけHumanとAIが共同で決める"
  stages:
    - id: declare
      owner: human
      does: "Goal / constraints / known decisionsを宣言"
      output: "declarative_spec"
    - id: expand
      owner: ai
      does: "宣言された範囲をDesign / Task / Codeへ展開"
      output: "implementation_plan"
    - id: execute
      owner: ai
      does: "実装・Test・Build・Deployを可能な範囲まで実行"
      output: "result"
    - id: detect
      owner: ai
      does: "未決定・不足input・Bottleneck・Gate待ちを検出"
      output: "demand"
    - id: decide
      owner: human_ai
      does: "Demandされた一点だけ共同で決定"
      output: "answer"
    - id: update
      owner: ai
      does: "回答をYAML/Graphへ反映"
      output: "updated_spec"
    - id: continue
      owner: ai
      does: "更新された宣言から処理を再開"
      output: "next_result"
    - id: gate
      owner: human_or_policy
      does: "定義済み条件に対してPASS/BLOCKを判定"
      output: "gate_status"
  rule: "既知部分はWaterfall的に連続実行し、未知部分だけAgile的に対話する"

block_contract:
  required: [id, type, status]
  optional: [input, output, demand, options, result, owner, scope, gate]
  rule: "YAMLのBlockをReactのNodeへ1:1変換する"

edge_contract:
  format: "[from, to, message]"
  rule: "YAMLのEdgeをReactのEdgeへ1:1変換する"

agent:
  role: demand-agent
  mode: block_exchange
  behavior:
    - "BlockとEdgeを読む"
    - "宣言済み範囲は止めずに進める"
    - "不足inputを検出する"
    - "Bottleneckを検出する"
    - "Decisionが必要ならDemandを生成する"
    - "最大3つまでOptionを提示する"
    - "回答をBlockへ戻す"
    - "StatsをGraphから再計算する"
  constraints:
    mechanically_ask: true
    solve_problem: false
    decide_for_user: false
    execute_within_declared_scope: true
    max_options: 3

workflow:
  - start: "GitHub Repositoryを作成。原則Private-first"
  - declare: "Goal / constraints / known decisionsを定義"
  - expand: "AIが既知部分を設計へ展開"
  - execute: "AI / WF / AW / UiPathが担当範囲を実行"
  - demand: "未決定部分だけDemand"
  - decide: "Human + AIで一点を決定"
  - update: "YAML / Graphへ反映"
  - continue: "AIが処理を再開"
  - gate: "条件を満たせばPASS、未達ならBLOCK"
  - deploy: "必要ならPages等へ公開"
---

# DevSteps

**AI時代の開発を「宣言された部分は一気に進め、未決定部分だけ共同で決める」プロセスとして定義する。**

## Core Principle

従来のAgileは「最初からすべてはわからない」ことを前提に、小さく作って学習する。

一方、AIは宣言された目的・制約・設計を受け取れば、Design → Code → Test → Build → Deployまで連続して展開できる。

したがってDevStepsでは、AgileとWaterfallを対立させない。

> **既知部分はWaterfall的に通し、未決定部分だけAgile的に対話する。**

人間はすべてを逐次指示する必要はない。AIも未決定事項を勝手に決めない。

```text
Human: Declare
        ↓
AI: Expand → Execute
        ↓
AI: Detect unresolved point
        ↓
Demand
        ↓
Human + AI: Decide
        ↓
AI: Update → Continue
        ↓
Gate: Pass / Block
```

## Who Does What

| Actor | すること | しないこと | どこまで |
|---|---|---|---|
| Human | Goal、制約、価値判断、未決定事項、Gate承認 | 全実装の逐次指示 | 意思決定まで |
| AI | 設計展開、実装、解析、Test、Build、Deploy、Demand | 未決定の価値判断を代行 | 宣言された範囲＋Demand生成まで |
| AW | Repo/Graph/WF/Agentの接続、進行 orchestration | 人間の意思決定代行 | Workflow接続・進行まで |
| UiPath | Browser/Desktop/GUI操作 | APIで済む処理 | GUI実行まで |
| WF | Test/Build/Deploy/定期処理 | 曖昧な判断 | 決められた手順の実行まで |
| GitHub | 設計・実装・実行結果を記録 | 意思決定 | Source of Record |

## Process Ontology

```text
DECLARE
  │ Human
  ▼
GOAL / CONSTRAINT / DECISION
  │
  ▼
EXPAND ── AI
  │
  ▼
EXECUTE ── AI / WF / AW / UiPath
  │
  ▼
DETECT ── AI
  │
  ├── known → CONTINUE
  │
  └── unknown → DEMAND
                    │
                    ▼
              HUMAN + AI
                    │
                    ▼
                  ANSWER
                    │
                    ▼
                UPDATE YAML
                    │
                    ▼
                 CONTINUE
                    │
                    ▼
                   GATE
```

## Decision Boundary

AIが止まる条件を明示する。

- Goalが未定義
- 必須制約が未定義
- Product/UXなどの価値判断が未決定
- Policy変更が必要
- Gate承認が必要
- 実行に必要な入力が不足
- Bottleneckを解消する人間判断が必要

逆に、すでに宣言された範囲の実装・変換・テスト・ビルド・デプロイは、AIが機械的に進める。

## Block Exchange

1. Blockを読む
2. 宣言済みなら次へ進む
3. 未決定・不足情報を検出する
4. Demandを作る
5. ユーザーに機械的にAskする
6. 必要ならOptionを最大3つ提示する
7. 回答をBlockへ保存する
8. YAML / Graphを更新する
9. AIが処理を再開する
10. GateでPASS / BLOCKする

Agentは**問題を勝手に解決しない**。ただし、すでに決められた範囲の実行は止めない。

### Demand example

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

## Graph = Process State

Graphは単なる進捗表ではなく、**誰が何をどこまで実行し、どこで人間の判断が必要なのかを表すProcess State**である。

- Node = Block / Responsibility
- Edge = Message / Relation
- Owner = 誰が担当するか
- Scope = どこまで実行してよいか
- Demand = 次に必要な人間入力
- Result = 実行結果
- Gate = 次工程へ進む条件

YAMLがSingle Source of Truth。YAMLのBlockはReact GraphのNode、YAMLのEdgeはGraphのEdgeになる。GUI専用の別データモデルを作らない。

## Bottleneck / Gate / Stats

`blocked` なBlock、未回答のDecision、未通過GateをGraphから検出する。Statsは手入力せずGraphから計算する。

```text
Progress 62%   Phase 3/5   Gate 2/4
Blocked 1      Bottleneck 1   Decisions 2
```

## GUI

最小React Graph GUIを正本YAMLのビュー/編集面として扱う。

- Node = Block
- Edge = Message/Relation
- Owner = 担当Actor
- Scope = 実行範囲
- Node status = 進行状態
- Gate = 通過条件
- Demand = 次に必要な入力
- Stats = Graphから算出

## Automation

### aw

RepositoryのREADME・Issues・Code・WFとBlock Graphを読み、repo2agent / workflow / agent coordinationへ接続する。

### UiPath

APIやCLIで扱えないGUI/RPA業務をAutomation Blockとして接続する。APIがある場合はAPIを優先する。

### WF

Test / Build / Deploy / Stats更新など、機械的に再現できる処理を自動化する。

## Repository Roles

- README = Goal / Ontology / Usage
- Issues = Design / Task / Decision record
- Code = Implementation / Output
- WF = Test / Build / Deploy / Automation
- SVG = README用Progress Snapshot
- React = Interactive Graph GUI
- Agent = Demand / Exchange orchestration

## Security Default

**Private-first**。Secrets、個人情報、未完成成果物を公開しない。公開は必要性を確認してから行う。

## Definition of Done

- Goal Blockがある
- Actor / Owner / Scopeが定義されている
- Phase / Task / GateがGraph化されている
- DecisionはDemandとして質問できる
- BlockとEdgeがYAMLとGUIで1:1対応する
- BottleneckとStatsをGraphから取得できる
- Agentは最大3 Optionを提示できる
- Agentは未決定の意思決定を勝手に行わない
- 宣言済み範囲はAIが継続実行できる
- READMEに静的SVGを表示できる
- 必要なAutomation / WF / Deployが接続されている
