# Comprehensive Frontend Development Prompt

You are an expert full-stack UI/UX developer building a premium Trello-like project management application. Your task is to create a **professional, dark-themed frontend** that seamlessly connects with the provided backend API and PostgreSQL database.

## PROJECT OVERVIEW

**Application Name**: Trello Clone  
**Purpose**: Multi-organization project management platform with real-time collaboration  
**Architecture**: Monorepo (Turbo) with separate backend, database, and frontend apps  
**Backend Port**: 3000  
**Technology Stack**: React 18+, TypeScript, TailwindCSS, Aceternity UI, Zustand (state management)

---

## DATABASE SCHEMA (PostgreSQL via Prisma)

```
User → Organisations (admin relationship)
User → Memberships → Organisation
User → IssueMapping → Issue

Organisation
├── Boards
│   ├── Sections
│   │   └── Issues
│   │       └── IssueMapping (assignees)
```

**Key Models**:
- **User**: id, username (unique), email (unique), password (hashed)
- **Organisation**: id, username (unique), description, adminId, members
- **Membership**: userId, orgId, role (ADMIN | MEMBER) - unique constraint on userId+orgId
- **Board**: id, title, orgId
- **Section**: id, title, boardId
- **Issue**: id, title, description, boardId, sectionId
- **IssueMapping**: userId, issueId (link users to issues for assignments)

---

## BACKEND API ENDPOINTS

### Authentication
- `POST /signup` → Create user account
- `POST /signin` → Login (returns JWT token)

### Organizations
- `POST /organization` → Create new org (user becomes admin)
- `GET /organizations` → Get user's organizations + roles
- `DELETE /organization` → Delete org (admin only)

### Memberships
- `POST /invite` → Invite user to org (admin only)
- `POST /accept` → Accept org membership
- `DELETE /membership` → Remove member (admin only)

### Boards
- `POST /board` → Create board
- `GET /boards?orgId=UUID` → Get org's boards
- `PUT /board` → Update board title
- `DELETE /board` → Delete board

### Sections
- `POST /section` → Create section
- `GET /sections?boardId=UUID` → Get board's sections
- `PUT /section` → Update section title
- `DELETE /section` → Delete section

### Issues
- `POST /issue` → Create issue
- `GET /issues?sectionId=UUID` or `?boardId=UUID` → Get issues
- `GET /issue/:issueId` → Get issue details with issueMappings
- `PUT /issue` → Update issue (title, description)
- `DELETE /issue/:issueId` → Delete issue

**Authentication**: JWT token in `Authorization: Bearer <token>` header  
**CORS**: Enabled for frontend origin  
**Base URL**: `http://localhost:3000`

---

## DESIGN REQUIREMENTS

### Color Palette (Dark Theme - Premium)
- **Primary Background**: `#0A0E27` (deep navy/charcoal)
- **Secondary Background**: `#1A1F3A` (slightly lighter navy)
- **Accent Color**: `#8B5CF6` (purple/violet - modern & professional)
- **Secondary Accent**: `#06B6D4` (cyan/teal - subtle highlights)
- **Text Primary**: `#E5E7EB` (light gray)
- **Text Secondary**: `#9CA3AF` (medium gray)
- **Border**: `#2D3748` (subtle dark borders)
- **Success**: `#10B981` (emerald)
- **Error**: `#EF4444` (red)
- **Warning**: `#F59E0B` (amber)

**Design Philosophy**:
- No chunky/bright colors - use gradients, shadows, and subtle transitions
- Aceternity UI components for modern, polished appearance
- Glassmorphism effects on modals and cards
- Smooth animations and micro-interactions
- Professional spacing and typography hierarchy
- Accessibility-first (WCAG 2.1 AA compliant)

---

## CORE PAGES & FEATURES

### 1. Authentication Flow
- **Login Page**: Email + password with form validation
- **Signup Page**: Username + email + password with strength indicator
- **Auth Persistence**: JWT stored in secure localStorage/sessionStorage
- **Protected Routes**: Redirect unauthenticated users to login

### 2. Dashboard
- Display user's organizations as cards
- Quick access to recent boards
- "Create Organization" button
- Organization list with role badge (ADMIN/MEMBER)
- Search/filter organizations

### 3. Organization View
- Organization name & description
- Member list with role management (admin only)
- Invite members input with email validation
- List of boards with quick actions (edit, delete)
- Create new board button
- Breadcrumb navigation

### 4. Board View (Kanban-style)
- Drag-and-drop sections layout
- Each section displays issues as cards
- Quick issue preview on hover
- Add issue button in each section
- Board settings (rename, delete) - admin only
- Add section button

### 5. Issue Detail Modal
- Title & description editor (inline editable)
- Assignees section (use IssueMapping to show assigned users)
- Assign/unassign functionality
- Issue metadata (created date, last updated)
- Delete issue button
- Close/navigate modal

