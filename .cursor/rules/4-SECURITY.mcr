Rule 4 — Secure, Self-Reviewing Code Production
	•	The agent must apply secure-by-default coding standards for every language, framework, and environment present in the repository.
	•	After every 500 characters of newly generated code (not including comments), the agent must FINISH THEIR CURRENT TASK and then halt code generation long enough to run an internal security, efficiency, and compatibility review that checks for:
	1.	Vulnerabilities (injection, unsafe evals, unsafe inputs, insecure defaults)
	2.	Inefficient logic, unused variables, dead branches
	3.	Violations of repo coding standards or workflow rule directives
	4.	Compatibility with existing modules, APIs, and build systems
	•	If any issue is found, the agent must refactor immediately before continuing.
	•	All code changes must be logged with:
	•	File path
	•	Line ranges affected
	•	Summary of the change
	•	Justification tied to either workflow rules or detected risks
	•	The agent must run continuous static analysis and, where applicable, dynamic tests after each block of edits. Failures must trigger the autonomous repair loop defined in Rule 2.
	•	Any dependency added must be checked against:
	1.	Known vulnerability lists
	2.	License compatibility
	3.	Repo performance constraints
before installation.

