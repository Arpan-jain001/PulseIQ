// src/user/pages/UserWorkspaces.jsx
// User apne sab workspaces dekh sakta hai jisme invite hua hai
// Role ke hisaab se access milta hai
import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2, FolderKanban, BarChart3, Users,
  Eye, RefreshCw, ArrowRight, Crown, Shield, Zap
} from "lucide-react";
import UserLayout from "../components/UserLayout";
import { useUserApi } from "../hooks/useUserApi";
import { useAuth } from "../../hooks/useAuth";

const ROLE_CFG = {
  OWNER:  { color: "#f43f8e", label: "Owner",  icon: Crown,  desc: "Full access",           analytics: true,  projects: true,  members: true  },
  ADMIN:  { color: "#a855f7", label: "Admin",  icon: Shield, desc: "Manage workspace",       analytics: true,  projects: true,  members: true  },
  MEMBER: { color: "#00e5ff", label: "Member", icon: Users,  desc: "View & contribute",      analytics: true,  projects: true,  members: true  },
  VIEWER: { color: "#10d990", label: "Viewer", icon: Eye,    desc: "View only — read access", analytics: false, projects: false, members: false },
};

const UserWorkspaces = () => {
  const { getMyWorkspaces, getWorkspaceMembers, getProjects, loading } = useUserApi();
  const { user } = useAuth();
  const [memberships, setMemberships] = useState([]);
  const [projects, setProjects]       = useState([]);
  const [membersMap, setMembersMap]   = useState({});
  const [expanded, setExpanded]       = useState(null);

  const load = useCallback(async () => {
    try {
      const [ws, proj] = await Promise.all([getMyWorkspaces(), getProjects()]);
      setMemberships(ws?.data || []);
      setProjects(proj?.data || []);
    } catch {}
  }, []);

  useEffect(() => { load(); }, [load]);

  const toggleExpand = async (wsId) => {
    if (expanded === wsId) { setExpanded(null); return; }
    setExpanded(wsId);
    if (!membersMap[wsId]) {
      try {
        const res = await getWorkspaceMembers(wsId);
        setMembersMap(m => ({ ...m, [wsId]: res?.data || [] }));
      } catch {}
    }
  };

  // getMyWorkspaces returns workspace objects (not memberships with role)
  // We need to find user's role — check membersMap or default to MEMBER
  const getUserRole = (wsId) => {
    const members = membersMap[wsId] || [];
    const myMembership = members.find(m => m.userId?._id === user?._id || m.userId === user?._id);
    return myMembership?.role || "MEMBER";
  };

  return (
    <UserLayout>
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <p className="text-[10px] text-[#00e5ff] uppercase tracking-[0.3em] mb-1"
            style={{ fontFamily: "var(--font-mono)" }}>User / Workspaces</p>
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-black text-[#e8f4ff] uppercase" style={{ fontFamily: "var(--font-display)" }}>
              My Workspaces
            </h1>
            <motion.button whileTap={{ scale: 0.95 }} onClick={load}
              className="px-3 py-2 rounded-xl border border-[#1a2a4a] text-[#3d6080] hover:text-[#00e5ff] hover:border-[#00e5ff33] transition-all">
              <RefreshCw className="w-4 h-4" />
            </motion.button>
          </div>
        </motion.div>

        {/* Role legend */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
          {Object.entries(ROLE_CFG).map(([role, cfg]) => {
            const Icon = cfg.icon;
            return (
              <div key={role} className="p-3 rounded-xl bg-[#060d18] border border-[#1a2a4a] flex items-center gap-2">
                <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: cfg.color }} />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: cfg.color, fontFamily: "var(--font-mono)" }}>{cfg.label}</p>
                  <p className="text-[9px] text-[#3d6080]" style={{ fontFamily: "var(--font-mono)" }}>{cfg.desc}</p>
                </div>
              </div>
            );
          })}
        </motion.div>

        {/* Workspaces */}
        {loading && memberships.length === 0 ? (
          <div className="flex justify-center py-20">
            <motion.div className="w-10 h-10 rounded-full border-2 border-[#00e5ff33] border-t-[#00e5ff]"
              animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.9, ease: "linear" }} />
          </div>
        ) : memberships.length === 0 ? (
          <div className="text-center py-20">
            <Building2 className="w-12 h-12 text-[#1a3a6b] mx-auto mb-4" />
            <p className="text-sm font-bold text-[#3d6080] mb-2">No workspaces yet</p>
            <p className="text-[11px] text-[#1a3a6b] max-w-xs mx-auto" style={{ fontFamily: "var(--font-mono)" }}>
              You haven't been invited to any workspace. Ask an organizer to invite you using your email: <span className="text-[#00e5ff]">{user?.email}</span>
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {memberships.map((ws, i) => {
              // ws could be workspace object directly or membership object
              const wsObj = ws?.workspaceId || ws;
              const wsId  = wsObj?._id || ws._id;
              const role  = expanded === wsId ? getUserRole(wsId) : "MEMBER"; // will update after expand
              const cfg   = ROLE_CFG[role] || ROLE_CFG.MEMBER;
              const RoleIcon = cfg.icon;

              // Projects for this workspace
              const wsProjects = projects.filter(p =>
                (p.workspaceId?._id || p.workspaceId) === wsId
              );

              return (
                <motion.div key={wsId || i}
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                  className="rounded-2xl border border-[#1a2a4a] bg-[#060d18] overflow-hidden hover:border-[#00e5ff22] transition-all"
                  style={{ boxShadow: "0 4px 24px #00000055" }}>

                  <div className="h-[2px]" style={{ background: `linear-gradient(90deg,#00e5ff,#10d990,transparent)` }} />

                  {/* Workspace row */}
                  <div className="flex items-center gap-4 p-5">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00e5ff] to-[#10d990] flex items-center justify-center text-base font-black text-[#020408] flex-shrink-0"
                      style={{ fontFamily: "var(--font-display)" }}>
                      {wsObj?.name?.charAt(0) || "W"}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-black text-[#e8f4ff]">{wsObj?.name || "Workspace"}</p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="text-[9px] px-2 py-0.5 rounded-full border uppercase tracking-wider font-bold"
                          style={{ color: wsObj?.status === "ACTIVE" ? "#10d990" : "#f59e0b", borderColor: wsObj?.status === "ACTIVE" ? "#10d99030" : "#f59e0b30", background: wsObj?.status === "ACTIVE" ? "#10d99010" : "#f59e0b10", fontFamily: "var(--font-mono)" }}>
                          {wsObj?.status || "ACTIVE"}
                        </span>
                        <span className="text-[9px] text-[#3d6080]" style={{ fontFamily: "var(--font-mono)" }}>
                          {wsObj?.createdAt ? new Date(wsObj.createdAt).toLocaleDateString() : "—"}
                        </span>
                      </div>
                    </div>

                    {/* Projects count */}
                    <div className="hidden sm:flex flex-col items-center px-4">
                      <p className="text-lg font-black text-[#e8f4ff]" style={{ fontFamily: "var(--font-display)" }}>{wsProjects.length}</p>
                      <p className="text-[9px] text-[#3d6080] uppercase tracking-wider" style={{ fontFamily: "var(--font-mono)" }}>Projects</p>
                    </div>

                    {/* Toggle details */}
                    <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                      onClick={() => toggleExpand(wsId)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#1a2a4a] text-[#3d6080] hover:text-[#00e5ff] hover:border-[#00e5ff33] transition-all text-[10px] font-bold uppercase tracking-wider"
                      style={{ fontFamily: "var(--font-mono)" }}>
                      {expanded === wsId ? "Close" : "Details"}
                    </motion.button>
                  </div>

                  {/* Expanded section */}
                  <AnimatePresence>
                    {expanded === wsId && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden border-t border-[#1a2a4a]">
                        <div className="p-5 space-y-5">

                          {/* My role */}
                          <div className="flex items-center gap-3 p-4 rounded-2xl border"
                            style={{ borderColor: `${ROLE_CFG[getUserRole(wsId)]?.color || "#00e5ff"}22`, background: `${ROLE_CFG[getUserRole(wsId)]?.color || "#00e5ff"}08` }}>
                            {(() => { const R = ROLE_CFG[getUserRole(wsId)] || ROLE_CFG.MEMBER; const I = R.icon; return <I className="w-5 h-5 flex-shrink-0" style={{ color: R.color }} />; })()}
                            <div>
                              <p className="text-xs font-black" style={{ color: ROLE_CFG[getUserRole(wsId)]?.color || "#00e5ff" }}>
                                Your Role: {ROLE_CFG[getUserRole(wsId)]?.label || "Member"}
                              </p>
                              <p className="text-[10px] text-[#3d6080]" style={{ fontFamily: "var(--font-mono)" }}>
                                {ROLE_CFG[getUserRole(wsId)]?.desc}
                              </p>
                            </div>
                          </div>

                          {/* Projects */}
                          {ROLE_CFG[getUserRole(wsId)]?.projects && (
                            <div>
                              <p className="text-[10px] text-[#00e5ff] uppercase tracking-widest mb-3 flex items-center gap-2"
                                style={{ fontFamily: "var(--font-mono)" }}>
                                <FolderKanban className="w-3.5 h-3.5" /> Projects ({wsProjects.length})
                              </p>
                              {wsProjects.length === 0 ? (
                                <p className="text-[11px] text-[#1a3a6b] px-3" style={{ fontFamily: "var(--font-mono)" }}>No projects yet</p>
                              ) : (
                                <div className="space-y-2">
                                  {wsProjects.map(proj => (
                                    <div key={proj._id} className="flex items-center gap-3 p-3 rounded-xl bg-[#04080f] border border-[#1a2a4a]">
                                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#00e5ff] to-[#10d990] flex items-center justify-center text-[11px] font-black text-[#020408] flex-shrink-0"
                                        style={{ fontFamily: "var(--font-display)" }}>
                                        {proj.name?.charAt(0)}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className="text-xs font-bold text-[#e8f4ff] truncate">{proj.name}</p>
                                        {proj.allowedDomains?.length > 0 && (
                                          <p className="text-[9px] text-[#3d6080] truncate" style={{ fontFamily: "var(--font-mono)" }}>
                                            {proj.allowedDomains.join(", ")}
                                          </p>
                                        )}
                                      </div>
                                      {ROLE_CFG[getUserRole(wsId)]?.analytics && (
                                        <Link to={`/dashboard/workspace/${wsId}/project/${proj._id}`}
                                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#00e5ff30] text-[#00e5ff] hover:bg-[#00e5ff10] transition-all text-[10px] uppercase tracking-wider font-bold flex-shrink-0"
                                          style={{ fontFamily: "var(--font-mono)" }}>
                                          <BarChart3 className="w-3 h-3" /> Analytics
                                        </Link>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}

                          {/* Members */}
                          {ROLE_CFG[getUserRole(wsId)]?.members && (
                            <div>
                              <p className="text-[10px] text-[#a855f7] uppercase tracking-widest mb-3 flex items-center gap-2"
                                style={{ fontFamily: "var(--font-mono)" }}>
                                <Users className="w-3.5 h-3.5" /> Team ({membersMap[wsId]?.length || 0})
                              </p>
                              <div className="space-y-2">
                                {(membersMap[wsId] || []).map(m => {
                                  const rc = ROLE_CFG[m.role]?.color || "#8ab4d4";
                                  return (
                                    <div key={m._id} className="flex items-center gap-3 p-3 rounded-xl bg-[#04080f] border border-[#1a2a4a]">
                                      <div className="w-8 h-8 rounded-xl flex items-center justify-center text-[11px] font-black text-[#020408] flex-shrink-0"
                                        style={{ background: rc, fontFamily: "var(--font-display)" }}>
                                        {m.userId?.name?.charAt(0) || "?"}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className="text-xs font-bold text-[#e8f4ff] truncate">
                                          {m.userId?.name || "Unknown"}
                                          {m.userId?._id === user?._id && (
                                            <span className="ml-2 text-[9px] text-[#00e5ff]">(you)</span>
                                          )}
                                        </p>
                                        <p className="text-[10px] text-[#3d6080] truncate" style={{ fontFamily: "var(--font-mono)" }}>{m.userId?.email}</p>
                                      </div>
                                      <span className="text-[9px] px-2 py-0.5 rounded-full border uppercase tracking-wider font-bold flex-shrink-0"
                                        style={{ color: rc, borderColor: `${rc}30`, background: `${rc}10`, fontFamily: "var(--font-mono)" }}>
                                        {m.role}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {/* Viewer — restricted */}
                          {!ROLE_CFG[getUserRole(wsId)]?.analytics && (
                            <div className="p-4 rounded-xl border border-[#f59e0b30] bg-[#f59e0b08] flex items-center gap-3">
                              <Eye className="w-4 h-4 text-[#f59e0b] flex-shrink-0" />
                              <p className="text-[11px] text-[#f59e0b]" style={{ fontFamily: "var(--font-mono)" }}>
                                Viewer role — you can see workspace info but cannot access analytics or projects.
                                Contact the organizer to upgrade your role.
                              </p>
                            </div>
                          )}

                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </UserLayout>
  );
};

export default UserWorkspaces;