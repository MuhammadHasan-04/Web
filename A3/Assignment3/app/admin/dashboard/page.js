"use client";
import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";

export default function AdminDashboard() {
  const [leads, setLeads] = useState([]);
  const [agents, setAgents] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [filterDate, setFilterDate] = useState("");

  // Timeline Modal
  const [selectedLead, setSelectedLead] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const socketRef = useRef();

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");
      const role = localStorage.getItem("role");
      const headers = {
        Authorization: `Bearer ${token}`,
        "x-user-id": userId,
        "x-user-role": role,
      };
      const [leadRes, agentRes, analyticsRes] = await Promise.all([
        fetch("/api/leads", { headers }),
        fetch("/api/admin/agents", { headers }),
        fetch("/api/admin/analytics", { headers }),
      ]);
      if (leadRes.ok) {
        const data = await leadRes.json();
        setLeads(Array.isArray(data) ? data : []);
      }
      if (agentRes.ok) setAgents(await agentRes.json());
      if (analyticsRes.ok) setAnalytics(await analyticsRes.json());
      setLoading(false);
    } catch (err) {
      console.error("Dashboard Fetch Error:", err);
      setLoading(false);
    }
  };

  const fetchTimeline = async (lead) => {
    setSelectedLead(lead);
    setShowModal(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/leads/${lead._id}/timeline`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setTimeline(data);
    } catch (err) {
      console.error("Timeline Fetch Error:", err);
    }
  };

  useEffect(() => {
    const role = localStorage.getItem("role");
    const token = localStorage.getItem("token");
    if (!token || role?.toLowerCase() !== "admin") {
      window.location.href = "/login";
      return;
    }
    fetchData();

    const initSocket = async () => {
      await fetch("/api/socket");
      if (!socketRef.current) {
        socketRef.current = io();
        socketRef.current.on("connect", () =>
          console.log("Admin Socket: Connected")
        );
        socketRef.current.on("update-ui", () => {
          console.log("Admin: Real-time update received");
          fetchData();
        });
      }
    };
    initSocket();

    // Polling fallback every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => {
      if (socketRef.current) { socketRef.current.disconnect(); socketRef.current = null; }
      clearInterval(interval);
    };
  }, []);

  const handleAssign = async (leadId, agentId) => {
    const token = localStorage.getItem("token");
    const res = await fetch("/api/admin/assign", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ leadId, agentId }),
    });
    if (res.ok) {
      if (socketRef.current) socketRef.current.emit("lead-activity", { message: "Lead Reassigned by Admin", leadId });
      fetchData();
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Permanently delete this lead?")) return;
    const token = localStorage.getItem("token");
    const res = await fetch(`/api/admin/delete-lead?id=${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      if (socketRef.current) socketRef.current.emit("lead-activity", { message: "Lead Deleted by Admin", leadId: id });
      fetchData();
    }
  };

  // Apply filters client-side
  const filteredLeads = leads.filter((lead) => {
    if (filterStatus && lead.status !== filterStatus) return false;
    if (filterPriority && lead.score !== filterPriority) return false;
    if (filterDate) {
      const leadDate = new Date(lead.createdAt).toISOString().split("T")[0];
      if (leadDate !== filterDate) return false;
    }
    return true;
  });

  if (loading)
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white font-bold">
        Initializing Command Center...
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-black text-blue-400 tracking-tighter uppercase">CRM Admin Command</h1>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Audit Trails & Agent Performance</p>
          </div>
          <button
            onClick={() => { localStorage.clear(); window.location.href = "/login"; }}
            className="bg-red-600 px-4 py-2 rounded text-sm font-bold hover:bg-red-700 transition"
          >
            Logout
          </button>
        </div>

        {/* ANALYTICS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <div className="bg-gray-800 p-6 rounded-2xl border-b-4 border-blue-500 shadow-xl">
            <p className="text-gray-400 text-xs font-black uppercase">Total Pipeline</p>
            <p className="text-4xl font-black mt-1">{leads.length}</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-2xl border-b-4 border-red-500 shadow-xl">
            <p className="text-gray-400 text-xs font-black uppercase">High Priority</p>
            <p className="text-4xl font-black mt-1 text-red-500">
              {analytics?.priorityDistribution?.find((p) => p._id === "High")?.count || 0}
            </p>
          </div>
          <div className="bg-gray-800 p-6 rounded-2xl border-b-4 border-green-500 shadow-xl">
            <p className="text-gray-400 text-xs font-black uppercase">Closed Deals</p>
            <p className="text-4xl font-black mt-1 text-green-500">
              {analytics?.statusDistribution?.find((s) => s._id === "Closed")?.count || 0}
            </p>
          </div>
          <div className="bg-gray-800 p-6 rounded-2xl border-b-4 border-yellow-500 shadow-xl">
            <p className="text-gray-400 text-xs font-black uppercase">Conversion Rate</p>
            <p className="text-4xl font-black mt-1">
              {leads.length > 0
                ? (((analytics?.statusDistribution?.find((s) => s._id === "Closed")?.count || 0) / leads.length) * 100).toFixed(0)
                : 0}%
            </p>
          </div>
        </div>

        {/* STATUS + PRIORITY DISTRIBUTION */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
          <div className="bg-gray-800 p-6 rounded-3xl border border-gray-700">
            <h2 className="text-sm font-black text-gray-400 uppercase mb-4 tracking-widest">Lead Status Distribution</h2>
            <div className="space-y-3">
              {["New", "Contacted", "Negotiating", "Closed"].map((s) => {
                const count = analytics?.statusDistribution?.find((x) => x._id === s)?.count || 0;
                const pct = leads.length > 0 ? Math.round((count / leads.length) * 100) : 0;
                return (
                  <div key={s}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-bold text-gray-300">{s}</span>
                      <span className="text-gray-500">{count} leads ({pct}%)</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full transition-all" style={{ width: `${pct}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-gray-800 p-6 rounded-3xl border border-gray-700">
            <h2 className="text-sm font-black text-gray-400 uppercase mb-4 tracking-widest">Priority Distribution</h2>
            <div className="space-y-3">
              {[{ id: "High", color: "bg-red-500" }, { id: "Medium", color: "bg-yellow-500" }, { id: "Low", color: "bg-green-500" }].map(({ id, color }) => {
                const count = analytics?.priorityDistribution?.find((x) => x._id === id)?.count || 0;
                const pct = leads.length > 0 ? Math.round((count / leads.length) * 100) : 0;
                return (
                  <div key={id}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-bold text-gray-300">{id} Priority</span>
                      <span className="text-gray-500">{count} leads ({pct}%)</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div className={`${color} h-2 rounded-full transition-all`} style={{ width: `${pct}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* AGENT PERFORMANCE */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          <div className="lg:col-span-2 bg-gray-800 p-6 rounded-3xl border border-gray-700">
            <h2 className="text-sm font-black text-gray-400 uppercase mb-6 tracking-widest">Agent Performance Overview</h2>
            <div className="space-y-4">
              {analytics?.agentPerformance?.length === 0 && (
                <p className="text-gray-500 text-sm italic">No agents registered yet.</p>
              )}
              {analytics?.agentPerformance?.map((agent) => (
                <div key={agent._id} className="flex items-center justify-between bg-gray-900/50 p-4 rounded-xl">
                  <span className="font-bold text-blue-200">{agent.name}</span>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-xs text-gray-500 uppercase">Leads</p>
                      <p className="font-black">{agent.totalLeads}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 uppercase">Closed</p>
                      <p className="font-black text-green-400">{agent.closedLeads}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 uppercase">Success Rate</p>
                      <p className="font-black text-blue-400">
                        {Math.round((agent.closedLeads / (agent.totalLeads || 1)) * 100)}%
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-blue-600/10 p-6 rounded-3xl border border-blue-500/30 flex flex-col justify-center items-center text-center">
            <h3 className="text-blue-400 font-black uppercase text-xs mb-2">Overdue Follow-ups</h3>
            <p className="text-4xl font-black text-white">
              {leads.filter((l) => l.followUpDate && new Date(l.followUpDate) < new Date() && l.status !== "Closed").length}
            </p>
            <p className="text-gray-400 text-xs uppercase font-bold mt-2">Actions Detected</p>
            <div className="mt-4 w-full">
              <p className="text-xs text-gray-500 font-bold uppercase mb-1">Stale Leads (7+ days)</p>
              <p className="text-2xl font-black text-yellow-400">
                {leads.filter((l) => (new Date() - new Date(l.updatedAt)) / (1000 * 60 * 60 * 24) > 7).length}
              </p>
            </div>
          </div>
        </div>

        {/* FILTERS BAR */}
        <div className="bg-gray-800 rounded-2xl p-4 mb-4 border border-gray-700 flex flex-wrap items-center gap-4">
          <p className="text-xs font-black text-gray-400 uppercase tracking-widest">🔍 Filters:</p>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-gray-900 border border-gray-700 text-xs p-2 rounded-lg text-white"
          >
            <option value="">All Statuses</option>
            <option value="New">New</option>
            <option value="Contacted">Contacted</option>
            <option value="Negotiating">Negotiating</option>
            <option value="Closed">Closed</option>
          </select>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="bg-gray-900 border border-gray-700 text-xs p-2 rounded-lg text-white"
          >
            <option value="">All Priorities</option>
            <option value="High">🔴 High</option>
            <option value="Medium">🟡 Medium</option>
            <option value="Low">🟢 Low</option>
          </select>
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="bg-gray-900 border border-gray-700 text-xs p-2 rounded-lg text-white"
          />
          {(filterStatus || filterPriority || filterDate) && (
            <button
              onClick={() => { setFilterStatus(""); setFilterPriority(""); setFilterDate(""); }}
              className="text-xs font-bold text-red-400 hover:text-red-300"
            >
              ✕ Clear
            </button>
          )}
          <span className="ml-auto text-xs text-gray-500 font-bold">
            {filteredLeads.length} / {leads.length} leads
          </span>
        </div>

        {/* MAIN TABLE */}
        <div className="bg-gray-800 rounded-3xl overflow-hidden shadow-2xl border border-gray-700">
          <table className="w-full text-left">
            <thead className="bg-gray-700/50 text-xs font-black uppercase text-gray-400">
              <tr>
                <th className="p-5">Lead</th>
                <th className="p-5">Priority</th>
                <th className="p-5">Status / Indicators</th>
                <th className="p-5">Assign Agent</th>
                <th className="p-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredLeads.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-10 text-center text-gray-500 italic">
                    No leads match the current filters.
                  </td>
                </tr>
              )}
              {filteredLeads.map((lead) => {
                const isOverdue =
                  lead.followUpDate &&
                  new Date(lead.followUpDate) < new Date() &&
                  lead.status !== "Closed";
                const isStale =
                  (new Date() - new Date(lead.updatedAt)) / (1000 * 60 * 60 * 24) > 7;
                return (
                  <tr
                    key={lead._id}
                    className={`${isOverdue ? "bg-red-900/10" : isStale ? "bg-yellow-900/10" : ""} hover:bg-gray-700/30 transition-colors`}
                  >
                    <td className="p-5">
                      <p className="font-bold text-white">{lead.name}</p>
                      <p className="text-xs text-gray-400">{lead.email}</p>
                      <p className="text-xs text-gray-500 mt-0.5">PKR {lead.budget?.toLocaleString()}</p>
                    </td>
                    <td className="p-5">
                      <span
                        className={`px-2 py-1 rounded text-xs font-black ${
                          lead.score === "High" ? "bg-red-500/20 text-red-400"
                          : lead.score === "Medium" ? "bg-yellow-500/20 text-yellow-400"
                          : "bg-green-500/20 text-green-400"
                        }`}
                      >
                        {lead.score}
                      </span>
                    </td>
                    <td className="p-5">
                      <p className="text-xs text-blue-400 uppercase font-black">{lead.status}</p>
                      {isOverdue && <span className="text-xs font-black text-red-500 block animate-pulse mt-1">⚠️ OVERDUE</span>}
                      {isStale && <span className="text-xs font-black text-yellow-500 block mt-1">💤 STALE</span>}
                      {!isOverdue && !isStale && <span className="text-xs font-black text-green-600 block mt-1">✓ HEALTHY</span>}
                    </td>
                    <td className="p-5">
                      <select
                        className="bg-gray-900 border border-gray-700 text-xs p-2 rounded-lg text-white w-full"
                        value={lead.assignedTo?._id || ""}
                        onChange={(e) => handleAssign(lead._id, e.target.value)}
                      >
                        <option value="">Unassigned</option>
                        {agents.map((a) => (
                          <option key={a._id} value={a._id}>{a.name}</option>
                        ))}
                      </select>
                      {lead.assignedTo?.name && (
                        <p className="text-xs text-gray-500 mt-1">→ {lead.assignedTo.name}</p>
                      )}
                    </td>
                    <td className="p-5 text-right space-x-2">
                      <button
                        onClick={() => fetchTimeline(lead)}
                        className="bg-blue-600/20 text-blue-400 px-3 py-1.5 rounded text-xs font-bold hover:bg-blue-600 hover:text-white transition"
                      >
                        History
                      </button>
                      <button
                        onClick={() => handleDelete(lead._id)}
                        className="bg-red-600/20 text-red-500 px-3 py-1.5 rounded text-xs font-bold hover:bg-red-600 hover:text-white transition"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* TIMELINE MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 w-full max-w-lg rounded-3xl border border-gray-700 shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-gray-700 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-black text-blue-400 uppercase italic">Activity Trail</h2>
                <p className="text-xs text-gray-500">{selectedLead?.name}</p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white text-2xl">&times;</button>
            </div>
            <div className="p-6 max-h-96 overflow-y-auto space-y-6">
              {timeline.length === 0 ? (
                <p className="text-center text-gray-500 italic py-10">No activities recorded yet.</p>
              ) : (
                timeline.map((log) => (
                  <div key={log._id} className="relative pl-6 border-l-2 border-blue-500/30 py-1">
                    <div className="absolute -left-1.5 top-2 w-3 h-3 bg-blue-500 rounded-full border-2 border-gray-800"></div>
                    <p className="text-xs font-black text-blue-400 uppercase">{log.action}</p>
                    <p className="text-sm text-gray-200 mt-1">{log.details}</p>
                    <p className="text-xs text-gray-500 mt-1 italic">
                      By {log.performedBy?.name || "System"} • {new Date(log.timestamp).toLocaleString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
