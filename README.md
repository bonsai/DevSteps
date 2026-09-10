---
name: DevSteps
version: "1.1"
purpose: "GitHubを中心に、PJ開始から実装・検証・自動化・公開までを一貫して進める開発手順"
repository: "bonsai/DevSteps"

workflow:
  - start: "GitHubでrepositoryを作成。原則Private-first"
  - goal: "READMEにPJ GoalとDone条件を書く"
  - tasks: "Issuesに設計・調査・実装・検証タスクを書く"
  - implementation: "Codeに実装・成果物を置く"
  - automation: "WFでtest/build/deployを自動化する"
  - deploy: "Pages / Surge / Vercel / Cloudflare Pages等へDeploy"
  - automation_agents: "aw / UiPath等を必要に応じて接続する"

principles:
  - "README = Goal / 概要 / 使い方"
  - "Issues = Task / Design / Decision"
  - "Code = Implementation / Output"
  - "WF = Test / Build / Deploy / Automation"
  - "Pages = Public Output"
  - "Private-first = 開発途中の情報・Secrets・未完成成果物の公開リスクを抑える"

agent_behavior:
  before_work:
    - "READMEを読んでGoalを理解する"
    - "Issuesと現在のCode/WFを確認する"
    - "公開範囲とDeploy先を確認する"
  during_work:
    - "必要な作業をIssueへ分解する"
    - "Issueに完了条件を書く"
    - "実装をCodeへ置く"
    - "UiPathはGUI/RPA・業務自動化が適する箇所に利用する"
    - "awはrepo2agent・workflow生成・エージェント連携が適する箇所に利用する"
    - "WFで自動検証する"
  after_work:
    - "Test/Build/Deploy結果を確認する"
    - "READMEと実装の整合性を確認する"
    - "残作業をIssueとして残す"

definition_of_done:
  - "READMEにGoalがある"
  - "TasksがIssuesにある"
  - "ImplementationがCodeにある"
  - "WFで検証できる"
  - "必要ならDeployされている"
  - "公開範囲が意図した状態になっている"
---

# DevSteps

GitHub Repositoryを起点として、**Start → Goal → Issues → Code → WF → Deploy** を標準化する。

## Goal

PJの「何を作るか」だけでなく、**どこに設計を書くか、どこにタスクを書くか、どこに実装を置くか、どう検証・自動化・公開するか**を一つの手順にする。

## Standard Flow

### 1. Start

[GitHub](https://github.com/new) でRepositoryを作成する。原則として **Privateから開始**し、公開が必要になった時点でPublic化を判断する。

### 2. Goal

READMEに以下を書く。

- What
- Why
- Done
- Usage

### 3. Issues

設計・調査・UX・Architecture・Implementation・Test・DeployなどをIssueへ分解する。Issueには完了条件を持たせる。

### 4. Code

実装・成果物はRepositoryのCodeに置く。設計や未完了タスクはIssuesで追跡可能にする。

### 5. WF

GitHub Actions等で、可能な範囲を自動化する。

`install → lint → test → build → deploy`

プロジェクトに不要な工程は省略する。

### 6. Automation / Agents

#### UiPath

GUI操作、定型業務、既存Windowsアプリや業務システムとの連携など、**RPAが得意な現場作業**を自動化する候補として利用する。

#### aw

RepositoryのREADME・Issues・Code・WFを起点に、**repo2agent / workflow / agent coordination**へつなぐ候補として利用する。PJごとの状況から必要なAgentやWorkflowを生成・接続する役割を持たせる。

### 7. Deploy

公開が必要な場合は、プロジェクトに合う方式を選択する。

- GitHub Pages
- Surge
- Vercel
- Cloudflare Pages

## Security Default

**Private-first**をデフォルトとする。

- 開発途中の情報を不用意に公開しない
- SecretsをCodeへ置かない
- 未完成成果物を誤って公開しない
- 公開理由が明確になった時点でPublic化する

## Agent Rule

1. READMEを読んでGoalを理解する
2. Issuesを確認する
3. 必要ならIssueを追加する
4. Codeを変更する
5. WFで検証する
6. UiPath / aw等を必要な箇所へ接続する
7. 必要ならDeployする
8. 結果を確認する
9. 残作業をIssueとして残す

**GoalはREADME、TaskはIssue、ImplementationはCode、VerificationはWF、AutomationはAgent/RPA、ResultはDeploy。**
