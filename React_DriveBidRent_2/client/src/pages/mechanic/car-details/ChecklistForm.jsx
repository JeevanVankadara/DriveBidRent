// client/src/pages/mechanic/car-details/ChecklistForm.jsx
//
// The mechanic's inspection report. Deliberately short: three 1-5 ratings and
// a note. It replaced a four-section, ~20-field checklist that took far longer
// to fill in than anyone actually did.
import { useState } from 'react';
import toast from 'react-hot-toast';
import axiosInstance from '../../../utils/axiosInstance.util';

const RATING_LABELS = {
  1: 'Poor',
  2: 'Below average',
  3: 'Average',
  4: 'Good',
  5: 'Excellent',
};

const RatingField = ({ label, hint, name, value, onChange }) => (
  <fieldset className="hub-surface-card p-5">
    <legend className="sr-only">{label}</legend>
    <div className="flex items-baseline justify-between gap-4 mb-1">
      <span className="font-semibold hub-text-foreground">{label}</span>
      <span className="text-sm hub-text-primary font-semibold">
        {value}/5 · {RATING_LABELS[value]}
      </span>
    </div>
    {hint && <p className="text-xs hub-text-muted mb-3">{hint}</p>}

    <div className="flex gap-2" role="radiogroup" aria-label={label}>
      {[1, 2, 3, 4, 5].map((n) => {
        const active = value === n;
        return (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={`${label}: ${n} out of 5 — ${RATING_LABELS[n]}`}
            onClick={() => onChange(name, n)}
            className={`flex-1 h-11 rounded-xl border font-semibold transition-colors ${
              active
                ? 'hub-bg-primary border-transparent'
                : 'hub-bg-card hub-border-c hub-text-foreground hover:hub-bg-secondary'
            }`}
            style={active ? undefined : { borderWidth: 1, borderStyle: 'solid' }}
          >
            {n}
          </button>
        );
      })}
    </div>
  </fieldset>
);

export default function ChecklistForm({ vehicleId, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    interiorRating: 3,
    engineRating: 3,
    overallRating: 3,
    additionalNotes: '',
  });

  const setRating = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.additionalNotes.trim()) {
      const msg = 'Please add a few notes about the vehicle before submitting.';
      setError(msg);
      toast.error(msg);
      return;
    }

    setLoading(true);
    setError('');
    try {
      await axiosInstance.post(`/mechanic/submit-inspection/${vehicleId}`, {
        interiorRating: form.interiorRating,
        engineRating: form.engineRating,
        overallRating: form.overallRating,
        additionalNotes: form.additionalNotes.trim(),
      });
      toast.success('Inspection report submitted');
      if (onSuccess) onSuccess();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit the inspection report';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="hub-surface-card p-6 md:p-8 mt-8">
      <header className="mb-6">
        <span className="hub-eyebrow hub-text-primary">Inspection</span>
        <h2 className="hub-display text-2xl mt-1">Submit your report</h2>
        <p className="hub-text-muted text-sm mt-1">
          Rate each area from 1 to 5, then add anything the buyer and auction manager should know.
        </p>
      </header>

      {error && (
        <div
          role="alert"
          className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <RatingField
          label="Interior condition"
          hint="Seats, dashboard, trim, electronics and air conditioning."
          name="interiorRating"
          value={form.interiorRating}
          onChange={setRating}
        />
        <RatingField
          label="Engine condition"
          hint="Startup, idle, noise, leaks and battery health."
          name="engineRating"
          value={form.engineRating}
          onChange={setRating}
        />
        <RatingField
          label="Overall condition"
          hint="Your single verdict on the vehicle as a whole."
          name="overallRating"
          value={form.overallRating}
          onChange={setRating}
        />

        <div className="hub-surface-card p-5">
          <label htmlFor="additionalNotes" className="block font-semibold hub-text-foreground mb-1">
            Additional notes <span className="text-red-500">*</span>
          </label>
          <p className="text-xs hub-text-muted mb-3">
            Anything worth flagging — damage, recent repairs, things to budget for.
          </p>
          <textarea
            id="additionalNotes"
            className="hub-input"
            rows={5}
            value={form.additionalNotes}
            onChange={(e) => {
              setForm((prev) => ({ ...prev, additionalNotes: e.target.value }));
              setError('');
            }}
            placeholder="e.g. Bodywork is straight with light scuffing on the rear bumper. Engine starts cleanly, no leaks. Front tyres need replacing within 5,000 km."
          />
        </div>

        <button type="submit" disabled={loading} className="hub-cta w-full justify-center disabled:opacity-60">
          {loading ? 'Submitting...' : 'Submit inspection report'}
        </button>
      </form>
    </div>
  );
}
