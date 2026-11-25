# Working in job-search

"The user" below is the person whose job search this is.

**First, every session:** run `grep -l '^Status: unfilled' brief/*.md`. Any file it lists still holds questions instead of answers. Interview the user from that file, a few questions at a time, and replace each question with their answer, in their own words where you can. Delete the `Status: unfilled` line when the file is done. Do no research until `brief/00-profile.md` and `brief/01-criteria.md` are filled, because they define what a good match is.

Read `brief/00-profile.md`, `brief/01-criteria.md`, and `brief/03-interview-fit.md` before any research. They define what a good match is and the evidence standard. For people, projects, and places in the user's areas, read `brief/04-people.md` instead of the job criteria. The user reads cards in `./jobs triage` and judges each in under 15 seconds from its first paragraph. A card in front of them has passed basic screening, so nothing enters the queue until it does.

Workflows live in skills: `_pipeline/process-inbox/SKILL.md` (anything in `_inbox/`, any new research), `_pipeline/screen-captures/SKILL.md` (companies with a `captured` date and no `screen`), and `_pipeline/start-application/SKILL.md` (applying and logging outcomes). Follow them.

## Before adding anything

1. `echo URL | ./jobs match` says whether a URL is already applied to, already a role, at a known company, or new.
2. Create dossiers only with `./jobs add-company` and `./jobs add-role`. They pick slugs, normalize URLs, and refuse duplicates. `add-role` with `--website` creates the company when it isn't on file.
3. `./jobs list` shows current labels and progress, and `./jobs notes` shows the user's reasons. Don't re-research companies labelled `n` unless asked.
4. `./jobs evidence <slug>` prints what the phone saw on that company's site: its own title and description, the profiles it links to, and the page text. Screen from that, and write the result with `./jobs card`, which is the only way to set `screen` and rewrite a card's first paragraph.
5. When the user explains why they like or reject something, save it with `./jobs note <id> "reason"`.

To find open roles at companies already on file, search the local index before browsing: `./jobs postings` pulls every posting from the companies' public job feeds (about 30 seconds once the first pull has found the feeds), `_postings/postings.tsv` holds one per line for `grep` and `awk`, and `./jobs postings --serve` opens the search page. The README section "Every open posting, searchable" covers filters and keys. Many companies publish no feed, so a company missing from the index may still be hiring.

## Basic screening

Every company passes both checks before it gets a card:

1. `website` loads the company's own site, and the page names the company or its product. A parked domain, a different company, an unrelated business, or a dead site fails.
2. The company still operates and employs people. Closed, acquired and absorbed, or maintenance mode fails.

When a check fails, find the right website if one exists. Otherwise set `screen = "FAIL"` and name the failed check in the first paragraph.

Run check 1 on the phone: `./jobs shoot <slug>` loads the site in Chrome on an Android phone through arb, files the screenshot the triage card shows, and leaves the page text, HTML and metadata in `_captures/<timestamp>/`. Read `text.txt` and the `final_url` column before deciding. A row with `error`, or a `final_url` on someone else's domain, is usually a dead or parked site, and a 200 alone proves nothing: a parked GoDaddy page returns 200. A bot check (403, a "Just a moment..." title) says nothing about the company, so leave `screen` on what other sources support and don't fail it for that.

With more than one phone on USB, arb needs one named: prefix phone commands with `ANDROID_SERIAL=<serial>`, and give parallel jobs different phones.

Without arb or a phone, `./jobs shoot` exits with `no arb at ...`. Run check 1 by loading the site with your own web tools, write the card with `./jobs card`, and tell the user the cards have no screenshot. `crawl()` in `jobs` is the only code that talks to arb, so it's the place to swap in another capture tool.

## Company dossier: `content/companies/<slug>/_index.md`

Slug is the lowercase name with non-alphanumerics as hyphens (`Harbor Lane / Homestead OS` becomes `harbor-lane-homestead-os`). `site.jpg` beside `_index.md` is the website screenshot from `./jobs shoot`; the triage card shows it, and only `./jobs shoot` writes it.