### 6. Real-time Features (WebSocket Ready)
- Live updates for board changes
- Real-time member presence indicators
- Collaborative updates without page refresh

---

## COMPONENT ARCHITECTURE

```
src/
├── pages/
│   ├── LoginPage.tsx
│   ├── SignupPage.tsx
│   ├── DashboardPage.tsx
│   ├── OrganizationPage.tsx
│   └── BoardPage.tsx
├── components/
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   └── SignupForm.tsx
│   ├── organization/
│   │   ├── OrgHeader.tsx
│   │   ├── MembersList.tsx
│   │   └── InviteForm.tsx
│   ├── board/
│   │   ├── BoardHeader.tsx
│   │   ├── SectionColumn.tsx
│   │   ├── IssueCard.tsx
│   │   └── IssueModal.tsx
│   └── shared/
│       ├── Navbar.tsx
│       ├── Sidebar.tsx
│       └── LoadingSpinner.tsx
├── hooks/
│   ├── useAuth.ts
│   ├── useOrganizations.ts
│   ├── useBoards.ts
│   └── useIssues.ts
├── services/
│   └── api.ts (centralized API calls)
├── store/
│   └── useAppStore.ts (Zustand state management)
├── types/
│   └── api.ts (TypeScript interfaces for API responses)
├── utils/
│   ├── token.ts (JWT management)
│   └── cn.ts (class name utility)
└── App.tsx
```

---

## TECHNICAL REQUIREMENTS

### Stack
- **Framework**: React 18+ with TypeScript
- **Styling**: TailwindCSS + custom dark theme config
- **UI Components**: Aceternity UI (premium animations + components)
- **State Management**: Zustand
- **HTTP Client**: fetch API with custom wrapper
- **Form Validation**: React Hook Form + Zod
- **Routing**: React Router v6
- **Icons**: Lucide React or Heroicons

### Performance Requirements
- Code splitting for pages
- Lazy loading for components
- Optimized images (WebP format)
- Memoization for expensive computations
- Debounced API calls for search/filter

### Code Quality
- ESLint + Prettier configured
- TypeScript strict mode enabled
- Component documentation (JSDoc comments)
- Error boundary components
- Proper type definitions for all functions

---

## KEY FEATURES TO IMPLEMENT

1. **Authentication System**
   - JWT token management
   - Auto-logout on token expiry
   - Remember me functionality

2. **Organization Management**
   - Create organizations
   - Invite members via email
   - Role-based access control (ADMIN/MEMBER)
   - Member removal (admin only)

3. **Board Management**
   - Create/edit/delete boards
   - Drag-and-drop sections
   - Real-time updates

4. **Issue Management**
   - Create issues in sections
   - Edit issue title/description
   - Assign/unassign users (IssueMapping)
   - Delete issues
   - Issue details modal

5. **User Experience**
   - Toast notifications for actions (success/error)
   - Confirmation dialogs for destructive actions
   - Loading states during API calls
   - Empty states with helpful messaging
   - Responsive design (mobile-first)

---

## DESIGN GUIDELINES

- **Typography**: Use system fonts (Inter/Segoe UI) for performance
- **Spacing**: 8px grid system
- **Shadows**: Subtle elevation using Tailwind utilities
- **Transitions**: 200-300ms ease-in-out for smooth animations
- **Mobile**: Responsive down to 320px width
- **Dark Mode**: Default theme, no light mode needed
- **Accessibility**: Focus indicators, ARIA labels, semantic HTML

---

## DEPLOYMENT & ENVIRONMENT

- **Frontend Port**: 5173 (Vite default)
- **API Base URL**: Read from `.env.local` (default: `http://localhost:3000`)
- **JWT Storage**: Secure httpOnly cookies (if backend supports) or localStorage
- **CORS**: Already enabled on backend

---

## DELIVERABLES

1. Complete React frontend with all pages & components
2. Full TypeScript type definitions
3. Integrated API service layer with error handling
4. Zustand store for global state management
5. Dark theme TailwindCSS configuration
6. Responsive design (mobile, tablet, desktop)
7. ESLint & Prettier configuration
8. README with setup & development instructions
9. Environment file template (.env.local.example)

---

## ACCEPTANCE CRITERIA

✅ Users can signup/login with JWT authentication  
✅ All API endpoints integrated and working  
✅ Dark theme with purple/cyan accents applied consistently  
✅ Aceternity UI components used throughout  
✅ Drag-and-drop kanban board fully functional  
✅ Real-time-ready (WebSocket integration points marked)  
✅ Responsive design works on all devices  
✅ No console errors or warnings  
✅ Loading states and error handling implemented  
✅ Type-safe throughout (no `any` types)  

---

**Start building the premium frontend! Focus on UI excellence, smooth animations, and seamless API integration.** 🚀
