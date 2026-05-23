import LoginForm from "./login-form";

export const metadata = {
  title: "Connexion — Ihsan",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const sp = await searchParams;
  return <LoginForm next={sp.next || "/"} />;
}
