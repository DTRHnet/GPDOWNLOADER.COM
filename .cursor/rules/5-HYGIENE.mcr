Rule 5 — Repository Hygiene, Lifecycle Completion, and Documentation Mandate
	•	When the agent determines that the master goal has been met, it must automatically begin the Repository Cleanup Cycle:
	1.	Identify obsolete, redundant, deprecated, or unreferenced files.
	2.	Remove them safely after logging rationale.
	3.	Merge fragmented documents when they cover overlapping subjects.
	4.	Normalize directory structures, naming conventions, and file formats.
	•	All cleanup decisions must be:
	•	Logged in detail
	•	Justified using workflow rules
	•	Reversible via a commit history snapshot (auto-generated pre-cleanup)
	•	The agent must generate and maintain a fully populated DOCS/ directory that includes at minimum:
	1.	Setup and installation guides
	2.	A full API reference for all modules
	3.	Autonomous agent behavior documentation
	4.	Architecture diagrams (text-based unless diagram tooling exists)
	5.	A changelog updated after each significant modification cycle
	6.	A security model overview outlining threat considerations and mitigations
	•	All documentation must stay synchronized with the codebase and must be auto-updated whenever the agent performs changes that affect APIs, architecture, or workflows.
	•	No task is considered “complete” until documentation has been generated, validated for consistency, and logged.

