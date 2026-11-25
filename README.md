# job-search

A job search run with Claude Code: AI-researched company and role dossiers, keyboard triage, and one folder per application. Everything is markdown in git, and the commands print TSV.

Needs macOS, Python 3.11+, [Zola](https://www.getzola.org) 0.23 or later (`brew install zola`), and Google Chrome for PDFs. `./jobs shoot` also needs [arb](https://github.com/joelshet/android-remote-browser) and an Android phone on USB (see Screenshots). The search page from `./jobs postings` needs `search-cli` from [wasm-static-search](https://github.com/joelshet/wasm-static-search). No other dependencies.

## Start

```bash
git clone https://github.com/joelshet/job-search.git
cd job-search
git remote remove origin
```

Removing `origin` keeps your search out of the template's repository. Your dossiers, resume, and notes get committed here, so add a remote only if it's a private repository of your own. Triage commits your labels as you go, which is why the folder stays a git repository.

```bash
claude
```

Run it in this folder. `CLAUDE.md` tells Claude to check `brief/` first. Four of the five files there hold questions about what you want, and Claude interviews you and writes your answers in. This is most of the setup, and research is only as good as these files. `brief/04-people.md` is optional.

Then fill in `content/materials/resume.md` and `cover-letter.md`, or paste your current resume to Claude and ask it to.

## Inbox

Drop anything into `_inbox/`: tab-group `.txt` files, pasted postings, PDFs, screenshots, a note like "more companies like Filament Forge". Then tell Claude "process the inbox", or run the **Go** task in Zed.

To capture browser tabs directly:

```bash
./jobs grab --intent apply --go
```

This saves the front Chrome or Safari window's URLs, titles, and rendered page text into `_inbox/<timestamp>-apply/`, opens a terminal running Claude on the inbox, and opens the tab list in Zed. `--intent research` (the default) means "look into these"; `apply` also starts applications. Drop `--go` to only save. The first run asks macOS to let your terminal control the browser. Page text also needs "Allow JavaScript from Apple Events" (Chrome: View > Developer; Safari: Develop menu); without it you still get URLs and titles. Claude follows `_pipeline/process-inbox/SKILL.md`:

1. `./jobs inbox` pulls every URL out of the files and marks each as already applied, already a role, at a known company, or new.
2. It researches only the new ones and writes dossiers with `./jobs add-company` and `./jobs add-role`, which pick names and folders and refuse duplicates.
3. Every dossier gets a hard-filter `screen` of PASS, HOLD, or FAIL. FAIL cards stay out of your unlabeled queue but remain on file, so the same posting never gets researched twice.
4. `./jobs done` moves the inbox files to `archive/inbox/<date>/`, and it commits.

Press `r` in triage to load the new cards. Saying "apply to Quillwork" or "I got a screen with Brightmeter" runs `_pipeline/start-application/SKILL.md`.

## Daily commands

```bash
./jobs triage
```

Opens triage at http://127.0.0.1:1112/triage/. `tab` cycles three modes. Company mode (a single rule under the header) asks whether you want to work there. Role mode (a double rule) asks whether to apply. It skips roles at companies you said no to and lists roles at dream-fit companies first, then yes companies, newest first. People mode covers the entries in `content/people/`. Labels, notes, and content flags save to the dossier's frontmatter as you press keys. Starting triage and stopping it with ctrl-c each commit the dossiers whose only changes are labels, notes, and flags. A dossier that also has research edits waits for the commit that goes with those edits.

| Key | Action |
|---|---|
| `Y` | Dream fit: one step below driving there to introduce yourself |
| `y` `m` `n` | Yes, maybe, no, then next card |
| `w` | Follow: cool, worth watching, probably not one to apply to |
| `c` | Toggle content idea: worth a video or demo project. Independent of the label. |
| `i` | The screenshot doesn't show the site (cookie banner, bot check, half-loaded page), then next card. `./jobs shoot --issues` retakes those. |
| `enter` | Write a note (why you labelled it, or what the dossier got wrong). Right after a label, it goes on that card. |
| `u` | Undo last label |
| `j` `k` or arrows | Next, previous |
| `tab` | Switch between company, role, and people mode |
| `f` | Filter: to do, all, dream fit, yes, maybe, follow, no, content ideas, screenshot issues |
| `o` | Open the website or posting (a web search if the dossier has none) |
| `e` | Open the dossier file in Zed |
| `r` | Rebuild after new dossiers land |

A company card is the screenshot, the dossier's first line, the site's own title and description, and links to every profile the site points at. Scores and evidence stay on the company page. "To do" skips cards the AI screen marked FAIL.

Your notes are how the research improves. Claude reads them before every round, and a pattern in them becomes a proposed change to `brief/`.

```bash
./jobs serve
```

Live-reload site at http://127.0.0.1:1111 for editing resumes and cover letters. Save a markdown file and the browser updates.

```bash
./jobs apply quillwork/support-operations-engineer
```

Creates `content/applications/<date>-<company>-<role>/` with the job description, a snapshot of your master resume and cover letter, and a questions file, then stamps `drafted` on the company dossier. Refuses if you already have an application for that role or posting URL (`--force` overrides). `--resume FILE` snapshots another resume from `content/materials/`.

```bash
./jobs set quillwork applied
```

Stamps a stage on the company dossier with the current time (`applied=2026-09-10` for a past day). Stages: drafted, applied, first_call, interview, offer. `outcome=rejected` closes the application, and the outcomes are accepted, rejected, withdrawn, and ghosted. `field=` clears a field. Add how it went with `./jobs note ghost "via careers page"`.

```bash
./jobs pdf quillwork
./jobs pdf resume --out ~/Desktop
./jobs pdf all --spaced
```

Prints that application's resume and cover letter to PDF inside its folder, so the exact file you sent stays with the application. Given a name from `content/materials/` instead, or `all`, it prints those to `--out` (default `~/Desktop`). `--spaced` doubles the leading and names the file `<name>-spaced.pdf`, for editing by hand between the lines.

`./jobs list --label w` lists companies you follow, and `./jobs list --flag content` lists content ideas. `./jobs note kerfline "why"` adds a note from the terminal, and `./jobs notes` lists them with current labels.

`./jobs list` prints one row per dossier: id, then triage, triaged, content, issue, profiled, review, reviewed, drafted, applied, first_call, interview, offer, outcome, closed, and title, with `-` for empty fields. Queues are filters on it. This one lists yes and dream-fit dossiers that haven't been profiled:

```bash
./jobs list | awk -F'\t' '$2 ~ /^[Yy]$/ && $6 == "-"'
```

Also: `./jobs status` (applications and their company's latest stage), `./jobs match` (classify URLs from stdin), `./jobs check` (missing websites, bad pipeline fields, duplicate roles and applications, broken role links). All print TSV, so they pipe into `sort`, `grep`, `cut`, and `awk`.

Zed tasks (`.zed/tasks.json`): **Go** processes the inbox, **Triage** and **Serve** start the two servers.

## Screenshots

```bash
./jobs shoot
```

Screenshots company websites on an Android phone through arb and files each one as `site.jpg` beside the dossier, where triage's card shows it. arb is a separate one-file tool that drives the real Chrome on a phone over `adb`, so the capture is what a person holding that phone would see. It isn't in this folder. Clone [android-remote-browser](https://github.com/joelshet/android-remote-browser) to `~/repos/android-remote-browser`, or point `$ARB` at the `arb` script.

From the same page load, `shoot` writes the site's own `site_title` and `site_description`, the `profiles` it links to (GitHub, YouTube, X, LinkedIn, Discord, Reddit and the rest), and `site_final` when the site redirected somewhere else. With no arguments it takes every company that has a `website` and no screenshot yet; name company slugs to pick, `--issues` retakes the ones you flagged with `i`, `--again` retakes existing ones, and `--limit N` stops after N. About 12 seconds per site, and it prints a row per company:

```
id                   status  ms    shot      profiles  final_url             title
quillwork            200     2909  site.jpg  6         -                     Quillwork: open source publishing
kerfline             200     3223  site.jpg  3         https://kerf.example/ Kerfline
filament-forge       error   -     -         -         -                     net::ERR_CERT_COMMON_NAME_INVALID
```

`error`, and a `final_url` at another company's domain, are how dead and parked sites show up. Ctrl-c stops it, and rerunning picks up the companies still without a screenshot. arb's raw output (page text, HTML, full-size PNG) lands in `_captures/<timestamp>/`, which git ignores; the JPEG beside the dossier is the part that's kept. With two phones attached, name one: `ANDROID_SERIAL=<serial> ./jobs shoot`.

Everything else works without arb. Cards show no screenshot and no site title, and Claude confirms each website with its own web tools. To capture another way (headless Chrome, for one), replace `crawl()` in `jobs`: it's the only function that calls arb. Per site it hands `capture_dossier()` a status, a load time, and a capture folder holding `meta.json` (`url`, `status`, `title`), `page.html`, `text.txt`, and `shot.png`.

## People, projects, and places

`content/people/` holds people, projects, and places (forums, events, makerspaces) worth meeting. `brief/04-people.md` defines a match and the areas. Press `tab` in triage until the header says "People, projects, and places"; labels, notes, and content flags work as they do for companies.

```bash
./jobs people --area <area id>
```

Lists them as TSV: id, kind, areas, goals, where, employer, company dossier, label. `./jobs add-person NAME --set kind=person ...` creates one with its body on stdin and refuses a duplicate. An employer without a dossier goes to `_inbox/` for company screening.

## Researching more companies

Ask Claude in this folder to run a research round. `CLAUDE.md` tells it the dossier format and the checks to run, and `brief/` tells it what to look for. Press `r` in triage when it finishes.

## Every open posting, searchable

```bash
./jobs postings
./jobs postings --serve
```

The first pulls every open posting at the companies not labelled n from their public job feeds (Greenhouse, Ashby, Lever, Workable, Recruitee) into `_postings/`, then builds a search page over them with `search-cli` from [wasm-static-search](https://github.com/joelshet/wasm-static-search). Clone it to `~/repos/wasm-static-search` and run `cargo build --release` there (needs [Rust](https://rustup.rs)), or point `SEARCH_CLI` at a `search-cli` elsewhere. Without it you still get `_postings/postings.tsv`. The second serves that page at http://127.0.0.1:8763 and opens it. Type to search; `is:remote`, `is:150k` (the band reaches $150k; any $10k step from `100k` to `300k`, and only alongside a search word), `is:nopay`, `is:yes` (labelled Y or y), `label:m` and `in:` with a company name narrow it. Each result links to its posting. The keys are listed under the search box: `/` focuses the box, the down arrow moves into the results, `j` and `k` move through them, Enter expands one in place, `o` opens the posting, and Escape goes back to the box.

The first pull probes each company for a feed, takes a while (about 15 minutes for a few hundred companies), and remembers what it found in `_postings/boards.tsv`; later pulls read only those feeds and take about 30 seconds. `--probe` looks again at companies that had none, and `--reprobe` starts over. A feed found by guessing the company's name counts only when its postings carry the company's full name or its domain. `_postings/postings.tsv` has one posting per line (company, label, feed, title, location, remote, pay, posted, url, text) for `grep` and `awk`. Paragraphs that repeat across a company's postings (about-us, benefits, legal) are left out of the search.

## Layout

| Path | Contents |
|---|---|
| `_inbox/` | Unsorted drops for Claude to process |
| `_pipeline/` | Skill recipes, linked into `.claude/skills/` so Claude Code finds them |
| `brief/` | Profile, scoring rubric, research plan, interview-fit grading, people. The research source of truth. |
| `content/companies/<company>/_index.md` | Company dossier. Its frontmatter ends with your label, notes, and application stages. |
| `content/companies/<company>/<role>.md` | Role dossier, one per posting, with its own label and notes |
| `content/applications/<date>-<company>-<role>/` | Everything for one application |
| `content/materials/` | Master resume and cover letter |
| `content/people/` | People, projects, and places |
| `archive/inbox/<date>/` | Inbox files after processing |
| `_captures/` | arb's raw output, ignored by git and safe to delete |
| `_postings/` | Job feeds pulled by `./jobs postings` and the search page built from them, ignored by git and safe to delete |
| `jobs` | The CLI. Stdlib Python, one file. |
| `templates/`, `static/`, `config.toml` | Zola site |

Company ids are folder names (`quillwork`). Role ids are `company/role` (`quillwork/support-operations-engineer`). Applications point at a role id, which is how duplicates get caught. Their stages live on the company dossier, which answers "which companies have I applied to".

## Removal

Nothing is installed outside this folder. `public/` is a build output and safe to delete.
