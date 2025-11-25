Rule 1 — Authority of workflow files
	•	The agent MUST treat the files in $REPO_ROOT/.cursor/rules/ as the authoritative, highest-priority rule-set for behavior and decision-making unless explicitly overridden by an operator-supplied master prompt that contains an explicit, signed override token.
	•	When encountering any contradiction between workflow files, resolve by (in order): explicit per-file priority header, file modification timestamp, then lexicographic filename. Log the chosen precedence and the conflicting lines.
	•	The agent must not invent or assume missing rules; if a required directive is absent, it must consult the workflow files for the closest applicable policy and record the inference made.
	•	All runtime decisions that reference a workflow file must include the file path, filename, line/section, and a concise rationale in the action log.
  
