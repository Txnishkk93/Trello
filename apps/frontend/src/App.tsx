import { Navigate, Route, Routes } from "react-router-dom";
import { Login } from "./pages/Login";
import { Signup } from "./pages/Signup";
import { Organizations } from "./pages/Organizations";
import { Boards } from "./pages/Boards";
import { BoardDetail } from "./pages/BoardDetail";
import { IssueDetail } from "./pages/IssueDetail";
import { OrgMembers } from "./pages/OrgMembers";
import { AppLayout } from "./components/layout/AppLayout";
import { ProtectedRoute } from "./routes/ProtectedRoute";
import { LandingPage } from "./pages/LandingPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/orgs" element={<Organizations />} />
        <Route path="/orgs/:orgId/members" element={<OrgMembers />} />
        <Route path="/orgs/:orgId/boards" element={<Boards />} />
        <Route path="/orgs/:orgId/boards/:boardId" element={<BoardDetail />} />
        <Route path="/orgs/:orgId/boards/:boardId/issues/:issueId" element={<IssueDetail />} />
      </Route>

      <Route path="/dashboard" element={<Navigate to="/orgs" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-2 bg-canvas text-ink">
      <p className="text-sm font-medium">Page not found</p>
      <a href="/" className="text-xs text-ink2 hover:underline">
        Go back home
      </a>
    </div>
  );
}
