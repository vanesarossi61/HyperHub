import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <SignIn
        appearance={{
          elements: {
            rootBox: 'mx-auto',
            card: 'rounded-2xl shadow-lg',
          },
        }}
      />
    </main>
  )
}
