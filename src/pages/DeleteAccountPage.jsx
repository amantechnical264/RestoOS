import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const REASONS = [
  'I no longer use the app',
  'I have a duplicate account',
  'Privacy concerns',
  'Too many notifications',
  'App experience issues',
  'Switching to another service',
  'Other',
];

export default function DeleteAccountPage() {
  const [mobile, setMobile] = useState('');
  const [reason, setReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!/^[6-9]\d{9}$/.test(mobile.trim())) {
      newErrors.mobile = 'Enter a valid 10-digit Indian mobile number.';
    }
    if (!reason) {
      newErrors.reason = 'Please select a reason.';
    }
    if (reason === 'Other' && !customReason.trim()) {
      newErrors.customReason = 'Please describe your reason.';
    }
    if (!agreed) {
      newErrors.agreed = 'You must acknowledge the consequences.';
    }
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1800);
  };

  return (
    <div className="da-root">
      <div className="da-bg-gradient" />

      <header className="da-header">
        <div className="da-header-inner">
          <div className="da-logo">
            <span className="da-logo-icon">R</span>
            <span className="da-logo-text">Relaya</span>
          </div>
        </div>
      </header>

      <main className="da-main">
        <AnimatePresence mode="wait">
          {submitted ? (
            <motion.div
              key="success"
              className="da-card da-success-card"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="da-success-icon">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h2 className="da-success-title">Request Received</h2>
              <p className="da-success-body">
                Your account deletion request has been submitted. Our team will process it within <strong>7 business days</strong>. You will receive a confirmation SMS on <strong>+91 {mobile}</strong>.
              </p>
              <p className="da-success-note">
                Changed your mind? Email us at <a href="mailto:support@relaya.in" className="da-link">support@relaya.in</a> within 48 hours.
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              className="da-card"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="da-warning-banner">
                <svg className="da-warning-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                <span>This action is <strong>permanent</strong> and cannot be undone.</span>
              </div>

              <div className="da-title-group">
                <h1 className="da-title">Relaya Account Deletion</h1>
                <p className="da-subtitle">
                  We are sorry to see you go. Submitting this form will permanently delete your Relaya account and all associated data including orders, preferences, and payment history.
                </p>
              </div>

              <form onSubmit={handleSubmit} noValidate className="da-form">
                <div className="da-field">
                  <label htmlFor="da-mobile" className="da-label">Registered Mobile Number</label>
                  <div className={"da-input-wrapper" + (errors.mobile ? " da-input-error" : "")}>
                    <span className="da-prefix">+91</span>
                    <input
                      id="da-mobile"
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      placeholder="9876543210"
                      value={mobile}
                      onChange={(e) => {
                        setMobile(e.target.value.replace(/\D/g, ''));
                        if (errors.mobile) setErrors((prev) => ({ ...prev, mobile: '' }));
                      }}
                      className="da-input"
                      autoComplete="tel"
                    />
                  </div>
                  {errors.mobile && <p className="da-error-msg">{errors.mobile}</p>}
                </div>

                <div className="da-field">
                  <label htmlFor="da-reason" className="da-label">Reason for Deletion</label>
                  <div className={"da-select-wrapper" + (errors.reason ? " da-input-error" : "")}>
                    <select
                      id="da-reason"
                      value={reason}
                      onChange={(e) => {
                        setReason(e.target.value);
                        if (errors.reason) setErrors((prev) => ({ ...prev, reason: '' }));
                      }}
                      className="da-select"
                    >
                      <option value="">Select a reason…</option>
                      {REASONS.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                    <span className="da-select-chevron">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </span>
                  </div>
                  {errors.reason && <p className="da-error-msg">{errors.reason}</p>}
                </div>

                <AnimatePresence>
                  {reason === 'Other' && (
                    <motion.div
                      className="da-field"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <label htmlFor="da-custom-reason" className="da-label">Please describe your reason</label>
                      <textarea
                        id="da-custom-reason"
                        rows={3}
                        placeholder="Tell us more…"
                        value={customReason}
                        onChange={(e) => {
                          setCustomReason(e.target.value);
                          if (errors.customReason) setErrors((prev) => ({ ...prev, customReason: '' }));
                        }}
                        className={"da-textarea" + (errors.customReason ? " da-input-error" : "")}
                      />
                      {errors.customReason && <p className="da-error-msg">{errors.customReason}</p>}
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="da-consequences">
                  <p className="da-consequences-title">Deleting your account will permanently remove:</p>
                  <ul className="da-consequences-list">
                    {[
                      'All order history & receipts',
                      'Saved addresses & preferences',
                      'Loyalty points & offers',
                      'Profile & personal data',
                    ].map((item) => (
                      <li key={item} className="da-consequence-item">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10" />
                          <line x1="15" y1="9" x2="9" y2="15" />
                          <line x1="9" y1="9" x2="15" y2="15" />
                        </svg>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className={"da-checkbox-row" + (errors.agreed ? " da-checkbox-error" : "")}>
                  <input
                    id="da-agreed"
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => {
                      setAgreed(e.target.checked);
                      if (errors.agreed) setErrors((prev) => ({ ...prev, agreed: '' }));
                    }}
                    className="da-checkbox"
                  />
                  <label htmlFor="da-agreed" className="da-checkbox-label">
                    I understand that this action is irreversible and all my data will be permanently deleted.
                  </label>
                </div>
                {errors.agreed && <p className="da-error-msg da-error-msg--top">{errors.agreed}</p>}

                <button type="submit" id="da-submit-btn" className="da-submit-btn" disabled={loading}>
                  {loading ? (
                    <span className="da-spinner" />
                  ) : (
                    <>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                        <path d="M10 11v6M14 11v6" />
                        <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
                      </svg>
                      Submit Deletion Request
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="da-footer">
        <p>&copy; {new Date().getFullYear()} Relaya. All rights reserved.</p>
        <p>Need help? <a href="mailto:support@relaya.in" className="da-link">support@relaya.in</a></p>
      </footer>

      <style>{`
        .da-root {
          min-height: 100vh;
          background: #0a0a0f;
          color: #e8e8f0;
          font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
          position: relative;
          display: flex;
          flex-direction: column;
        }
        .da-bg-gradient {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 0;
          background:
            radial-gradient(ellipse 70% 50% at 20% -10%, rgba(220,38,38,0.18) 0%, transparent 60%),
            radial-gradient(ellipse 50% 40% at 80% 110%, rgba(161,10,10,0.14) 0%, transparent 60%);
        }
        .da-header {
          position: relative;
          z-index: 10;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          background: rgba(10,10,15,0.8);
          backdrop-filter: blur(12px);
        }
        .da-header-inner {
          max-width: 600px;
          margin: 0 auto;
          padding: 16px 24px;
        }
        .da-logo { display: flex; align-items: center; gap: 10px; }
        .da-logo-icon {
          width: 34px; height: 34px;
          border-radius: 10px;
          background: linear-gradient(135deg, #dc2626, #991b1b);
          display: flex; align-items: center; justify-content: center;
          font-weight: 800; font-size: 16px; color: #fff;
          box-shadow: 0 0 18px rgba(220,38,38,0.4);
        }
        .da-logo-text { font-size: 18px; font-weight: 700; letter-spacing: -0.4px; color: #fff; }
        .da-main {
          position: relative; z-index: 1; flex: 1;
          display: flex; align-items: flex-start; justify-content: center;
          padding: 40px 16px 60px;
        }
        .da-card {
          width: 100%; max-width: 560px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 20px; padding: 36px 32px;
          backdrop-filter: blur(20px);
          box-shadow: 0 24px 60px rgba(0,0,0,0.5);
        }
        @media (max-width: 520px) { .da-card { padding: 28px 20px; } }
        .da-warning-banner {
          display: flex; align-items: center; gap: 10px;
          background: rgba(220,38,38,0.12);
          border: 1px solid rgba(220,38,38,0.3);
          border-radius: 10px; padding: 12px 16px;
          margin-bottom: 28px;
          font-size: 13.5px; color: #fca5a5; line-height: 1.4;
        }
        .da-warning-icon { flex-shrink: 0; color: #f87171; }
        .da-title-group { margin-bottom: 28px; }
        .da-title {
          font-size: 26px; font-weight: 800; letter-spacing: -0.6px;
          color: #fff; margin: 0 0 10px; line-height: 1.2;
        }
        .da-subtitle { font-size: 14px; color: #9090a8; line-height: 1.6; margin: 0; }
        .da-form { display: flex; flex-direction: column; gap: 22px; }
        .da-field { display: flex; flex-direction: column; gap: 7px; }
        .da-label { font-size: 13px; font-weight: 600; color: #c0c0d8; letter-spacing: 0.2px; }
        .da-input-wrapper {
          display: flex; align-items: center;
          background: rgba(255,255,255,0.05);
          border: 1.5px solid rgba(255,255,255,0.1);
          border-radius: 12px; overflow: hidden;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .da-input-wrapper:focus-within {
          border-color: rgba(220,38,38,0.6);
          box-shadow: 0 0 0 3px rgba(220,38,38,0.1);
        }
        .da-input-wrapper.da-input-error { border-color: rgba(239,68,68,0.7); }
        .da-prefix {
          padding: 0 12px 0 14px; font-size: 14px; font-weight: 600; color: #9090a8;
          border-right: 1px solid rgba(255,255,255,0.08);
          height: 48px; display: flex; align-items: center; user-select: none;
        }
        .da-input {
          flex: 1; height: 48px; background: transparent; border: none; outline: none;
          padding: 0 14px; font-size: 15px; color: #e8e8f0; letter-spacing: 0.5px;
        }
        .da-input::placeholder { color: #555570; }
        .da-select-wrapper {
          position: relative;
          background: rgba(255,255,255,0.05);
          border: 1.5px solid rgba(255,255,255,0.1);
          border-radius: 12px; overflow: hidden;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .da-select-wrapper:focus-within {
          border-color: rgba(220,38,38,0.6);
          box-shadow: 0 0 0 3px rgba(220,38,38,0.1);
        }
        .da-select-wrapper.da-input-error { border-color: rgba(239,68,68,0.7); }
        .da-select {
          width: 100%; height: 48px; background: transparent; border: none; outline: none;
          padding: 0 42px 0 14px; font-size: 14.5px; color: #e8e8f0;
          appearance: none; cursor: pointer;
        }
        .da-select option { background: #1a1a28; color: #e8e8f0; }
        .da-select-chevron {
          position: absolute; right: 14px; top: 50%; transform: translateY(-50%);
          pointer-events: none; color: #9090a8;
        }
        .da-textarea {
          background: rgba(255,255,255,0.05);
          border: 1.5px solid rgba(255,255,255,0.1);
          border-radius: 12px; padding: 12px 14px;
          font-size: 14px; color: #e8e8f0; resize: vertical; outline: none;
          font-family: inherit; line-height: 1.5;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .da-textarea:focus {
          border-color: rgba(220,38,38,0.6);
          box-shadow: 0 0 0 3px rgba(220,38,38,0.1);
        }
        .da-textarea.da-input-error { border-color: rgba(239,68,68,0.7); }
        .da-textarea::placeholder { color: #555570; }
        .da-consequences {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 12px; padding: 16px 18px;
        }
        .da-consequences-title { font-size: 13px; font-weight: 600; color: #9090a8; margin: 0 0 10px; }
        .da-consequences-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 7px; }
        .da-consequence-item { display: flex; align-items: center; gap: 8px; font-size: 13.5px; color: #c0c0d8; }
        .da-consequence-item svg { color: #f87171; flex-shrink: 0; }
        .da-checkbox-row {
          display: flex; align-items: flex-start; gap: 12px;
          padding: 14px 16px;
          background: rgba(220,38,38,0.06);
          border: 1px solid rgba(220,38,38,0.18);
          border-radius: 12px; cursor: pointer;
        }
        .da-checkbox-row.da-checkbox-error { border-color: rgba(239,68,68,0.5); }
        .da-checkbox { margin-top: 2px; width: 17px; height: 17px; flex-shrink: 0; accent-color: #dc2626; cursor: pointer; }
        .da-checkbox-label { font-size: 13.5px; color: #c0c0d8; line-height: 1.5; cursor: pointer; user-select: none; }
        .da-error-msg { font-size: 12px; color: #f87171; margin: 0; }
        .da-error-msg--top { margin-top: -10px; }
        .da-submit-btn {
          display: flex; align-items: center; justify-content: center; gap: 10px;
          width: 100%; height: 52px;
          background: linear-gradient(135deg, #dc2626, #b91c1c);
          border: none; border-radius: 14px;
          color: #fff; font-size: 15px; font-weight: 700; letter-spacing: 0.2px;
          cursor: pointer;
          transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
          box-shadow: 0 6px 24px rgba(220,38,38,0.35);
          margin-top: 4px;
        }
        .da-submit-btn:hover:not(:disabled) {
          opacity: 0.92; transform: translateY(-1px);
          box-shadow: 0 10px 32px rgba(220,38,38,0.45);
        }
        .da-submit-btn:active:not(:disabled) { transform: translateY(0); }
        .da-submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .da-spinner {
          width: 20px; height: 20px;
          border: 2.5px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: da-spin 0.7s linear infinite;
        }
        @keyframes da-spin { to { transform: rotate(360deg); } }
        .da-success-card {
          display: flex; flex-direction: column; align-items: center;
          text-align: center; gap: 16px; padding: 48px 32px;
        }
        .da-success-icon {
          width: 64px; height: 64px; border-radius: 50%;
          background: linear-gradient(135deg, rgba(34,197,94,0.2), rgba(21,128,61,0.15));
          border: 1.5px solid rgba(34,197,94,0.3);
          display: flex; align-items: center; justify-content: center;
          color: #4ade80; box-shadow: 0 0 28px rgba(34,197,94,0.2);
        }
        .da-success-title { font-size: 22px; font-weight: 800; color: #fff; margin: 0; }
        .da-success-body { font-size: 14.5px; color: #9090a8; line-height: 1.65; max-width: 400px; margin: 0; }
        .da-success-note { font-size: 13px; color: #6060a0; margin: 0; }
        .da-link { color: #f87171; text-decoration: none; font-weight: 600; }
        .da-link:hover { text-decoration: underline; }
        .da-footer {
          position: relative; z-index: 1; text-align: center;
          padding: 20px 16px 28px;
          display: flex; flex-direction: column; gap: 4px;
          font-size: 12.5px; color: #44445a;
        }
      `}</style>
    </div>
  );
}
