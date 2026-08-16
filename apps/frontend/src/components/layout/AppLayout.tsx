import { NavLink, Outlet, useNavigate, useParams } from "react-router-dom";
import { Building2, LayoutGrid, LogOut, Boxes } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useEffect, useState } from "react";
import { listOrgs } from "../../api/orgs";
import type { Organization } from "../../types";

export function AppLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { orgId } = useParams();
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const activeOrg = orgs.find((o) => o.id === orgId);

  useEffect(() => {
    listOrgs().then(setOrgs).catch(() => {});
  }, []);

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="flex h-screen w-full bg-canvas text-ink">
      <aside className="flex w-56 shrink-0 flex-col border-r border-line bg-surface">
        <div className="flex h-12 items-center gap-2 border-b border-line px-3.5">
          <Boxes className="size-4 text-ink" strokeWidth={1.75} />
          <span className="text-sm font-semibold tracking-tight">Flow</span>
        </div>

        <nav className="flex-1 overflow-y-auto p-2">
          <NavLink
            to="/orgs"
            end
            className={({ isActive }) =>
              `flex items-center gap-2 rounded px-2.5 py-1.5 text-sm transition-colors ${
                isActive ? "bg-surface2 text-ink" : "text-ink2 hover:bg-surface2 hover:text-ink"
              }`
            }
          >
            <Building2 className="size-3.5" strokeWidth={1.75} />
            Organizations
          </NavLink>

          {activeOrg && (
            <div className="mt-4">
              <p className="px-2.5 pb-1 text-xs font-medium uppercase tracking-wide text-ink3">
                {activeOrg.username}
              </p>
              <NavLink
                to={`/orgs/${orgId}/boards`}
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded px-2.5 py-1.5 text-sm transition-colors ${
                    isActive ? "bg-surface2 text-ink" : "text-ink2 hover:bg-surface2 hover:text-ink"
                  }`
                }
              >
                <LayoutGrid className="size-3.5" strokeWidth={1.75} />
                Boards
              </NavLink>
            </div>
          )}
        </nav>

        <div className="border-t border-line p-2">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2 rounded px-2.5 py-1.5 text-sm text-ink2 transition-colors hover:bg-surface2 hover:text-ink"
          >
            <LogOut className="size-3.5" strokeWidth={1.75} />
            Log out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
