import { useState } from 'react';
import SectionTitle from '../components/section-title.jsx';
import { Link } from 'react-router-dom';
import { api } from '../api/api.js';

export default function Contact() {
  const [ticketLoading, setTicketLoading] = useState(false);
  const [ticketError, setTicketError] = useState('');
  const [ticketCreated, setTicketCreated] = useState(null);
  const [trackId, setTrackId] = useState('');
  const [trackEmail, setTrackEmail] = useState('');
  const [trackedTicket, setTrackedTicket] = useState(null);
  const [trackError, setTrackError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    setTicketError('');
    setTicketCreated(null);
    setTicketLoading(true);
    const formData = new FormData(event.currentTarget);
    try {
      const ticket = await api.submitSupportTicket(Object.fromEntries(formData.entries()));
      setTicketCreated(ticket);
      form.reset();
    } catch (error) {
      setTicketError(error.message || 'Could not submit your request.');
    } finally {
      setTicketLoading(false);
    }
  };

  const handleTrack = async (event) => {
    event.preventDefault();
    setTrackError('');
    setTrackedTicket(null);
    try {
      const ticket = await api.getSupportTicket(trackId.trim(), trackEmail.trim());
      setTrackedTicket(ticket);
    } catch (error) {
      setTrackError(error.message || 'Could not find that support request.');
    }
  };

  return (
    <section className="py-4 sm:py-8">
      <SectionTitle
        centered
        eyebrow="We’re here to help"
        title="Get in touch"
        description="Questions about a product, shipping, or an order? We’d love to hear from you."
      />

      <div className="mx-auto max-w-4xl grid gap-8 sm:grid-cols-2 mt-8">
        <div className="rounded-3xl bg-white/80 border border-[#D49A9A]/60 p-8 sm:p-10 shadow-sm hover:shadow-md transition-shadow">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#AA5E7A]/20 text-[#7C0E44] text-lg mb-4">
            ✉️
          </span>
          <h2 className="text-lg font-bold text-[#381E29]">Email us</h2>
          <p className="mt-2 text-sm leading-6 text-[#5E2F44] font-medium">
            The quickest way to reach us is by email. Our team responds promptly within 24 hours.
          </p>
          <a
            href="mailto:hello@fastbuy.example"
            className="mt-6 inline-block text-sm font-bold text-[#7C0E44] hover:underline"
          >
            hello@fastbuy.example →
          </a>
        </div>

        <div className="rounded-3xl bg-white/80 border border-[#D49A9A]/60 p-8 sm:p-10 shadow-sm hover:shadow-md transition-shadow">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#AA5E7A]/20 text-[#7C0E44] text-lg mb-4">
            📦
          </span>
          <h2 className="text-lg font-bold text-[#381E29]">Order questions</h2>
          <p className="mt-2 text-sm leading-6 text-[#5E2F44] font-medium">
            Need to check on an order you placed on this device? View real-time tracking in your history.
          </p>
          <Link
            to="/orders"
            className="mt-6 inline-block text-sm font-bold text-[#7C0E44] hover:underline"
          >
            View order history →
          </Link>
        </div>
      </div>

      <div className="mx-auto mt-10 grid max-w-4xl gap-8 lg:grid-cols-2">
        <form onSubmit={handleSubmit} className="space-y-4 rounded-3xl border border-[#D49A9A]/60 bg-white/80 p-6 shadow-sm sm:p-8">
          <div>
            <h2 className="text-xl font-bold text-[#381E29]">Send us a message</h2>
            <p className="mt-1 text-sm text-[#5E2F44]">Our team will review your request and reply here.</p>
          </div>
          <label className="field-label">
            Your name
            <input name="name" required maxLength="100" className="field-input" />
          </label>
          <label className="field-label">
            Email address
            <input name="email" type="email" required maxLength="254" className="field-input" />
          </label>
          <label className="field-label">
            Subject
            <input name="subject" required maxLength="160" className="field-input" />
          </label>
          <label className="field-label">
            Message
            <textarea name="message" required maxLength="5000" rows="5" className="field-input" />
          </label>
          {ticketError && <p role="alert" className="rounded-xl border border-red-300 bg-red-50 p-3 text-sm text-red-800">{ticketError}</p>}
          {ticketCreated && (
            <p role="status" className="rounded-xl border border-green-300 bg-green-50 p-3 text-sm text-green-800">
              Request submitted. Save this reference to check replies: <strong>{ticketCreated.id}</strong>
            </p>
          )}
          <button
            type="submit"
            disabled={ticketLoading}
            className="w-full rounded-xl bg-[#7C0E44] px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#630A36] disabled:opacity-50"
          >
            {ticketLoading ? 'Submitting…' : 'Submit request'}
          </button>
        </form>

        <div className="space-y-4 rounded-3xl border border-[#D49A9A]/60 bg-white/80 p-6 shadow-sm sm:p-8">
          <div>
            <h2 className="text-xl font-bold text-[#381E29]">Check a support request</h2>
            <p className="mt-1 text-sm text-[#5E2F44]">Use your reference and the email used to submit it.</p>
          </div>
          <form onSubmit={handleTrack} className="space-y-4">
            <label className="field-label">
              Ticket reference
              <input value={trackId} onChange={(event) => setTrackId(event.target.value)} required className="field-input" />
            </label>
            <label className="field-label">
              Email address
              <input type="email" value={trackEmail} onChange={(event) => setTrackEmail(event.target.value)} required className="field-input" />
            </label>
            {trackError && <p role="alert" className="rounded-xl border border-red-300 bg-red-50 p-3 text-sm text-red-800">{trackError}</p>}
            <button type="submit" className="w-full rounded-xl border border-[#AA5E7A] bg-white px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-[#7C0E44] hover:bg-[#AA5E7A]/15">
              Find request
            </button>
          </form>
          {trackedTicket && (
            <div className="rounded-2xl border border-[#D49A9A]/50 bg-[#F2DACE]/40 p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-[#7C0E44]">
                {trackedTicket.subject} · {trackedTicket.status}
              </p>
              <div className="mt-3 space-y-3">
                {trackedTicket.replies.map((reply, index) => (
                  <p key={`${reply.createdAt}-${index}`} className="rounded-xl bg-white/80 p-3 text-sm text-[#381E29]">
                    <span className="font-bold">{reply.author === 'admin' ? 'Fastbuy Support' : 'You'}:</span> {reply.message}
                  </p>
                ))}
                {!trackedTicket.replies.length && <p className="text-sm text-[#5E2F44]">No replies yet.</p>}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
