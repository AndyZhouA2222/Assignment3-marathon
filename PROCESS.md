# Process

How Gunsmith got from an idea to a working bench, what changed along the way, and how AI was used.

## Starting idea

This repository began on 19–20 October 2026 as a style kit: notes and React components for the visual language of Bungie's *Marathon*, and a generator for Marathon-style decals (barcodes, warning labels, serial blocks, glyphs). That earlier work is still visible in the commit history.

For Assignment 3 I wanted the decals to be used for something instead of sitting in a sheet. The idea: a weapon bench where you snap a gun together from parts, put decals and wear on it, then pull the trigger. Weapon names and numbers would come from [MarathonDB](https://marathondb.gg/weapons/).

The one interaction I cared about most was the moment after fitting a part: you should *hear and feel* what the part changed, not just read a number.

## How the design changed

**From "use all the data" to "three numbers you can feel."** The first plan was to pull everything MarathonDB has for each weapon (damage, fire rate, range, magazine size, reload time and more) and simulate it. Once the data was in, I decided that it matters less than the weapons' shapes and the three headline stats. Weapons are now broken into a part library (frame, barrel, magazine, optic, foregrip, stock), and Firepower, Accuracy and Handling drive the gunshot sound and the recoil, sway and spread (`src/feel.js`). The readout translates the numbers into words (Report, Tone, Kick, Recovery) so a player can connect a bar to what they hear.

**Showing parts that don't fit instead of hiding them.** Listing only the parts that fit would hide the rules: a player could not tell why a heavy-round magazine never appears. So every part is listed; the ones that don't fit are greyed with a one-line reason ("M77 frame feeds light rounds. HV-14 box holds heavy rounds."), and clicking one shows the reason as a message instead of doing nothing.

**A jam instead of a disabled trigger.** A greyed-out trigger on an unfinished gun would give no feedback. Pulling it makes a dry click, says "Jammed · no barrel", and jumps to the missing slot. The trigger is always the same big button, so the player always knows where to go.

**Decals as black-and-white masks.** The decal generator first made coloured decals with an acid-green accent bar. I mainly use decals in 3D software, so I changed it to output pure black and white. In Gunsmith that turned out useful: each decal is a mask, and the colour is chosen on the bench, so one library works in any colour and wears off with the paint.

## A code change from testing

While scripting a full walkthrough with Playwright, the keyboard shortcuts stopped working after the wear slider was used: pressing 3 did nothing, so the walkthrough never reached the range. The keyboard handler ignored every `input` element so that typing a callsign wouldn't switch steps, and a range slider is also an `input`. The fix narrows it to text fields only, and stops a focused button from also being clicked when Space is released (`src/app.js`, the `keydown`/`keyup` handlers).

The same walkthrough showed two layout problems that I fixed: the long magazine report covered the ammo counter (messages now sit on the left, the counter on the right), and in the Skin step the text-decal field pushed the left panel wider than its column because an input's default size counts as its minimum width.

## User trial

> **To fill in after the trial.** Don't name or describe the person in a way that identifies them.

- **Who and how:** _for example, "a classmate who plays shooters, on my laptop, about 10 minutes, I only said: build a gun you like and try it at the range."_
- **What I asked them to do:**
- **What I saw:** _where they hesitated, what they clicked first, whether they found the trigger, the decal library, the wear slider, reset_
- **What they said:**
- **What I changed, or why I kept the design:**

## AI tools used

I used **Claude Code** (Anthropic's coding assistant) throughout:

- **Research:** finding MarathonDB's public API and taking the weapon stats snapshot (`src/data/marathondb-weapons.js`).
- **Code:** most of the JavaScript, CSS and the Web Audio synthesis were written by Claude Code from my descriptions, then run and checked in a browser. I reviewed the behaviour, steered the design and asked for changes.
- **Tests and checks:** the `node:test` tests in `tests/`, and the Playwright scripts that click through the whole flow and take the screenshots.
- **Writing:** first drafts of the README and this file.

**A suggestion I kept:** synthesising every sound with the Web Audio API instead of using recorded gunshot samples. It keeps licensed audio out of the repository, and, more importantly, it lets the three stats bend the sound continuously, so every build sounds slightly different instead of picking from a few recordings.

**Suggestions I changed or rejected:**

- The first plan, built with the AI, simulated every MarathonDB stat. I redirected it to focus on the weapons' shapes and the three headline stats driving sound and feel (see "How the design changed").
- The decal generator's coloured output with a green accent bar was its default. I had it changed to pure black-and-white masks because that is what I need for 3D work.

## What I would do next

- Redraw the parts from reference screenshots of the game's weapons, so each part reads as a recognisable piece of a real Marathon gun.
- Let a part's decals and wear show on both sides of the gun.
- Try the bench on a phone and with more people.
