# People, projects, and places

Status: unfilled

Triage has a third mode for people, projects, and places (forums, events,
makerspaces) worth meeting. It's optional. If the user only wants the job
search, replace the status line above with "Not used." and leave the rest.

Claude: otherwise ask the questions and replace them with the answers.

## The areas

Which two or three areas do you want to meet people in? Give each a short id
(lowercase, hyphens) and a sentence on what you're building or learning there.
The id goes in each entry's `areas` and in `./jobs people --area <id>`.

## What makes a match

- Name three or four people you'd happily go and visit. What do they share?
- Does a match have to be a person, or do repos, forums, and events count?
- What level of technical depth is yours, and what's too far in?
- What relationship do you want: collaboration, trading work in progress, or
  following along?

Tier every person by reach:

- **Tier 1, reachable now:** small audiences, still answering comments and messages.
- **Tier 2, a peer to grow toward.**
- **Tier 3, a long-term goal.**

Show the user a handful of names and get their reaction before adding more.

## Sourcing companies through people

Where a person works is a way to find companies. Record the employer in `employer`, and `company` when it already has a dossier. An employer with no dossier is a candidate for `./jobs add-company` and the normal screening.

## Entry: `content/people/<slug>.md`

Create with `./jobs add-person NAME --set kind=person|project|place --set 'areas=["<area id>"]' ...` and the body on stdin. It refuses a slug or link already on file.

```toml
+++
title = "Dana Okafor (gnss-notes)"
[extra]
kind = "person"                 # person | project | place (forum, event, space)
areas = ["gnss"]
tier = 1                        # 1 reachable now, 2 peer to grow toward, 3 long-term goal
where = "Portland, OR"          # only as they state it publicly
links = ["https://code.example/gnss-notes", "https://gnss-notes.example"]
contact = "blog comments, GitHub issues"
employer = "self"
company = "orbit-survey"        # when the employer has a dossier
found = "2026-09-18"
+++
```

Body: first paragraph says what they make or run, in one or two plain sentences. Then `## Why them`, saying what their work suggests the user could build, learn, or join. Then `## Evidence` as bullets of `claim <url>`. Record public work only: no personal details beyond what they publish about their work. Refer to people by name or as they/them unless they state their pronouns publicly. Every claim needs a source you read; leave out what you can't check.
