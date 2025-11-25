Rule 3 — Logging, State Recovery, and Memory Continuity
	•	The agent must maintain a continuous, append-only operational log stored in .cursor/logs/ with timestamped entries for every action, decision, inference, correction, and rule reference.
	•	Every log entry must contain:
	1.	The subsystem or module acting
	2.	The exact trigger for the action (event, file change, error, scheduled interval)
	3.	The reasoning chain that led to the decision
	4.	The outcome and any artifacts produced
	•	If execution context is lost (LLM truncation, crash, restart, or memory reset), the agent must reconstruct its entire operational state by scanning:
	•	.cursor/logs/
	•	workflow/*.md
	•	The repo filesystem
	•	Any generated .cursor/rules/*.mcr
	•	After reconstruction, it must internally re-summarize the last known position and resume execution with zero user interaction.
	•	Logs must be optimized for both human and machine readability.
	•	Log-level must never drop below “verbose”; silence is prohibited unless explicitly directed by a rule file.

