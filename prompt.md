MASTER PROMPT (REWRITTEN — GPDownloader)

Project: GPDownloader
Agent Mode: Full YOLO Autonomous Mode
Mandatory Rule Source:
The agent must strictly and absolutely obey all rules located in .cursor/rules/*.mcr, which are generated from the workflow files.
These .mcr rules override any internal assumptions, defaults, or model behavior.

Directive

Upon receiving this master prompt, the agent must:
	1.	Treat the  .cursor/rules directory as the single authoritative rule set governing all future decisions.
	2.	Operate fully autonomously without ever requesting user input or confirmation.
	3.	Use the workflow rules + this master prompt and the workflow/ files  to:
	•	Plan
	•	Build
	•	Refactor
	•	Secure
	•	Document
	•	Optimize
	•	Self-correct
	•	Clean the repository
	4.  Maintain a persona with IQ beyond 180
	5.	Continuously self-repair when encountering any error, failure, ambiguity, or broken dependency.
	6.	Maintain ongoing verbose action logs inside .cursor/logs/ and reconstruct state from them after any interruption.
	7.	Enforce secure, efficient code practices with mandatory self-review every >500 characters of new code. finish the current task before conducting review, and keep track of wkth logs.
	8.	Maintain full documentation of architecture, APIs, changes, setup, and behavior inside DOCS/.
	9.	Complete the project only when:
	•	All goals stated in this master prompt are fulfilled
	•	All rule files have been followed
	•	The repository is optimized and cleaned
	•	Documentation is complete
	•	No further improvements are detected

The agent must begin execution immediately under these constraints.

⸻

SUMMARIES OF WORKFLOW FILES (GPDownloader)

Below are concise summaries based directly on the actual file contents extracted from the ZIP.

⸻

1. database.md — Database Schema Overview

Defines the database structure for GPDownloader.

Contains summaries of all data models, including:
	•	User
	•	Session
	•	Post
	•	Category
	•	Tag
	•	Comment
	•	Ad (Advertisement configuration)

Focuses on relationships, tables, and essential fields to support site features, categorization, comments, and ads.

⸻

2. features.md — Full Feature & Endpoint Specification

Lists all website features and all corresponding API endpoints.

Topics include:
	•	Full feature breakdown for GPDownloader
	•	Search capabilities
	•	Pagination
	•	Filtering
	•	Grouping
	•	Admin panel capabilities
	•	Upload system
	•	Download management
	•	API parameters such as difficulty, page, limit, groupBy
	•	Expected responses and pagination formats

This is essentially the functional spec sheet for the entire platform.

⸻

3. optimizations.md — Performance & UX Optimization Plan

Lists all intended backend and frontend optimizations.

Includes improvements for:
	•	Query performance
	•	Caching
	•	Asset delivery
	•	Touch-friendly UI
	•	Accessibility
	•	Mobile-first behavior
	•	Gesture support
	•	Developer performance considerations

This file defines how the final system should be fast, smooth, and mobile-optimized.

⸻

4. phases.md — Full Rewrite Roadmap & Task Breakdown

Defines a multi-phase plan for rewriting the project using the new stack.

Covers:
	•	Phase-by-phase development roadmap
	•	Migration plan
	•	Setup of tools like Prettier, ESLint, Husky
	•	Testing setup (Jest, etc.)
	•	Deployment strategy
	•	Refactor and cleanup steps

This is the development lifecycle blueprint.

⸻

5. priorities.md — Priority Matrix

Defines what is most critical for launch.

High-Priority includes:
	•	tRPC integration
	•	Rebuilding essential pages
	•	Core user workflow
	•	Admin tools
	•	Security steps
	•	Third-party integrations
	•	Foundational backend services

This file should heavily influence the agent’s execution order.

⸻

6. stack.md — Recommended Tech Stack

Outlines the recommended technology stack for GPDownloader.

Includes:
	•	Next.js 15
	•	tRPC
	•	Prisma
	•	PostgreSQL
	•	Modern frontend stack
	•	Why each component is chosen
	•	Performance and scalability considerations

This determines how the system must be built technically.

