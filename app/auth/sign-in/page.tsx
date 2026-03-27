import { createServerClient } from "@/lib/supabase/server";

export default async function LoginPage() {
  const supabase = await createServerClient();
  const { data } = await supabase.auth.getUser();

  if (data.user) {
    return (
      <main style={{ padding: 24 }}>
        <h1>Login</h1>
        <p>Je bent al ingelogd als {data.user.email}</p>
      </main>
    );
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>Login</h1>
      <form action="/auth/sign-in" method="post">
        <input name="email" type="email" placeholder="Email" required />
        <button type="submit">Stuur magic link</button>
      </form>
    </main>
  );
}