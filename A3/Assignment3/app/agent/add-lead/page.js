"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AddLeadPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    budget: "",
    propertyInterest: "Residential",
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");
    const role = localStorage.getItem("role");

    const res = await fetch("/api/leads", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "x-user-id": userId,
        "x-user-role": role,
      },
      body: JSON.stringify({ ...formData, budget: Number(formData.budget) }),
    });

    if (res.ok) {
      router.push("/agent/dashboard");
    } else {
      const data = await res.json();
      setError(data.error || "Failed to create lead");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white p-10 rounded-3xl shadow-2xl max-w-xl w-full border border-gray-100">
        <Link href="/agent/dashboard" className="text-blue-600 font-bold text-sm">
          ← Back to Dashboard
        </Link>
        <h2 className="text-3xl font-black text-gray-900 mt-4 mb-8">New Lead Intake</h2>

        {error && (
          <div className="bg-red-50 border border-red-300 text-red-600 text-sm p-3 rounded-xl mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            required
            placeholder="Client Name"
            className="w-full p-4 border rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <input
            required
            type="email"
            placeholder="Email Address"
            className="w-full p-4 border rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          <input
            type="text"
            placeholder="Phone Number (e.g. 923001234567)"
            className="w-full p-4 border rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
          <input
            required
            type="number"
            placeholder="Budget (PKR)"
            className="w-full p-4 border rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.budget}
            onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
          />

          <select
            className="w-full p-4 border rounded-xl text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.propertyInterest}
            onChange={(e) => setFormData({ ...formData, propertyInterest: e.target.value })}
          >
            <option value="Residential">Residential</option>
            <option value="Commercial">Commercial</option>
            <option value="Plot">Plot</option>
          </select>

          <textarea
            placeholder="Initial Notes..."
            className="w-full p-4 border rounded-xl text-gray-900 h-24 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          />

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-700 font-bold">
            💡 Priority is auto-assigned: High (PKR 20M+), Medium (PKR 10M–20M), Low (below 10M)
          </div>

          <button
            disabled={loading}
            className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black shadow-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? "Saving..." : "CREATE LEAD"}
          </button>
        </form>
      </div>
    </div>
  );
}
