"use client";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { io } from "socket.io-client";

export default function AgentDashboard() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const socketRef = useRef(null);

  const fetchLeads = async () => {
    try {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");
      const role = localStorage.getItem("role");
      const res = await fetch("/api/leads", {
        headers: {
          Authorization: `Bearer ${token}`,
          "x-user-id": userId,
          "x-user-role": role,
        },
      });
      const data = await res.json();
      setLeads(Array.isArray(data) ? data : []);
      setLoading(false);
    } catch (err) {
      console.error("Fetch leads error:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/login";
      return;
    }
    fetchLeads();

    const initSocket = async () => {
      await fetch("/api/socket");
      if (!socketRef.current) {
        socketRef.current = io();
        socketRef.current.on("connect", () =>
          console.log("Agent: Connected to Socket")
        );
        socketRef.current.on("update-ui", () => fetchLeads());
      }
    };

    initSocket();
    const interval = setInterval(fetchLeads, 30000);

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      clearInterval(interval);
    };
  }, []);

  const handleUpdate = async (id, updatedData) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`/api/leads/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedData),
      });

      if (res.ok) {
        if (socketRef.current) {
          socketRef.current.emit("lead-activity", {
            message: "Lead Updated by Agent",
            leadId: id,
          });
        }
        fetchLeads();
      }
    } catch (err) {
      console.error("Update lead error:", err);
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
      console.error("Timeline fetch error:", err);
    }
  };

  const handleWhatsApp = (phone) => {
    if (!phone) return alert("No phone number found for this lead.");
    const cleanNumber = phone.replace(/\D/g, "");
    window.open(`https://wa.me/${cleanNumber}`, "_blank");
  };

  const logout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-black text-gray-900 italic tracking-tighter">
              MY ACTIVE PIPELINE
            </h1>
            <p className="text-gray-500 text-xs font-bold uppercase">
              Personal Lead Tracking & WhatsApp Outreach
            </p>
          </div>
          <div className="flex gap-4">
            <Link
              href="/agent/add-lead"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold shadow-lg hover:bg-blue-700 transition"
            >
              + New Lead
            </Link>
            <button
              onClick={logout}
              className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-bold hover:bg-red-600 hover:text-white transition"
            >
              Logout
            </button>
          </div>
        </div>

        {/* SMART SUMMARY BAR */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-4 rounded-xl border-l-4 border-red-500 shadow-sm">
            <p className="text-xs font-black text-gray-400 uppercase">Overdue Actions</p>
            <p className="text-2xl font-black text-red-600">
              {
                leads.filter(
                  (l) =>
                    l.followUpDate &&
                    new Date(l.followUpDate) < new Date() &&
                    l.status !== "Closed"
                ).length
              }
            </p>
          </div>
          <div className="bg-white p-4 rounded-xl border-l-4 border-yellow-500 shadow-sm">
            <p className="text-xs font-black text-gray-400 uppercase">Stale Leads (7+ Days)</p>
            <p className="text-2xl font-black text-yellow-600">
              {
                leads.filter(
                  (l) =>
                    (new Date() - new Date(l.updatedAt)) / (1000 * 60 * 60 * 24) > 7
                ).length
              }
            </p>
          </div>
          <div className="bg-white p-4 rounded-xl border-l-4 border-green-500 shadow-sm">
            <p className="text-xs font-black text-gray-400 uppercase">Total Leads</p>
            <p className="text-2xl font-black text-gray-800">{leads.length}</p>
          </div>
        </div>

        {/* MAIN TABLE */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
          <table className="w-full text-left">
            <thead className="bg-gray-100 border-b border-gray-200 text-gray-600 text-xs uppercase font-black">
              <tr>
                <th className="p-4">Lead / Budget</th>
                <th className="p-4">Status & Priority</th>
                <th className="p-4">Follow-up Date</th>
                <th className="p-4">Actions</th>
                <th className="p-4">Internal Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {!loading && leads.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-10 text-center text-gray-400 italic">
                    No leads assigned yet. Create your first lead!
                  </td>
                </tr>
              )}
              {!loading &&
                leads.map((lead) => {
                  const isOverdue =
                    lead.followUpDate &&
                    new Date(lead.followUpDate) < new Date() &&
                    lead.status !== "Closed";
                  const isStale =
                    (new Date() - new Date(lead.updatedAt)) / (1000 * 60 * 60 * 24) > 7;

                  return (
                    <tr
                      key={lead._id}
                      className={`${isOverdue ? "bg-red-50" : isStale ? "bg-yellow-50" : "hover:bg-blue-50"} transition`}
                    >
                      <td className="p-4">
                        <div className="font-bold text-gray-900">{lead.name}</div>
                        <div className="text-xs text-gray-500">
                          PKR {lead.budget?.toLocaleString()}
                        </div>
                      </td>
                      <td className="p-4">
                        <select
                          value={lead.status}
                          onChange={(e) =>
                            handleUpdate(lead._id, { status: e.target.value })
                          }
                          className="bg-white border border-gray-300 rounded text-xs p-1 mb-2 block"
                        >
                          <option value="New">New</option>
                          <option value="Contacted">Contacted</option>
                          <option value="Negotiating">Negotiating</option>
                          <option value="Closed">Closed</option>
                        </select>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-black uppercase ${
                            lead.score === "High"
                              ? "bg-red-100 text-red-700"
                              : lead.score === "Medium"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {lead.score}
                        </span>
                      </td>
                      <td className="p-4">
                        <input
                          type="date"
                          defaultValue={
                            lead.followUpDate ? lead.followUpDate.split("T")[0] : ""
                          }
                          onChange={(e) =>
                            handleUpdate(lead._id, { followUpDate: e.target.value })
                          }
                          className={`text-xs p-1 border rounded outline-none ${
                            isOverdue
                              ? "border-red-500 bg-red-100 text-red-700"
                              : "border-gray-300"
                          }`}
                        />
                        {isOverdue && (
                          <p className="text-xs font-black text-red-600 mt-1">⚠️ OVERDUE</p>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col gap-2">
                          <button
                            onClick={() => fetchTimeline(lead)}
                            className="text-xs font-black bg-gray-800 text-white px-3 py-1 rounded hover:bg-blue-600 transition"
                          >
                            HISTORY
                          </button>
                          <button
                            onClick={() => handleWhatsApp(lead.phone)}
                            className="text-xs font-black bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition"
                          >
                            WHATSAPP
                          </button>
                        </div>
                      </td>
                      <td className="p-4">
                        <textarea
                          defaultValue={lead.notes}
                          onBlur={(e) =>
                            handleUpdate(lead._id, { notes: e.target.value })
                          }
                          className="w-full h-12 text-xs p-2 border border-gray-200 rounded-md text-gray-800 focus:ring-1 focus:ring-blue-500"
                          placeholder="Auto-saves on leave..."
                        />
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
          {loading && (
            <div className="p-10 text-center text-gray-500 font-bold uppercase tracking-widest animate-pulse">
              Syncing Pipeline...
            </div>
          )}
        </div>
      </div>

      {/* ACTIVITY TIMELINE MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
            <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
              <div>
                <h2 className="font-black text-gray-900 uppercase italic">Lead History</h2>
                <p className="text-xs text-gray-500 font-bold">{selectedLead?.name}</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-black text-2xl"
              >
                &times;
              </button>
            </div>
            <div className="p-6 max-h-96 overflow-y-auto space-y-4">
              {timeline.length === 0 ? (
                <p className="text-center text-gray-400 italic py-4">No events recorded.</p>
              ) : (
                timeline.map((log) => (
                  <div key={log._id} className="relative pl-6 border-l-2 border-blue-200 py-1">
                    <div className="absolute -left-1.5 top-2 w-3 h-3 bg-blue-600 rounded-full border-2 border-white"></div>
                    <p className="text-xs font-black text-blue-700 uppercase">{log.action}</p>
                    <p className="text-xs text-gray-700 mt-0.5">{log.details}</p>
                    <p className="text-xs text-gray-400 mt-1 italic">
                      {new Date(log.timestamp).toLocaleString()}
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
