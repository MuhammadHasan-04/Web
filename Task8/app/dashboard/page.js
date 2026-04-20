import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { logout } from "@/actions/auth";

export default async function Dashboard() {
  await connectDB();

  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;

  if (!session) {
    redirect("/login");
  }

  const user = await User.findById(session);

  if (!user) {
    redirect("/login");
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Dashboard</h1>

      <div style={styles.card}>
        <p style={styles.text}>
          Logged in as: <b>{user.email}</b>
        </p>

        <form action={logout}>
          <button style={styles.button}>Logout</button>
        </form>
      </div>

      <footer style={styles.footer}>
        <div style={styles.logo}>AuthFlow</div>
        <p style={styles.copy}>© 2026 AuthFlow. All rights reserved.</p>
      </footer>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    background: "#f4f6f8",
    fontFamily: "Arial",
  },
  title: {
    fontSize: "32px",
    marginBottom: "20px",
  },
  card: {
    padding: "20px",
    background: "white",
    borderRadius: "10px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
    textAlign: "center",
  },
  text: {
    marginBottom: "15px",
    fontSize: "18px",
  },
  button: {
    padding: "10px 20px",
    background: "#ff4d4d",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
  footer: {
    marginTop: "40px",
    textAlign: "center",
  },
  logo: {
    fontSize: "22px",
    fontWeight: "bold",
    color: "#4f46e5",
    letterSpacing: "1px",
  },
  copy: {
    fontSize: "12px",
    color: "#666",
    marginTop: "5px",
  },
};
