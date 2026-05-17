export default function HomePage() {
  return (
    <main className="min-h-[calc(100vh-0px)] flex items-center justify-center p-6 bg-gray-50">
      <div className="w-full max-w-xl rounded-2xl border bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-gray-900">PebloNotes</h1>
        <p className="mt-2 text-sm text-gray-600">
          Secure notes with tags, archiving, public sharing, and AI-assisted
          actions.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <a
            className="inline-flex items-center justify-center rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-900"
            href="/login"
          >
            Login
          </a>

          <a
            className="inline-flex items-center justify-center rounded-lg border px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50"
            href="/signup"
          >
            Create account
          </a>

          <a
            className="ml-auto inline-flex items-center justify-center rounded-lg border px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50"
            href="/app"
          >
            Open app →
          </a>
        </div>

        <div className="mt-6 rounded-lg bg-gray-50 p-4 text-sm text-gray-700">
          <p className="font-medium text-gray-900">Demo tips</p>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li>Create an account, then create notes with tags.</li>
            <li>Use search + tag filters.</li>
            <li>Share a note publicly and open the link in incognito.</li>
            <li>Use AI actions (mock mode works without an API key).</li>
          </ul>
        </div>
      </div>
    </main>
  );
}