# deployCode Frontend

The deployCode frontend is a responsive web interface for creating, monitoring, and managing application deployments. It is built as a single-page React application with a Bauhaus-inspired visual system, light and dark themes, and a simple deployment workflow designed for non-technical users.

This repository documents and contains the **frontend only**. It intentionally does not include backend implementation or backend API reference material.

## What users can do

- Create an account and sign in.
- Start a Vite + React deployment from a GitHub repository.
- Choose a friendly app name and receive clear validation feedback before deployment.
- Add optional environment variables with a repeatable **Add variable** control.
- See the current deployment status and build progress.
- View a personal project list and open live projects directly from their project cards.
- Delete a project to free a deployment slot.
- See the two-active-project allowance at a glance.
- Switch between light and dark modes; the selected theme is remembered.
- Contact or support the developer from the ribbon at the top of the interface.

## App-name rules

App names are checked in the interface before deployment. They must:

- Be between 1 and 63 characters long.
- Start with a lowercase letter.
- Use lowercase letters, digits, and internal hyphens only.
- Not end with a hyphen.
- Be unique among the user’s active projects.

The service performs the final uniqueness check when deployment begins.

## Environment variables

The deployment form supports optional environment variables for application settings and secrets.

- Select **Add variable** to add another name/value row.
- Up to 100 variables can be supplied for one deployment.
- Names must start with a letter or underscore and may contain letters, digits, and underscores.
- Duplicate names and values containing line breaks are rejected in the interface.
- Sensitive values are used only for the deployment request and are not displayed in later deployment-status views.

## Technology

| Area | Choice |
| --- | --- |
| UI framework | React 18 |
| Bundler and local development | Vite 6 |
| Routing | React Router |
| Styling | Tailwind CSS with custom Bauhaus theme rules |
| Icons | Lucide React |
| Hosting configuration | Vercel |

## Getting started

### Prerequisites

- Node.js 18 or newer
- npm 9 or newer

### Install and run locally

```bash
npm install
npm run dev
```

Vite prints the local address after the development server starts. Open that address in a browser.

### Create a production build

```bash
npm run build
```

The production files are created in `dist/`.

### Preview a production build

```bash
npm run preview
```

## Configuration

Create a `.env` file in the project root when the app needs a deployment-service base URL that differs from the frontend origin:

```dotenv
VITE_API_BASE=https://your-service.example.com
```

Leave `VITE_API_BASE` empty when the frontend and deployment service are available from the same origin.

Do not place secrets in a `VITE_` variable. Vite exposes those values in the browser bundle.

## Available scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Starts the Vite development server. |
| `npm run build` | Creates an optimized production bundle. |
| `npm run preview` | Serves the production bundle locally for a final check. |

## Routes

| Route | Purpose |
| --- | --- |
| `/login` | Sign in to an existing account. |
| `/register` | Create an account. |
| `/deploy` | Create and manage deployments. |

Unauthenticated visitors are redirected to sign in before accessing the deployment workspace.

## Interface highlights

### Deployment workspace

The workspace groups the app name, repository URL, and optional environment variables into one form. It also shows remaining deployment capacity before a user begins a deployment.

The right side contains live deployment feedback and a project list. A project card with a live domain opens the deployed app in a new browser tab. Project deletion remains a separate action to prevent accidental navigation.

### Themes

The navigation bar includes a light/dark mode switch. The choice is stored locally in the browser and applied on future visits. Both themes are designed for strong text contrast across standard, pending, running, successful, and failed deployment states.

### Responsive layout

The design adapts from a two-column desktop workspace to a single-column mobile layout. Long project lists stay inside a scrollable panel so they do not overlap the rest of the page.

## Deploying to Vercel

This project includes `vercel.json`. Its rewrite rule directs frontend routes to `index.html`, allowing React Router to handle paths such as `/deploy` after a direct visit or page refresh.

Typical Vercel settings:

| Setting | Value |
| --- | --- |
| Framework preset | Vite |
| Build command | `npm run build` |
| Output directory | `dist` |

Add `VITE_API_BASE` in the Vercel project environment variables only when a non-default deployment-service URL is required. Redeploy after changing any Vite environment variable.

## Project structure

```text
src/
├── api/             # Browser-side request helpers
├── components/      # Reusable controls and status UI
├── context/         # Authentication state
├── pages/           # Login, registration, and deployment screens
├── App.jsx          # Route definitions
├── index.css        # Global Bauhaus theme and dark-mode rules
└── main.jsx         # React entry point
public/              # Static assets
vercel.json          # Route rewrite configuration for Vercel
```

## Security notes

- The browser keeps session and theme preferences in local storage.
- Environment-variable values should be treated as sensitive. Do not add them to source files, screenshots, or support requests.
- Never commit `.env` files containing private values.
- Review deployment names and repository URLs before submitting the form.

## Troubleshooting

### A page shows 404 after refreshing on Vercel

Confirm that `vercel.json` is deployed with the project. The included rewrite configuration is required for direct visits to frontend routes.

### The app cannot contact the configured deployment service

Verify that `VITE_API_BASE` is correct for the environment in which the site is running. After changing it, rebuild locally or redeploy on Vercel.

### My project cannot be created

Check the app-name format, repository URL, and available deployment slots. The interface shows the two-project capacity at the top of the deployment workspace.

### A secret appears to be missing from my application

Check the variable name and value carefully, then redeploy with the variable added again. Variable values are intentionally not shown in deployment status cards after submission.

## Support

For developer contact or donation support, use the contact number shown in the application’s top ribbon: **6203321011**.

