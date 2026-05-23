"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "./actions";
import { useI18n } from "@/components/i18n-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const initialState: LoginState = {};

export default function LoginForm({ next }: { next: string }) {
  const { t } = useI18n();
  const [state, action, pending] = useActionState(loginAction, initialState);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <form
        action={action}
        className="w-full max-w-sm flex flex-col gap-5 rounded-2xl border bg-card p-6 shadow-sm"
      >
        <div className="flex items-center gap-3">
          <span className="text-3xl">☪️</span>
          <div>
            <h1 className="text-lg font-bold text-primary">Ihsan</h1>
            <p className="text-xs text-muted-foreground">{t.login.subtitle}</p>
          </div>
        </div>

        <input type="hidden" name="next" value={next} />

        <div className="flex flex-col gap-2">
          <label htmlFor="username" className="text-sm font-medium">
            {t.login.username}
          </label>
          <Input
            id="username"
            name="username"
            autoComplete="username"
            required
            autoFocus
            // Les gestionnaires de mots de passe (Bitwarden, LastPass, etc.)
            // injectent des attributs sur les inputs après l'hydration → mismatch.
            suppressHydrationWarning
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="password" className="text-sm font-medium">
            {t.login.password}
          </label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            suppressHydrationWarning
          />
        </div>

        {state.error && (
          <p className="text-sm text-destructive" role="alert">
            {state.error}
          </p>
        )}

        <Button type="submit" disabled={pending} className="w-full">
          {pending ? t.login.submitPending : t.login.submit}
        </Button>
      </form>
    </div>
  );
}
