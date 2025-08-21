import AuthCard from "@/components/AuthCard";

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <AuthCard loginHref="/login" contactHref="/contact" />
    </main>
  );
}