```toml
+++
title = "Quillwork"
[extra]
tier = 3                       # 1 screened, 2 profiled, 3 deep dive
score = 91.4                   # rubric total; 0 when unscored
confidence = "high"            # high | medium | low, per the brief's evidence standard
location = "Fully remote (worldwide)"
website = "https://quillwork.example"   # required; ./jobs check fails without it. Ask the user if you can't confirm one.
interview_grade = "B"          # A-F from brief/03-interview-fit.md, tier 3 only
screen = "PASS"                # PASS | HOLD | FAIL against the hard filters; triage hides FAIL
aliases = ["getquillwork"]         # other names in this company's URLs, for ./jobs match
# Pulled from the site by ./jobs shoot. Never write these by hand.
captured = "2026-09-17"
site_title = "Quillwork: open source publishing for newsletters"
site_description = "Quillwork is a publishing platform for independent writers..."
site_final = "https://www.quillwork.example"  # only when the site redirected somewhere else
profiles = ["https://code.example/quillwork", "https://social.example/quillwork"]
+++
```

Body, in this order:

1. **First paragraph says what the company makes and who pays for it**, in one or two plain sentences. The triage card enlarges it. On an untriaged tier 1 card this is the whole opening, with no verdict, taste label, or claim about the user's fit. They make that call in triage.
2. `## Case against`. Every company gets one, stating facts about the company.
3. Tier 2 and 3: once someone has actually examined the product, a verdict and its biggest reason go above the description. Then the `## Scores` table and `## Evidence` as bullets of `claim (`confidence`) <url>`. Company recruiting copy is never a source for culture claims.
4. Tier 3: `## Interview process (grade X)` and `## Next action`.

The card shows the screenshot, the first paragraph, then the site's own title and
description, then the body down to `## Scores`. Scores, evidence, interview process and
next action stay on the company page, so writing more of them never costs the user
reading time. What you write for the card is that first paragraph.

## Role dossier: `content/companies/<slug>/<role-slug>.md`

One file per real posting. Watchlist notes and "no current opening" belong in the company dossier, not a role file.

```toml
+++
title = "Support Operations Engineer"
[extra]
url = "https://careers.quillwork.example/support-operations-engineer"   # required, unique
comp = "$90,000 - $130,000"    # as published; label estimates as estimates
location = "Fully remote (worldwide)"
score = 91.4
confidence = "high"
interview_grade = "B"
screen = "PASS"
found = "2026-09-13"
+++
```

`./jobs add-role --posting FILE` keeps the full posting text beside the dossier as `<role>.posting.txt`; `./jobs apply` copies it into the application.

Body: first paragraph is the BLUF for this role specifically (fit, the risk, what to lead with in the application). Then anything role-specific that isn't already on the company dossier.

## Pipeline state

The user's labels, their notes, and each company's progress sit at the end of a dossier's frontmatter:

```toml
triage = "y"                        # the user: Y y m w n, stamped with triaged
triaged = "2026-09-14T13:37:16"
content = true                      # the user: worth a video or demo project
issue = true                        # the user: the screenshot doesn't show the site; ./jobs shoot --issues retakes it
profiled = "2026-09-20T09:12:40"    # when the profile was finished
review = "apply"                    # the user: apply | drop, stamped with reviewed; needs profiled
reviewed = "2026-09-22T08:44:02"
applied = "2026-09-24"              # stages: drafted applied first_call interview offer
outcome = "rejected"                # accepted | rejected | withdrawn | ghosted, stamped with closed
closed = "2026-10-10"

[[extra.notes]]
time = "2026-09-15T10:42:36"
text = "I own one of their grinders and use it every day"
```

Change them only with `./jobs set <id> field[=value]` and `./jobs note <id> "text"`. Application stages go on the company. `./jobs list` prints every field as a TSV column with `-` when empty, so a queue is an `awk` filter:

```bash
./jobs list | awk -F'\t' '$2 ~ /^[Yy]$/ && $6 == "-"'
```

That lists dossiers labelled Y or y that haven't been profiled.

## After a research round

Run `./jobs check` and fix what it reports, then `zola build` to confirm the site builds. Commit dossiers as you go so a long run never loses work.

## Don't

- Edit pipeline fields or `[[extra.notes]]` by hand, or drop them when rewriting a dossier. They're the user's decisions and record, and they change only through `./jobs set` and `./jobs note`.
- Edit `captured`, `site_title`, `site_description`, `site_final`, or `profiles`. They're the site's own words and links, and only `./jobs shoot` writes them. A wrong one means the capture is stale: shoot it again.
- Edit files inside `content/applications/` unless the user asks. They are snapshots of what was sent.
- Edit `brief/` without asking, once it's filled. Propose the change and the label pattern behind it.
- Invent compensation, interview steps, or open roles. Leave the field out.
