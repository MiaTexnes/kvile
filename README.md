# Kvile — exam front end

Customer-facing **venue discovery, search, detail, and booking** plus **venue manager** tools to create, update, delete venues and inspect bookings. **Kvile** is the product name used in this repo; data comes from the **Noroff Holidaze API** (`v2.api.noroff.dev`).

## Visual design

The **home page** pairs **Fraunces** (marketing headline) with **Inter** / **Manrope** body type on a warm cream background (`#f5f4f1`) and a **botanical teal** brand (`--color-holidaze-blue: #0f766e`, primary action `#127a6c`) with a terracotta/clay accent. A full-bleed hero photo sits under a transparent header with the headline **“Find Your Place of Peace”** and a **pill search bar** (place / keywords / guests / pets — dates are chosen later on the venue page). Below it, a **Recommended stays** section opens pre-filtered to Top Rated (≥4.5) + WiFi + Parking, with **filter pills** (Top Rated · Breakfast · Pets · WiFi · Parking), a **sort select** (price / rating), **four-column** listing cards (heart, rating, location, teal price) on desktop and a stacked featured layout on mobile. Color tokens, hero gradients, and the day-picker theme live in [`src/index.css`](src/index.css). Inner pages reuse the same tokens via the `.app-page-bg` backdrop.

## Stack (approved)

- **React 19** + **TypeScript** + **Vite**
- **Tailwind CSS v4**
- **React Router v7**
- **TanStack Query**, **React Hook Form**, **Zod**
- **react-day-picker** for the availability calendar

## Prerequisites

- **Node.js** 20+ recommended (18 LTS should work)
- A **stud.noroff.no** email for registering test accounts (enforced in the register form to match the brief)

## Setup

```bash
npm install