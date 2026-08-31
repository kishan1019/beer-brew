# Personalized Beer Brewing App

_Started 2026-08-31 12:04 UTC_

---

## User

Design  a web app for a personalized beer brewing application where the admin can host beer brewing events in his house, and people can signup for that experience, get a code for that day, and signinto their  page for the day where they can track the recipe, understand the process of brewing, and track day by day uploads of fermenter bubbling or sample tests, and track it until bottling happens. Upon bottling, there will be a window of 20 days when they can come over and collect 5 bottles of the beer they brewed.

## Assistant



## Assistant

I'll explore the design system first, then ask a few scoping questions.

_[tool: list_files]_

The attached design system project is empty, so I'll set the visual direction myself. A few scoping questions first:

_[tool: ask_user]_

Waiting on your answers to the form.

## User

Answered — focus: Code redemption / sign-in, Participant brew journal (day-by-day tracking), Recipe + process explainer, Bottling + 20-day pickup window, Admin: create event, manage brews, post updates; device: Mobile-first; who_posts: Admin only; brew_scale: One batch, whole group; tone: Playful and gamified; process_depth: Light — just what's happening today; variations: No — one strong direction; extras: These will usually be 20-liter batches where people sign up through different other platforms, let's say, Get Your Guide or Airbnb experiences. Upon one batch getting one code, they can tr…

## Assistant

_[tool: dc_write]_

_[tool: ready_for_verification]_

**Bubble & Bottle** — mobile-first, one interactive prototype with a Guest/Host switch at top.

Guest: code gate (try `MALT-482`, or just hit the button) → four tabs — Brew (day counter, stage road, sticker badges), Journal (host's day-by-day posts with photo placeholders + gravity/temp/bubble chips), Recipe (grain bill, targets, expandable process explainer), Pickup (20-day window, 5-bottle claim, bookable slots).

Host: batch list with live code + progress, "New batch" generating an access code you'd paste into Airbnb/GetYourGuide, a day-update composer, and "Mark bottled" which opens the pickup window.

Photos/videos are striped placeholders — send me real brew shots and I'll drop them in.

## User

Found issues — fixing…

## Assistant

_[tool: dc_html_str_replace]_

_[tool: ready_for_verification]_

Replaced the tofu glyphs with drawn signal/battery indicators. Left the blank-code shortcut in as a demo convenience — say the word and I'll make it strict.

## User

I will ideally just drop an HTML file onto this URL to add a recipe.

## Assistant

_[tool: dc_html_str_replace]_

_[tool: grep]_

_[tool: read_file]_

_[tool: dc_html_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: write_file]_

_[tool: ready_for_verification]_

Host → **New batch** now has a real drop zone in the Recipe field: drag an HTML recipe export (BeerSmith / Brewfather / Brewer's Friend, or any HTML with a grain-bill table) onto it, or tap to browse. It parses fermentables, hops, yeast and OG/FG/ABV/IBU into a confirmed recipe card and auto-fills the batch name and style. Bad file → a friendly error, hand entry still available.

`sample-recipe.html` in the project is a test file you can drag in.

## User

Found issues — fixing…

## Assistant

_[tool: dc_html_str_replace]_

_[tool: ready_for_verification]_

Status bar is now light on the dark headers.

