export default function Contact() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-semibold">Contact</h1>
        <p className="opacity-80 mt-1">We'd love to hear from you.</p>
      </header>
      <div className="card p-4 grid md:grid-cols-2 gap-6">
        <div>
          <h2 className="font-semibold mb-2">Head Office (Demo)</h2>
          <address className="not-italic text-sm opacity-90 leading-6">
            FinSmart Ltd (Demo)<br />
            221B Baker Street<br />
            Marylebone, London NW1 6XE<br />
            United Kingdom
          </address>
          <div className="text-sm opacity-90 mt-3">
            Phone: +44 20 7946 0991 (demo)
            <br />Email: hello@finsmart.demo
          </div>
        </div>
        <form className="space-y-3" onSubmit={(e)=>{e.preventDefault(); alert('Thanks! This is a demo.')}}>
          <div className="grid grid-cols-2 gap-2">
            <input className="input" placeholder="First name" required />
            <input className="input" placeholder="Last name" required />
          </div>
          <input className="input" placeholder="Email" type="email" required />
          <textarea className="input min-h-[120px]" placeholder="Message" required />
          <button className="btn w-full" type="submit">Send</button>
        </form>
      </div>
    </div>
  )
}

