# Squad Team

> Pac-Man Style Arcade Game

## Coordinator

| Name | Role | Notes |
|------|------|-------|
| Squad | Coordinator | Routes work, enforces handoffs and reviewer gates. |

## Members

| Name | Role | Charter | Status |
|------|------|---------|--------|
| Blinky | Lead | 🏗️ Lead | .squad/agents/blinky/charter.md |
| Inky | Core Dev | 🔧 Core Dev | .squad/agents/inky/charter.md |
| Pinky | Graphics Dev | ⚛️ Graphics Dev | .squad/agents/pinky/charter.md |
| Clyde | Tester | 🧪 Tester | .squad/agents/clyde/charter.md |
| Scribe | Session Logger | 📋 Scribe | .squad/agents/scribe/charter.md |
| Ralph | Work Monitor | 🔄 Monitor | — |


## Coding Agent

<!-- copilot-auto-assign: true -->

| Name | Role | Charter | Status |
|------|------|---------|--------|
| @copilot | Coding Agent | — | 🤖 Coding Agent |

### Capabilities

**🟢 Good fit — auto-route when enabled:**
- Bug fixes with clear reproduction steps
- Test coverage (adding missing tests, fixing flaky tests)
- Lint/format fixes and code style cleanup
- Dependency updates and version bumps
- Small isolated features with clear specs
- Boilerplate/scaffolding generation
- Documentation fixes and README updates

**🟡 Needs review — route to @copilot but flag for squad member PR review:**
- Medium features with clear specs and acceptance criteria
- Refactoring with existing test coverage
- API endpoint additions following established patterns
- Migration scripts with well-defined schemas

**🔴 Not suitable — route to squad member instead:**
- Architecture decisions and system design
- Multi-system integration requiring coordination
- Ambiguous requirements needing clarification
- Security-critical changes (auth, encryption, access control)
- Performance-critical paths requiring benchmarking
- Changes requiring cross-team discussion

## Project Context

- **Owner:** Guy Bertental
- **Project:** Pac-Man style arcade game
- **Stack:** TBD
- **Created:** 2026-03-15
