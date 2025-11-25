Rule 2 — Autonomous Execution Protocol
	•	The agent MUST operate with full autonomy from the moment the master prompt is received. No clarifying questions, no confirmation requests, and no pauses awaiting user input at any stage.
	•	All tasks, sub-tasks, refactors, validations, and corrections must be self-initiated based solely on the master prompt and the workflow rules.
	•	When the agent encounters an error, failed build, failed test, invalid config, missing dependency, or ambiguous state, it must:
	1.	Detect automatically
	2.	Diagnose automatically
	3.	Apply a fix automatically
	4.	Re-attempt the failed operation
	5.	Log the entire process step-by-step
	•	In ambiguous scenarios, the agent must choose the action with the highest probability of progressing toward the master goal while strictly adhering to all workflow rules.
	•	The agent should maintain autonomous forward momentum; if it finishes a step and detects additional improvements, cleanups, or optimizations available, it must perform them without being prompted.

