---
name: process-inbox
description: >
  Turn whatever the user dropped in _inbox into company and role dossiers. Use
  when they say "process the inbox", "something's in the inbox", "I saved some
  tabs", or drop tab groups, posting text, PDFs, or screenshots in _inbox. First
  action: run `./jobs inbox` from the repo root.
---

# Process the inbox

The user drops material in `_inbox/` without structure. Your job is all of the
structure: dedupe, research, dossiers, filing. They only see the result as
cards in `./jobs triage`. Never ask them to rename, sort, or reformat anything.

## 1. See what's there

    ./jobs inbox

Prints the files, then one TSV row per unique URL found in any text file:

    status   id                                  kind     normalized-url   source
    applied  2026-09-20-quillwork-support-ops        posting  https://...      _inbox/tabs.txt
    role     quillwork/support-operations-engineer   posting  ...
    company  brightmeter                         posting  ...
    new      -                                   page     ...

- `applied`, `role`: already known. Skip. Mention the count in the report.
- `company` + `posting`: known company, possibly new role. Research the role.
- `company` + `page`: known company. Skip unless the page shows something the
  dossier lacks (a new careers page, open roles list): then follow its postings.
- `new` + `posting`: research the company and the role.
- `new` + `page`: a company homepage or careers page. Research the company;
  add roles for any postings that match the lanes in `brief/00-profile.md`.
- Job boards and aggregators (LinkedIn, Wellfound, Hacker News threads): follow
  through to the company's own posting URL when one exists and use that URL.

Folders named `<timestamp>-research` or `<timestamp>-apply` come from `./jobs grab`.
`tabs.txt` lists each tab as `url<TAB>title` under an `# intent:` line, and
`NN.page.txt` holds the page text the browser rendered (first line is its URL).
Use that text as the posting instead of fetching: it's what the user saw, and it
works when a site blocks fetching. For `intent: apply`, after the dossiers
exist, follow `_pipeline/start-application/SKILL.md` for each role, passing the
page text to `--posting`.

Non-text files (PDF, screenshot): read them, pull out company, title, and URL,
then treat them like rows above. Pasted posting text is the best source for a
role; pass it to `--posting` so the text outlives the listing. A note from the
user ("more like Filament Forge", "check who uses this library") is a research request:
source companies from it using `brief/02-research-plan.md`.

`echo URL | ./jobs match` checks any single URL you find along the way.

## 2. Calibrate before researching

Read `brief/00-profile.md` and `brief/01-criteria.md` if not already in context.
Then `./jobs list --label Y`, `--label y`, and `--label n`, and `./jobs notes`:
the user's labels and notes outrank the rubric. A note says why they labelled
something, or what a dossier got wrong. Treat a correction as a lead to verify:
fix the dossier when a source confirms it, and say so in the report. `Y` is
dream fit, a step above yes. `w` is follow: a company the user finds cool and
wants to watch but probably won't apply to, so don't hunt roles there.
`./jobs list --flag content` lists companies and roles the user marked as good
subjects for a video or demo project; note anything in a dossier that would
make that easier (open-source tools, public APIs, a free tier). When a research
round has spare capacity, check the careers pages of `Y` companies first, then
`y` companies, for postings not yet on file. When you notice a pattern in their
labels that the brief doesn't state, say so in the report as a proposed brief
change. Don't edit `brief/` without asking.

When the user explains a label or preference in chat, record it:
`./jobs note <company or company/role> "their reason, in their words"`.

## 3. Write dossiers with the helpers

Never create folders or frontmatter by hand. The helpers pick slugs, normalize
URLs, and refuse duplicates.

Every company needs `website`: triage's `o` key opens it. Use the company's
own homepage, confirmed by loading and reading it. The page must name the
company or its product. When you can't find or confirm one, leave it out and
list the company under "Need a website" in the report so the user can supply
it. `./jobs check` fails until it's resolved. Then apply the basic screening in
`CLAUDE.md`, confirming the website with `./jobs shoot` (step 4 below).

    ./jobs add-company "Filament Forge" \
      --set website=https://filamentforge.example --set screen=PASS --set confidence=medium \
      --set location="Lyon FR; some remote" <<'EOF'
    One or two sentences: what the company makes and who pays for it. This
    paragraph is the card. No verdict, taste label, or claim about the user's fit.

    ## Case against

    ...
    EOF

    ./jobs add-role filament-forge "Community Programs Lead" https://... \
      --posting posting.txt \
      --set comp='<band exactly as posted>' --set location=Remote --set screen=PASS <<'EOF'
    One or two sentences from the posting: the work, location, and published pay.
    EOF

