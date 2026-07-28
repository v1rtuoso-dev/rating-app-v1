---
name: expo-natural-language-task-router
description: 'Use when a user describes an Expo task in natural language and you need to choose the right Expo skill, Expo MCP source, or Expo docs path. Covers routing ambiguous requests to expo-router, expo-data-fetching, expo-native-ui, expo-module, expo-dev-client, expo-upgrade, expo-examples, expo-tailwind-setup, expo-ui, and expo-dom.'
argument-hint: 'Describe the Expo task in plain language'
---

# Expo Natural Language Task Router

## Purpose
Turn a plain-language Expo request into the narrowest correct Expo workflow. Use this skill when the user says what they want to achieve, but not which Expo feature, package, or MCP source should be used.

## What This Skill Produces
- The best-fit Expo skill or Expo MCP path for the request
- The minimum clarification question if the request is still ambiguous
- A short, actionable plan for implementation or research
- A validation step when the task affects code

## Procedure
1. Restate the task in one sentence.
2. Classify the request into the most likely Expo area:
   - Navigation, routing, headers, layouts, modals, tabs, search bars, or route params -> expo-router
   - Fetching data, caching, loading states, offline behavior, or API requests -> expo-data-fetching
   - Native-feeling screens, controls, gradients, visual effects, or responsive UI -> expo-native-ui
   - Native modules, config plugins, or platform code -> expo-module
   - Development client setup, local build distribution, or TestFlight internal testing -> expo-dev-client
   - SDK migrations, dependency upgrades, or version-specific fixes -> expo-upgrade
   - Canonical examples or third-party integration patterns -> expo-examples
   - Universal styling with Tailwind / NativeWind / react-native-css -> expo-tailwind-setup
   - Native @expo/ui components and platform-specific UI trees -> expo-ui
   - Web code in WebView / incremental native migration -> expo-dom
3. If one skill is clearly dominant, use that skill instead of broadening the search.
4. If more than one skill fits, choose the narrowest one and explain the tradeoff in one sentence.
5. If the request depends on Expo API behavior or version details, consult the versioned Expo docs through the Expo MCP documentation tool before changing code.
6. If the request is still underspecified after classification, ask one focused clarification question only.
7. If code is being changed, finish with a cheap validation step that can falsify the chosen approach.

## Decision Rules
- Prefer the most specific skill over a general one.
- Prefer official Expo docs and MCP sources over guesswork.
- Avoid asking for extra context unless it changes the chosen skill or implementation path.
- Do not invent Expo APIs, SDK behavior, or package usage when the docs can confirm it.

## Common Routing Examples
- "Build a bottom tab app with a modal details screen" -> expo-router
- "Cache this API response and handle retries" -> expo-data-fetching
- "Make this screen feel more native on iOS and Android" -> expo-native-ui
- "Add a custom native camera bridge" -> expo-module
- "Set up a dev build for internal testing" -> expo-dev-client
- "Upgrade from SDK 52 to 57" -> expo-upgrade
- "Show me the canonical Stripe setup" -> expo-examples
- "Set up Tailwind in Expo" -> expo-tailwind-setup
- "Use @expo/ui instead of community components" -> expo-ui
- "Move a web feature into a WebView first" -> expo-dom

## Completion Check
Before responding, confirm all of the following:
- The task has been routed to the best Expo skill or MCP path
- Any ambiguity has been reduced to the smallest useful question
- The answer stays focused on the user's actual Expo goal
