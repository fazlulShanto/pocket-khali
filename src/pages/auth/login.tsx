import * as React from "react"
import { useNavigate } from "@tanstack/react-router"
import { signIn, signUp, signInWithMagicLink } from "@/lib/auth"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Loader2, Cloud, Mail, Lock, Sparkles, CheckCircle2, ArrowLeft } from "lucide-react"
import { Link } from "@tanstack/react-router"

type AuthTab = "signin" | "signup"
type FormState = "idle" | "loading" | "magic-sent"

export function LoginPage() {
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()

  const [tab, setTab] = React.useState<AuthTab>("signin")
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [formState, setFormState] = React.useState<FormState>("idle")

  // Redirect if already signed in
  React.useEffect(() => {
    if (!authLoading && user) {
      navigate({ to: "/settings" })
    }
  }, [user, authLoading, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setFormState("loading")
    try {
      if (tab === "signup") {
        await signUp(email, password)
        toast.success("Account created! Check your email to confirm your address.")
        setTab("signin")
      } else {
        await signIn(email, password)
        toast.success("Welcome back!")
        navigate({ to: "/settings" })
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Authentication failed"
      toast.error(msg)
    } finally {
      setFormState("idle")
    }
  }

  const handleMagicLink = async () => {
    if (!email) {
      toast.error("Enter your email address first")
      return
    }
    setFormState("loading")
    try {
      await signInWithMagicLink(email)
      setFormState("magic-sent")
      toast.success("Magic link sent! Check your inbox.")
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to send magic link"
      toast.error(msg)
      setFormState("idle")
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background relative overflow-hidden">
      {/* Ambient background blobs */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
      >
        <div className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] max-w-[400px] max-h-[400px] rounded-full bg-primary/10 blur-[80px]" />
        <div className="absolute bottom-[-5%] right-[-5%] w-[50vw] h-[50vw] max-w-[350px] max-h-[350px] rounded-full bg-blue-500/10 blur-[80px]" />
      </div>

      {/* Back button */}
      <div className="relative z-10 p-4">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to app
        </Link>
      </div>

      {/* Centre content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-6">
        {/* Logo / branding */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
            <Cloud className="w-8 h-8 text-primary-foreground" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight">Cloud Sync</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Back up and sync your expenses across devices
            </p>
          </div>
        </div>

        {/* Card */}
        <div className="w-full max-w-sm bg-card border rounded-2xl shadow-xl overflow-hidden">
          {/* Tab switcher */}
          <div className="flex border-b">
            {(["signin", "signup"] as AuthTab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-3.5 text-sm font-semibold transition-all ${
                  tab === t
                    ? "text-foreground border-b-2 border-primary -mb-px"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t === "signin" ? "Sign In" : "Create Account"}
              </button>
            ))}
          </div>

          <div className="p-6 space-y-4">
            {formState === "magic-sent" ? (
              /* Magic link sent state */
              <div className="flex flex-col items-center gap-4 py-4 text-center">
                <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-green-500" />
                </div>
                <div>
                  <p className="font-semibold">Check your inbox!</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    We sent a magic link to <strong className="text-foreground">{email}</strong>.
                    Click it to sign in.
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={() => setFormState("idle")} className="mt-2">
                  Use password instead
                </Button>
              </div>
            ) : (
              /* Normal form */
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-9"
                      required
                      autoComplete="email"
                      disabled={formState === "loading"}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder={tab === "signup" ? "Create a strong password" : "Your password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-9"
                      required
                      autoComplete={tab === "signup" ? "new-password" : "current-password"}
                      disabled={formState === "loading"}
                      minLength={tab === "signup" ? 8 : undefined}
                    />
                  </div>
                  {tab === "signup" && (
                    <p className="text-xs text-muted-foreground">Minimum 8 characters</p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={formState === "loading"}
                >
                  {formState === "loading" ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : null}
                  {tab === "signin" ? "Sign In" : "Create Account"}
                </Button>

                {/* Divider */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-xs text-muted-foreground">or</span>
                  <div className="flex-1 h-px bg-border" />
                </div>

                {/* Magic Link */}
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleMagicLink}
                  disabled={formState === "loading"}
                >
                  <Sparkles className="w-4 h-4 mr-2 text-primary" />
                  Send me a magic link
                </Button>
              </form>
            )}
          </div>
        </div>

        {/* Footer note */}
        <p className="mt-6 text-xs text-muted-foreground text-center max-w-xs">
          Your data is encrypted and only you can access it. The app works fully offline without an
          account.
        </p>
      </div>
    </div>
  )
}
