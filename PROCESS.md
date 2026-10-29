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

**Parts traced from the real weapons.** The first part library was simplified shapes drawn in code, and they did not read as Marathon guns. I collected weapon renders from MarathonDB and had a script trace them (`tools/trace/`): each render is levelled, cut into frame, barrel, magazine, sight, foregrip and stock along lines I set in `tools/trace/config.json`, and each piece is simplified to a polygon. Thirteen weapons give 8 frames and 31 parts, and each part keeps the attachment point of the gun it came from, so a weapon rebuilt from its own parts looks like the render. The renders stay out of the repository; only the traced outlines are committed.

The first traced version also split each part into light and dark areas by brightness. That copied the skins' artwork and printed text into the shapes and left them blotchy, so I replaced it with one simple rule: the lower housing below the receiver's belly line is dark polymer. Looking at every frame rebuilt from its own parts showed two more problems, which I fixed in the config: the Demolition's skid foregrip floated below and in front of the gun, and the Magnum had no barrel of its own, so a borrowed SMG barrel stuck out of its slide. Its front end is now its own SN-06 Snub Nose barrel.

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
- **Tracing:** the script that turns the weapon renders into part outlines (`tools/trace/trace.py`). I chose the weapons and checked each traced build by eye; Claude Code proposed where to cut each render and I asked for changes where a part looked wrong.
- **Code:** most of the JavaScript, CSS and the Web Audio synthesis were written by Claude Code from my descriptions, then run and checked in a browser. I reviewed the behaviour, steered the design and asked for changes.
- **Tests and checks:** the `node:test` tests in `tests/`, and the Playwright scripts that click through the whole flow and take the screenshots.
- **Writing:** first drafts of the README and this file.

**A suggestion I kept:** synthesising every sound with the Web Audio API instead of using recorded gunshot samples. It keeps licensed audio out of the repository, and, more importantly, it lets the three stats bend the sound continuously, so every build sounds slightly different instead of picking from a few recordings.

**Suggestions I changed or rejected:**

- The first plan, built with the AI, simulated every MarathonDB stat. I redirected it to focus on the weapons' shapes and the three headline stats driving sound and feel (see "How the design changed").
- The decal generator's coloured output with a green accent bar was its default. I had it changed to pure black-and-white masks because that is what I need for 3D work.
- The first traced parts were coloured by the brightness of the render. I rejected that because it copied the skins' artwork into the parts (see "Parts traced from the real weapons").

## What I would do next

- Add panel lines and small details inside the traced outlines, and scale parts that come from a much bigger or smaller gun.
- Let a part's decals and wear show on both sides of the gun.
- Try the bench on a phone and with more people.
