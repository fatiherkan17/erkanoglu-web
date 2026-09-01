"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [nextPath, setNextPath] = useState("/admin");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const value = new URLSearchParams(window.location.search).get("next");
    if (value && value.startsWith("/admin") && !value.startsWith("//")) {
      setNextPath(value);
    }
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading || !password) return;

    try {
      setLoading(true);
      setError("");
      const response = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result?.message || "Giriş yapılamadı.");
      router.replace(nextPath);
      router.refresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Giriş yapılamadı.");
      setPassword("");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f5f2eb] px-6 py-12 text-[#171717]">
      <div className="w-full max-w-md">
        <div className="border border-[#d8d3c8] bg-[#f8f5ef] p-8 md:p-10">
          <p className="text-[9px] uppercase tracking-[0.25em] text-[#8d8579]">Erkanoğlu Yönetim</p>
          <h1 className="mt-5 text-4xl font-light tracking-[-0.04em]">Yönetim paneli</h1>
          <p className="mt-3 text-sm leading-6 text-[#777064]">Devam etmek için yönetici şifrenizi girin.</p>

          <form onSubmit={submit} className="mt-8">
            <label className="block">
              <span className="text-[9px] uppercase tracking-[0.2em] text-[#8d8579]">Şifre</span>
              <input
                type="password"
                autoComplete="current-password"
                autoFocus
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-2 w-full border border-[#aaa398] bg-transparent px-4 py-4 text-sm outline-none transition focus:border-black"
                placeholder="Yönetici şifresi"
              />
            </label>

            {error && <p className="mt-4 border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>}

            <button
              type="submit"
              disabled={loading || !password}
              className="mt-5 w-full border border-black bg-black px-5 py-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-white transition hover:bg-black/80 disabled:opacity-40"
            >
              {loading ? "GİRİŞ YAPILIYOR..." : "YÖNETİME GİR →"}
            </button>
          </form>
        </div>
        <p className="mt-5 text-center text-[9px] uppercase tracking-[0.16em] text-[#a0998e]">Korumalı yönetim alanı</p>
      </div>
    </main>
  );
}
