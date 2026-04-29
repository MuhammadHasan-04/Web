import { login } from "@/actions/auth";

export default function Login() {
  return (
    <form action={login} className="form">
      <h2>Login</h2>

      <input name="email" type="email" placeholder="Email" required />
      <input name="password" type="password" placeholder="Password" required />

      <button type="submit">Login</button>
    </form>
  );
}

