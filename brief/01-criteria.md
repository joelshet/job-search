# Scoring rubric

Status: unfilled

Claude: build this from `00-profile.md` with the user, after that file is filled.
Propose each filter and weight from their answers, and let them correct it. Keep
the section names: the skills and `AGENTS.md` refer to "stage 1" and the
"evidence standard" by name.

## Stage 1: hard filters (pass/fail)

Every company and role gets `screen = PASS | HOLD | FAIL` from this table alone.
Fill in the rule for each row, or write "Not screened" so nobody guesses.

| Filter | Rule |
|---|---|
| Compensation | Which published band is a cut? Is unpublished pay a cut? |
| Customer and sales motion | Which buyers or ways of selling are a cut? |
| Work authorisation | |
| Location | Screened, or only shown on the card? |
| Company stage | Screened or not? |
| No employer | Closed, acquired and absorbed, or in maintenance mode fails. This row is fixed. |

### The screen question

Is there one question that decides most cuts? Write it in bold, then list the
cases that fail it, each with real companies as examples. A good screen question
can be answered from a company's homepage.

### Taste tests

What decides a yes among companies that clear the filters? Write two or three
tests, each with companies that pass and companies that fail. State which tests
set `FAIL` and which only inform the user's own call in triage.

### When to use HOLD

List the cases that need the user's eyes instead of a cut, such as a buyer they
feel two ways about or a company that fits their taste and has nobody to hire
them.

## Stage 2: weighted score, 0 to 100

Tier 2 and 3 dossiers score against this. Five to eight dimensions, weights
summing to 100, heaviest first. The heaviest one should be the best single
predictor from "What went wrong before" in the profile.

| # | Dimension | Wt | 10/10 looks like |
|---|---|---|---|

## Measuring the top dimensions

For each of the two or three heaviest dimensions, list what to look at in
public: changelogs, issue trackers, licences, docs, pricing pages, postmortems.
Only public artifacts count.

## Green flags

## Red flags

Mark the ones that are near-disqualifying.

## Evidence standard

Every scored claim carries a source. Company self-description counts as a source
for facts, never for culture claims. Record confidence with each score: `high`
(multiple independent sources), `medium` (one solid source), `low` (inference,
and label it).
