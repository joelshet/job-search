---
name: start-application
description: >
  Start or update an application for a role the user wants to apply to. Use when
  they say "apply to X", "start the Quillwork application", "I applied", "I got a
  screen with X", or "I got rejected by X". First action: `./jobs list --kind role`
  and `./jobs status` to find the role and any existing application.
---

# Start an application

## New application

1. Find the role id with `./jobs list --kind role | grep -i <company>`. If the
   role has no dossier, add it through the process-inbox recipe first.
2. `./jobs apply <company>/<role>`. A refusal means an application already
   exists: tell the user which one and its state, and stop.
3. `job-description.md`: if it still holds the paste-here comment, fetch the
   posting and write its full text below the frontmatter. Keep the wording;
   don't summarize.
4. `resume.md` and `cover-letter.md` are copies of `content/materials/`.
   Tailor the copies to the posting when the user asks, using only facts present
   in `content/materials/`, `brief/00-profile.md`, or what they tell you. Don't
   invent achievements, numbers, or dates.
5. `questions.md`: when the user shares form questions, record each as
   `## question` followed by their answer.
6. Tell the user the folder path and that `./jobs serve` shows it live at
   http://127.0.0.1:1111/applications/.

## Recording what happened

Stages live in the company dossier's frontmatter:

    ./jobs set <company> applied
    ./jobs note <company> "via the careers page"

The stages are drafted (`./jobs apply` stamps it), applied, first_call,
interview, and offer. A bare stage stamps the current time; pass
`applied=YYYY-MM-DD` when it happened on another day. Close an application with
`outcome=accepted`, `outcome=rejected`, `outcome=withdrawn`, or
`outcome=ghosted`. Set `applied` when they submit, then run `./jobs pdf <app>`
so the PDFs they sent sit in the folder.

## Don't

Edit stages, outcomes, or notes in frontmatter by hand, or change a snapshot
after `applied` unless the user asks. They're the record for later metrics.
