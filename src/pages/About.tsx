export default function About() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-semibold">About FinSmart</h1>
        <p className="opacity-80 mt-1">A modern, privacy‑first personal finance demo.</p>
      </header>

      <section className="grid md:grid-cols-2 gap-4">
        <div className="card p-4">
          <h2 className="font-semibold mb-2">What you can do</h2>
          <ul className="list-disc ml-5 space-y-1 text-sm opacity-90">
            <li>Create multiple accounts and cards</li>
            <li>Record income/expenses and attach notes</li>
            <li>Send transfers via bank details or user search</li>
            <li>Budgets, statements (PDF), insights, notifications</li>
          </ul>
        </div>
        <div className="card p-4">
          <h2 className="font-semibold mb-2">Security model</h2>
          <ul className="list-disc ml-5 space-y-1 text-sm opacity-90">
            <li>HttpOnly cookies for session tokens</li>
            <li>JWT access + refresh rotation</li>
            <li>Rate limiting and input validation on API</li>
          </ul>
        </div>
      </section>

      <section className="card p-4">
        <h2 className="font-semibold mb-2">How to use</h2>
        <ol className="list-decimal ml-5 space-y-2 text-sm opacity-90">
          <li>Sign up or log in. A demo account may be pre-seeded.</li>
          <li>Create extra accounts in Settings → Accounts.</li>
          <li>Add expenses or income under Transactions; attach notes.</li>
          <li>Send money under Transfers. Search a user or use bank details.</li>
          <li>Set budgets and review analytics and insights.</li>
          <li>Download monthly statements (PDF) or share a read-only link.</li>
        </ol>
      </section>
    </div>
  )
}

