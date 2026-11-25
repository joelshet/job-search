---
name: screen-captures
description: >
  Screen captured companies and rewrite their cards from the evidence. Use when
  companies have a `captured` date and no `screen`, after `./jobs shoot` has run.
  First action: `./jobs evidence <slug> ...` for the batch you were given.
---

# Screen captured companies

Each company in your batch has been loaded on a real phone. The capture holds
the site's own title, description, profile links, and page text. Your job is to
turn that into a card the user can judge in 15 seconds, and to set `screen`.

Read `brief/00-profile.md` and `brief/01-criteria.md` first. They decide every
call you make here. Nothing else outranks them.

## The loop, per company

    ./jobs evidence <slug>

Read the page text, not just the title. Then:

    ./jobs card <slug> --screen PASS|HOLD|FAIL --confidence low|medium|high \
      --location "as the site states it" <<'EOF'
    What the company makes and who pays for it, in one or two plain sentences.

    ## Case against

    One or two sentences of fact about the company that argue against it.
    EOF

`./jobs card` refuses a first paragraph that starts with PASS, HOLD or FAIL,
refuses a card over 110 words, and requires the `## Case against` section. It
keeps the pipeline fields, the captured fields, and any later sections.

Do the whole batch. One company at a time, no batching of the writes.

## What the first paragraph must do

**Say what they make and who pays for it.** That second half is the job. The
site's own description rarely says who pays, and the buyer is often what
decides the screen.

- No verdict, no taste label, no claim about the user's fit. They judge in triage.
- No copying the site's title or description: the card shows those already,
  right under your paragraph. Write what you concluded from the page text.
- No sourcing meta ("sourced as agtech from the list"). That was a placeholder
  and you are replacing it.
- Plain words. No marketing verbs the site used ("revolutionizing",
  "empowering", "cutting-edge"), no em dashes, no exclamation marks.
- Two sentences at most. Every card is 15 seconds of the user's attention.

## Setting the screen

`FAIL` when a hard filter in `brief/01-criteria.md` stage 1 is clearly broken.
The first paragraph names the broken filter as a fact, without the word FAIL:
"sold through hospital procurement", "components sold to OEMs", "the buyer is a
county government". One filter applies whatever the brief says:

- No employer: closed, acquired and absorbed, maintenance mode. `site_error`
  or a `site_final` on a parked domain is the evidence for this one.

`HOLD` when it's unclear, when the brief names the case as one for the user's
eyes, and whenever the page text doesn't settle the question a filter asks.
Name the open question in the paragraph.

`PASS` when it clears every stage 1 filter.

Set `--location` when the page states one.

## Confidence

- `high`: the page text says plainly what they sell and to whom.
- `medium`: the product is clear, the buyer is inferred.
- `low`: a thin page, a bot check, or a site that never loaded.

A bot check (`site_error`, or a title like "Just a moment...") means the phone
was blocked, not that the company failed. Screen on what the rest of the
evidence supports, set `confidence = low`, and say in the paragraph that the
site did not load.

## Two worked examples

These come from a search whose hard filter was that the person who uses the
product is the person who buys it. Your brief's filters differ. The form
carries over: the paragraph states the fact that broke the filter, and the case
against adds a second fact.

    ./jobs card helix-assay --screen FAIL --confidence high --location "Boston MA" <<'EOF'
    Sells scheduling software that runs lab instruments around the clock for
    contract research organisations. Site licences go to each lab's operations
    and procurement teams.

    ## Case against

    The scientists who run the instruments never choose the tool, and the site
    speaks to procurement rather than to practitioners.
    EOF

    ./jobs card beaconfield --screen FAIL --confidence high --location "Lille, France" <<'EOF'
    Makes trackers for shipping containers and rail cars. Logistics operators
    buy them as part of multi-year fleet-management contracts.

    ## Case against

    Sold to organisations through enterprise contracts, with "talk to sales" as
    the main call to action and no practitioner audience.
    EOF

## When you finish the batch

    ./jobs check

Report: how many PASS, HOLD, FAIL, anything you could not screen and why, and
any company whose site describes a different business than its card did, since
that means the sourcing list was wrong. Don't commit; the session that gave you
the batch commits it.