Single-quote values containing `$`, or the shell eats them.

Both print the new id. A refusal (exit 1) means it already exists: read the
message and move on, or add to the existing dossier with an edit.

`add-role` takes the company's slug or name and finds it by name, alias, or
website. For a company not on file, pass its name and `--website URL`, and
`add-role` creates the company dossier too. That dossier has no card yet, so
screen it like any new company: `./jobs shoot`, then `./jobs card`.

When a company's URLs use a different name than its title (Homestead OS for
Harbor Lane), add `--set aliases='["homestead-os"]'` so future `./jobs match`
runs find it.

### Screen every item against the hard filters

Set `screen` on every new company and role by applying stage 1 of
`brief/01-criteria.md`. The card's first paragraph doesn't repeat the result.
It describes the company, and the user makes the taste call in triage. A `FAIL`
card names the failed filter instead.

- `PASS`: clears `brief/01-criteria.md` stage 1.
- `HOLD`: unclear, or passes with a caveat worth the user's eyes.
- `FAIL`: fails a hard filter. Still write the dossier (two sentences is fine)
  so the URL is remembered and never researched twice. Triage hides `FAIL`
  cards from the unlabeled queue.

Set `location` so the card shows it, whether or not the brief screens on it.

### Card budget

The user will see thousands of these, so length is a cost.

- Tier 1 (screen only): the description plus at most 80 words.
- Tier 2 (scored): add `--set tier=2 --set score=NN.N`, the scores table, and
  cited evidence. Under 300 words.
- Tier 3: only when the user asks for a deep dive.

Never invent compensation, interview steps, or openings. If a posting page
won't load, use search results, set `confidence=low`, and say so in the body.

## 4. Shoot the websites

    ./jobs shoot <slug> <slug> ...

One pass over every company added this round. It loads each site in Chrome on
the phone, files `site.jpg` beside the dossier for the triage card, writes the
site's own `site_title`, `site_description` and `profiles` into the frontmatter,
and leaves the page text, HTML and metadata in `_captures/<timestamp>/<host>-<hash>/`.
About 12 seconds per site. `jobs: no arb at ...` or a "busy" error means no
phone: confirm each website with your own web tools instead, say so in the
report, and leave the screenshots for later.

Then read the output before the user sees the cards:

- `error`, or a `final_url` on a domain that isn't the company's, usually means
  a dead or parked site. Read `text.txt` in the capture: a GoDaddy "for sale"
  page returns a 200. Find the real website if one exists and shoot again,
  otherwise `screen=FAIL` naming the failed check.
- A `final_url` at the company's new name (a rebrand, an acquisition) is a
  dossier correction, not a failure. Fix `website`, add the old name to
  `aliases`, and say so in the report.
- A bot check (403, title "Just a moment...") only means the phone was blocked.
  Leave `screen` on what other sources support and note it in the report.
- `text.txt` is also the best confirmation that the page names the company or
  its product, which is basic screening check 1.
- The captured fields are the site's own words. Never type them by hand, and
  never copy them into the first paragraph: the card shows both, and the pair is
  what shows drift. A description of a different business than the dossier
  describes means the dossier is stale. Re-research, fix the first paragraph,
  and say so in the report.

The user presses `i` in triage on a screenshot that shows a cookie banner, a
bot check, or a half-loaded page. `./jobs shoot --issues` retakes those, and the
flag clears when a new screenshot lands.

## 5. File the inbox and commit

    ./jobs done _inbox/<file> ...
    ./jobs check
    git add -A && git commit -m "Inbox: <n> roles, <n> companies"

`done` moves files into `archive/inbox/<date>/`, so the raw material stays
findable. Commit after each inbox file when the batch is large.

## 6. Report

A few lines: new companies, new roles, how many were `FAIL`, duplicates
skipped, screenshots that failed or need the user's eyes, anything you couldn't
resolve, and any proposed brief change. If any company lacks a website, end
with a "Need a website" list and ask the user for them.
End with: press `r` in triage (or run `./jobs triage`).
