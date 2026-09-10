---
name: DevSteps
version: "2.0"
purpose: "Block同士のやり取りで設計を前進させる、GitHub中心のProject/Agent ontology"
repository: "bonsai/DevSteps"

otology:
  project:
    goal: "PJの目的"
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

block_contract:
  required: [id, type, status]
  optional: [input, output, demand, options, result]
  rule: "YAMLのBlockをReactのNodeへ1:1変換する"

edge_contract:
  format: "[from, to, message]"
  rule: "YAMLのEdgeをReactのEdgeへ1:1変換する"

agent:
  role: demand-agent
  mode: block_exchange
  behavior:
    - "BlockとEdgeを読む"
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
    max_options: 3

workflow:
  - start: "GitHub Repositoryを作成。原則Private-first"
  - goal: "Goal Blockを定義"
  - exchange: "Block → Demand → Answer → Block"
  - phase: "Phase Blockを進める"
  - task: "Task Blockを実行"
  - gate: "Gateで通過/停止を判定"
  - automation: "aw / UiPath / WFを必要なBlockへ接続"
  - deploy: "必要ならPages等へ公開"
---

# DevSteps

**設計を文章の積み重ねではなく、Block同士のやり取りとして進める。**

```text
Goal → Decision → Phase → Task → Gate
  ↑       ↓          ↓       ↓      │
  └──── Answer ←── Demand ← Result ←┘
```

## Core Model

YAMLがSingle Source of Truth。YAMLのBlockはReact GraphのNode、YAMLのEdgeはGraphのEdgeになる。GUI専用の別データモデルを作らない。

```yaml
nodes:
  goal:
    type: goal
    status: doing
  decision:
    type: decision
    status: waiting
    demand: "公開方法を決めてください"

edges:
  - [goal, decision, demand]
```

Edgeは単なる線ではなく、**Block間で何を渡すか**を表す。

- `demand` — 次に必要な入力を要求
- `answer` — ユーザーの回答
- `result` — 実行結果
- `pass` — Gate通過
- `block` — 停止
- `depends_on` — 依存関係

## Block Exchange

1. Blockを読む
2. 次のBlockに不足情報をDemandする
3. ユーザーに機械的にAskする
4. 必要ならOptionを最大3つ提示する
5. ユーザーの回答をBlockへ保存する
6. 次のBlockへ渡す
7. Gateで進行を判定する
8. Statsを更新する

Agentは**問題を勝手に解決しない**。現在のGraphから「次に何を聞けば進むか」をDemandするだけ。

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
- Node status = 進行状態
- Gate = 通過条件
- Demand = 次に必要な入力
- Stats = Graphから算出

Node位置などのレイアウト情報も永続化する場合は、意味情報と混ぜず `layout` として管理する。

## README Visualization

GitHub README内にReactアプリを直接埋め込むのではなく、**SVGによる静的Graph**を表示する。React版はGitHub Pages等でインタラクティブに操作する。

```html
<img src="./graph.svg" alt="DevSteps progress graph">
```

SVGは現在のBlock / Edge / Bottleneck / Demandを最小限に表示する。

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
- Phase / Task / GateがGraph化されている
- DecisionはDemandとして質問できる
- BlockとEdgeがYAMLとGUIで1:1対応する
- BottleneckとStatsをGraphから取得できる
- Agentは最大3 Optionを提示できる
- Agentは勝手に意思決定しない
- READMEに静的SVGを表示できる
- 必要なAutomation / WF / Deployが接続されている
