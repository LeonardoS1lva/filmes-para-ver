# AGENTS.md

## Project Overview

Build a personal movie wishlist SPA using Vue 3, Quasar, and JavaScript.

Users must be able to search for movies through the TMDB API, add them to a wishlist, and remove them after watching. Persist the wishlist in `localStorage`.

The interface must use Brazilian Portuguese (`pt-BR`) and follow a dark, cinematic visual style with movie posters as the primary visual element.

## General Rules

- Inspect the existing project structure, `package.json`, and relevant configuration before making changes.
- Follow the project's existing conventions and installed dependency versions.
- Prefer simple, maintainable solutions over unnecessary abstractions, dependencies, or architectural complexity.
- Do not introduce features outside the requested scope.
- Do not overwrite or remove existing user changes without a clear reason.
- Explain significant implementation decisions when they are not obvious from the code.

## Quasar Guidelines

- Consult the Quasar MCP documentation when available before implementing Quasar-specific features or using unfamiliar APIs.
- Verify that components, props, methods, and utilities are supported by the installed Quasar version.
- Prefer native Quasar components whenever they satisfy the requirements, including components such as `QPage`, `QCard`, `QBtn`, `QInput`, `QDialog`, and `QImg`.
- Prefer Quasar layout components, utility classes, and built-in styling capabilities over custom HTML structures and CSS.
- Do not recreate functionality already provided by Quasar.
- Avoid unnecessary wrapper elements, custom component implementations, and duplicated styling.
- Use custom CSS only when Quasar's existing components and utilities cannot reasonably achieve the required design.
- Keep custom styles scoped and minimal. Avoid broad global overrides and hardcoded values when suitable Quasar utilities or theme settings exist.
- Preserve responsive behavior across mobile, tablet, and desktop layouts.

## Application Architecture

- Keep API communication, wishlist persistence, and UI presentation appropriately separated.
- Extract reusable logic into composables or modules when doing so improves clarity or prevents meaningful duplication.
- Avoid creating abstractions for one-off operations without a clear benefit.
- Use Vue 3 Composition API and follow the existing project conventions.
- Use reactive state appropriately and avoid introducing a state management library unless the project requirements justify it.
- Keep the application as a client-side SPA. Do not introduce SSR or a separate backend unless explicitly requested.

## TMDB Integration

- Use the official TMDB API for movie searches and movie poster paths.
- Keep API requests and response handling in a dedicated module or service rather than embedding them directly in presentation components.
- Use the API's documented authentication and image URL conventions.
- Handle loading, empty results, request failures, missing poster images, and invalid responses.
- Avoid unnecessary requests, including requests triggered by every keystroke without debouncing.
- Use the TMDB movie ID as the unique identifier when adding, finding, or removing movies.
- Prevent duplicate entries in the wishlist.
- Store only the movie data needed by the application. Prefer poster paths over downloading and storing image files.
- Include the required TMDB attribution in the application.
- Never commit API credentials or tokens to version control.
- Treat client-exposed environment variables as public. Do not describe credentials embedded in a SPA bundle as secret or secure.

## Wishlist and Persistence

- Use `localStorage` as the persistence mechanism.
- Centralize persistence logic where practical instead of duplicating storage operations across components.
- Handle missing, malformed, or unexpected stored data without crashing the application.
- Keep the reactive wishlist state consistent with persisted data.
- Update persistent storage when movies are added or removed.
- Do not add accounts, remote databases, synchronization, or watch history unless explicitly requested.

## UI and Accessibility

- Maintain a restrained, dark cinematic design with movie posters as the main visual focus.
- Use clear visual hierarchy, consistent spacing, and readable typography.
- Provide appropriate empty states and feedback for user actions.
- Confirm destructive actions when accidental removal is reasonably likely.
- Use accessible labels, visible focus states, keyboard-operable controls, and sufficient contrast.
- Do not rely on color or images alone to communicate essential information.
- Avoid unnecessary animations, decorative elements, and visual complexity.

## Validation

- Run the relevant checks and tests available in the project after making changes.
- Add or update tests for important business logic when an appropriate testing setup exists.
- Prioritize validation of movie search handling, duplicate prevention, wishlist persistence, and removal behavior.
- Report executed checks and their actual results.
- Never claim that tests, builds, or other checks passed unless they were actually executed successfully.
- Do not add testing frameworks or dependencies without a clear need.
