import { signup } from "@/actions/auth";

export default function Signup() {
  return (
    <form action={signup} className="form">
      <h2>Signup</h2>

      <input name="email" type="email" placeholder="Email" required />
      <input name="password" type="password" placeholder="Password" required />

      <button type="submit">Create Account</button>
    </form>
  );
}
