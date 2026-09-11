---
name: superpower
description: Core software development methodology and agentic skills framework (Superpowers by Jesse Vincent / Prime Radiant). Enforces disciplined workflows: brainstorming, writing implementation plans, test-driven development (TDD), systematic debugging, subagent-driven development, code review, and verification before completion.
---

# Superpower Development Methodology

Superpowers is a complete software development methodology for coding agents, built on top of a composable skills library and disciplined engineering practices.

## Core Principles

- **Test-Driven Development (TDD)**: Write tests first, always. Follow the strict RED-GREEN-REFACTOR cycle.
- **Systematic over ad-hoc**: Process over guessing. Find root causes before applying fixes.
- **Complexity reduction**: Simplicity as primary goal (YAGNI, DRY).
- **Evidence over claims**: Verify with automated test suites before declaring success.

## Skills in the Superpower Suite

| Skill | When to Activate | Description |
| :--- | :--- | :--- |
| `brainstorming` | Before writing code | Socratic design refinement, exploring alternatives, writing specifications into `docs/superpowers/specs/`. |
| `writing-plans` | After design approval | Breaks approved designs into bite-sized tasks (2-5 minutes each) with exact file paths, complete code, and verification steps into `docs/superpowers/plans/`. |
| `subagent-driven-development` | Executing implementation plans | Dispatches fresh subagent per task with two-stage review (spec compliance, then code quality). |
| `executing-plans` | Executing plans with human checkpoints | Batch execution with human review checkpoints. |
| `test-driven-development` | During code implementation | Strict RED-GREEN-REFACTOR cycle: write failing test, observe failure, write minimal code, observe pass, commit. |
| `systematic-debugging` | When encountering bugs or test failures | 4-phase root cause process: root-cause tracing, defense-in-depth, condition-based waiting. |
| `requesting-code-review` | Between tasks / before merge | Pre-review checklist against plan and specification. |
| `receiving-code-review` | When addressing review findings | Responding to feedback and verifying fixes. |
| `verification-before-completion` | Before completing any task | Run automated test suites and linters before reporting completion. |
| `using-git-worktrees` | Before starting implementation | Parallel development branches in isolated worktrees. |
| `finishing-a-development-branch` | When all tasks complete | Merge/PR decision workflow and clean integration. |
| `dispatching-parallel-agents` | Parallelizable independent tasks | Concurrent subagent workflows. |
| `using-superpowers` | Starting any conversation | Entry point and bootstrap for skill invocation. |
| `writing-skills` | Creating or updating skills | Create new skills following best practices. |

## Platform Adaptation for Antigravity

- **Subagent dispatching**: Use `invoke_subagent` with `TypeName: self` for full write/execution capabilities, or `research` for read-only exploration.
- **Task tracking**: Maintain markdown task checklists with `- [ ]` and `- [x]`.
- **Directory conventions in this project**:
  - Specifications: `docs/superpowers/specs/`
  - Implementation plans: `docs/superpowers/plans/`