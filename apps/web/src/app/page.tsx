import Link from 'next/link'

export default function LandingPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="mx-auto max-w-2xl text-center">
        {/* Logo / Brand */}
        <div className="mb-8">
          <h1 className="text-5xl font-bold tracking-tight text-[var(--foreground)]">
            Hyper<span className="text-brand-600">Hub</span>
          </h1>
          <p className="mt-2 text-lg text-[var(--muted-foreground)]">
            Tu Espacio Seguro
          </p>
        </div>

        {/* Hero Text */}
        <p className="mb-8 text-xl leading-relaxed text-[var(--muted-foreground)]">
          La primera red social construida entendiendo como funciona tu cerebro.
          Sin sobrecarga sensorial. Sin presion social. A tu ritmo.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/sign-up"
            className="inline-flex h-12 items-center justify-center rounded-xl bg-brand-600 px-8 text-base font-medium text-white transition-colors hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
          >
            Crear Cuenta
          </Link>
          <Link
            href="/sign-in"
            className="inline-flex h-12 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--background)] px-8 text-base font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
          >
            Iniciar Sesion
          </Link>
        </div>

        {/* Values */}
        <div className="mt-16 grid gap-6 sm:grid-cols-3">
          <div className="rounded-2xl border border-[var(--border)] p-6">
            <div className="mb-3 text-2xl">&#x1F50B;</div>
            <h3 className="mb-1 font-semibold text-[var(--foreground)]">
              Bateria Social
            </h3>
            <p className="text-sm text-[var(--muted-foreground)]">
              Indica tu nivel de energia y la app se adapta
            </p>
          </div>
          <div className="rounded-2xl border border-[var(--border)] p-6">
            <div className="mb-3 text-2xl">&#x1F3A8;</div>
            <h3 className="mb-1 font-semibold text-[var(--foreground)]">
              Preferencias Sensoriales
            </h3>
            <p className="text-sm text-[var(--muted-foreground)]">
              Personaliza colores, animaciones y densidad visual
            </p>
          </div>
          <div className="rounded-2xl border border-[var(--border)] p-6">
            <div className="mb-3 text-2xl">&#x1F91D;</div>
            <h3 className="mb-1 font-semibold text-[var(--foreground)]">
              Body Doubling
            </h3>
            <p className="text-sm text-[var(--muted-foreground)]">
              Trabaja acompanado/a en salas virtuales
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
