# Mizan — Daily Good Deeds

A calm, offline daily tracker for eight Islamic good deeds. Mizan helps users check in on their daily practice, maintain streaks, and review previous days without rankings, pressure, or unnecessary metrics.

## Features

* Track exactly eight daily deeds:

  * Fajr
  * Dhuhr
  * Asr
  * Maghrib
  * Isha
  * Quran
  * Dhikr
  * Charity
* Check and uncheck each deed
* Persist progress using browser `localStorage`
* View today's completion count and percentage
* Track current streak
* Track best streak
* View previous tracked days
* See completed deed counts and completion percentages for each day
* Responsive, mobile-friendly interface
* Works offline after the app has loaded

## Streak Rules

* A day is complete only when all eight deeds are completed.
* If today is complete, it counts toward the current streak.
* If today is incomplete, the current streak counts consecutive completed days before today.
* An incomplete or untracked day breaks the streak.
* Best streak is the highest consecutive run of completed days in the stored history.

## Tech Stack

* React
* TypeScript
* Vite
* Tailwind CSS
* Browser `localStorage`
* Node.js built-in test runner
* No backend
* No API
* No database
* No authentication

## Development Approach

Mizan was built as an experiment in **Spec-Driven Development (SDD)** and AI-assisted development using **Replit**.

The project specification was defined before implementation, with the specification serving as the source of truth throughout development.

The workflow was:

**Specification → AI-assisted implementation → Tests → Browser validation**

Rather than continuously adding features, the project intentionally follows a clearly defined scope and avoids functionality that is not part of the specification.

### Why Replit?

Replit was used mainly to explore the capabilities and benefits of its AI-assisted development workflow.

This project was an opportunity to see what Replit can handle from a defined specification, from implementing functionality to iterating on the interface.

One of the benefits that stood out was its ability to quickly produce **clean and polished UI designs**, making it possible to experiment with different interfaces without spending a large amount of time on manual frontend setup and styling.

The goal was simply to understand where an AI development environment like Replit can be useful and what advantages it can provide during the development process.
