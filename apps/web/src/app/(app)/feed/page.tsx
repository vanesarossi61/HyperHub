export default function FeedPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold text-[var(--foreground)]">Feed</h1>
      <div className="rounded-2xl border border-[var(--border)] p-8 text-center">
        <p className="text-lg text-[var(--muted-foreground)]">
          Tu feed personalizado aparecera aqui.
        </p>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">
          Sin algoritmos de engagement. Solo contenido de tu comunidad, a tu ritmo.
        </p>
      </div>
    </div>
  )
}
