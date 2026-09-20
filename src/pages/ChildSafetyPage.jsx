export default function ChildSafetyPage() {
  return (
    <>
      <style>{`
        .cs-body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: #0f0a1e;
          color: #e0d9f7;
          min-height: 100vh;
          padding: 40px 20px;
        }
        .cs-container {
          max-width: 800px;
          margin: 0 auto;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(139,92,246,0.2);
          border-radius: 16px;
          padding: 48px;
        }
        @media (max-width: 560px) {
          .cs-container { padding: 28px 20px; }
        }
        .cs-logo { font-size: 28px; font-weight: 800; color: #a78bfa; margin-bottom: 8px; }
        .cs-h1 { font-size: 24px; font-weight: 700; color: #fff; margin-bottom: 6px; }
        .cs-updated { font-size: 13px; color: #9ca3af; margin-bottom: 32px; }
        .cs-h2 { font-size: 17px; font-weight: 600; color: #c4b5fd; margin: 28px 0 10px; }
        .cs-p { font-size: 15px; line-height: 1.7; color: #d1c6f0; margin-bottom: 12px; }
        .cs-ul { padding-left: 20px; margin-bottom: 12px; }
        .cs-li { font-size: 15px; line-height: 1.7; color: #d1c6f0; margin-bottom: 6px; }
        .cs-a { color: #a78bfa; text-decoration: none; }
        .cs-a:hover { text-decoration: underline; }
        .cs-contact {
          background: rgba(139,92,246,0.1);
          border: 1px solid rgba(139,92,246,0.3);
          border-radius: 10px;
          padding: 20px;
          margin-top: 32px;
        }
        .cs-contact .cs-p { margin: 0; }
        .cs-hr { border: none; border-top: 1px solid rgba(255,255,255,0.08); margin: 24px 0; }
      `}</style>

      <div className="cs-body">
        <div className="cs-container">
          <div className="cs-logo">🦥 Relaya</div>
          <h1 className="cs-h1">Child Safety Standards</h1>
          <p className="cs-updated">Last updated: September 2026</p>

          <p className="cs-p">
            Relaya is committed to creating a safe environment for all users and maintaining
            zero tolerance for child sexual abuse and exploitation (CSAE) on our platform.
            This document outlines our standards and practices to prevent, detect, and respond
            to CSAE content and behaviour.
          </p>

          <h2 className="cs-h2">1. Zero Tolerance Policy</h2>
          <p className="cs-p">
            Relaya strictly prohibits any content, behaviour, or activity that sexually exploits
            or endangers minors. This includes, but is not limited to:
          </p>
          <ul className="cs-ul">
            <li className="cs-li">Child Sexual Abuse Material (CSAM) of any kind</li>
            <li className="cs-li">Grooming, solicitation, or exploitation of minors</li>
            <li className="cs-li">Sexual conversations involving or directed at minors</li>
            <li className="cs-li">Sharing, distributing, or requesting any material that sexualises minors</li>
          </ul>
          <p className="cs-p">
            Any user found to be engaging in such behaviour will be immediately and permanently banned,
            and we will report the incident to the appropriate authorities including the
            National Center for Missing &amp; Exploited Children (NCMEC).
          </p>

          <h2 className="cs-h2">2. Age Requirements</h2>
          <p className="cs-p">
            Relaya requires all users to be at least 13 years of age to create an account.
            Users who indicate they are under 13 are denied access. We do not knowingly
            collect personal information from children under 13 years of age.
          </p>

          <h2 className="cs-h2">3. Detection and Prevention</h2>
          <p className="cs-p">We employ multiple layers of protection to detect and prevent CSAE:</p>
          <ul className="cs-ul">
            <li className="cs-li">
              <strong>Content moderation:</strong> All user-generated content and voice rooms
              are subject to our community guidelines and moderation processes.
            </li>
            <li className="cs-li">
              <strong>Reporting tools:</strong> All users have access to easy-to-use in-app
              reporting mechanisms for flagging inappropriate content or behaviour.
            </li>
            <li className="cs-li">
              <strong>Account review:</strong> Accounts reported for CSAE violations are
              immediately reviewed and suspended pending investigation.
            </li>
            <li className="cs-li">
              <strong>Proactive monitoring:</strong> We actively monitor platform activity
              for potential CSAE indicators.
            </li>
          </ul>

          <h2 className="cs-h2">4. Reporting</h2>
          <p className="cs-p">
            Users can report suspected CSAE violations directly through the Relaya app or by
            contacting us at:
          </p>
          <p className="cs-p">
            <strong>Email:</strong>{' '}
            <a className="cs-a" href="mailto:safety@relaya.in">safety@relaya.in</a>
          </p>
          <p className="cs-p">
            We also report any confirmed CSAM to NCMEC's CyberTipline at{' '}
            <a className="cs-a" href="https://www.missingkids.org/gethelpnow/cybertipline" target="_blank" rel="noreferrer">
              missingkids.org
            </a>{' '}
            and cooperate fully with law enforcement agencies.
          </p>

          <h2 className="cs-h2">5. User Education</h2>
          <p className="cs-p">
            Relaya provides resources and guidance within the app to help users — especially
            younger users — understand online safety, recognise inappropriate behaviour,
            and use available reporting tools.
          </p>

          <h2 className="cs-h2">6. Employee and Moderator Training</h2>
          <p className="cs-p">
            All Relaya team members and moderators involved in content review are trained to
            identify CSAE indicators and follow proper reporting protocols in accordance with
            applicable laws.
          </p>

          <h2 className="cs-h2">7. Law Enforcement Cooperation</h2>
          <p className="cs-p">
            Relaya will cooperate fully with law enforcement agencies in investigations involving
            CSAE. We preserve records and respond to lawful requests in a timely manner.
          </p>

          <hr className="cs-hr" />

          <div className="cs-contact">
            <h2 className="cs-h2" style={{ marginTop: 0 }}>Contact Us</h2>
            <p className="cs-p">
              For questions or concerns about child safety on Relaya, please reach out to us:
              <br /><br />
              <strong>Email:</strong>{' '}
              <a className="cs-a" href="mailto:safety@relaya.in">safety@relaya.in</a><br />
              <strong>Developer:</strong> Rohit Kumar<br />
              <strong>Website:</strong>{' '}
              <a className="cs-a" href="https://relaya.in">relaya.in</a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
