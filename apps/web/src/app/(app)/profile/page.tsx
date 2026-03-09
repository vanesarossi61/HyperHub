export default function ProfilePage() {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold text-[var(--foreground)]">Mi Perfil</h1>
      <div className="rounded-2xl border border-[var(--border)] p-8 text-center">
        <p className="text-lg text-[var(--muted-foreground)]">
          Configura tu perfil, preferencias sensoriales e intereses aqui.
        </p>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">
          Todo es opcional. Comparte solo lo que te haga sentir comodo/a.
        </p>
      </div>
    </div>
  )
}
