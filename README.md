# TaskCanvas — Frontend

## Submission Links
- Frontend repo: https://github.com/MishkatIT/taskcanvas-frontend
- Backend repo: https://github.com/MishkatIT/taskcanvas-backend
- Live app: https://taskcanvas-frontend.vercel.app
- Live API: https://taskcanvas-backend.pythonanywhere.com
- Demo email: demo@taskcanvas.com
- Demo password: TaskCanvas2026!
- Demo video: <link>

## Tech Stack
Next.js (App Router), TypeScript, Tailwind CSS, Zustand, @dnd-kit, react-konva

## Getting Started
- Node version: v21.7.3 (see .nvmrc)

1. Clone the repository and navigate into it:
   ```bash
   git clone https://github.com/MishkatIT/taskcanvas-frontend.git && cd taskcanvas-frontend
   ```
2. Install dependencies:
   ```bash
   npm install --legacy-peer-deps
   ```
3. Set up environment variables:
   Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```
4. Run the local development server:
   ```bash
   npm run dev
   ```

## Architecture Decisions
- **Zustand over Redux/Context**: Selector-based subscriptions avoid the re-render storms Context API causes during frequent drag-and-drop writes; far less boilerplate than Redux for this scope.
- **dnd-kit over react-beautiful-dnd**: react-beautiful-dnd is archived/unmaintained by Atlassian; dnd-kit is the current standard, smaller bundle, native keyboard accessibility.
- **react-konva + normalized polygon coordinates**: Resolution-independent — survives responsive resize, different render sizes, without coordinate drift.
- **JWT access token in memory, refresh token in httpOnly cookie — not localStorage**: access token lives in memory only (Zustand state) — this mitigates XSS token theft. Refresh token is stored in an httpOnly, Secure, SameSite=None cookie set by Django — JavaScript never touches it.

## Villains Faced
1. **React 19 Canvas Rendering & SSR Mismatch**: `react-konva` relies heavily on window/canvas DOM APIs, causing Next.js server-side rendering to fail. Solved by dynamically importing the canvas component with `ssr: false` and providing a custom loading skeleton fallback.
2. **Cross-Domain SameSite Cookie Policies**: Because Vercel and backend are hosted on separate domains, browsers restrict cookie transmission. Solved by setting `SameSite=None` and `Secure=True` on the refresh cookie and ensuring `credentials: 'include'` is set on every API client request.
3. **Optimistic UI Card Drag State Synchronization**: Drag-and-drop actions on slow connections could cause visual lag or duplicate cards. Solved by implementing Zustand optimistic store updates with a robust automatic rollback payload if the API reports a failure.

## What I'd Do With More Time
- Implement keyboard-accessible drag-and-drop mapping.
- Add zoom/pan support on the Konva canvas for highly detailed image annotations.
