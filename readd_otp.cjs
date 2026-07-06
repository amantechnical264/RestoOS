const fs = require('fs');

let content = fs.readFileSync('src/pages/CartPage.jsx', 'utf8');

// Add imports
if (!content.includes("firebase/auth")) {
  content = content.replace(
    "import { supabase } from '../services/supabase';",
    "import { supabase } from '../services/supabase';\nimport { auth } from '../services/firebase';\nimport { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';"
  );
}

// Modify executeCheckout to ALWAYS force prompt for delivery
const oldCheckout = `  const executeCheckout = async ({ overrideName, overridePhone, overrideAddress, overrideCoords } = {}) => {
    const finalName = overrideName || user?.name || (() => { try { return JSON.parse(localStorage.getItem('3dish_diner_profile') || '{}').name; } catch(e) {} })();
    const finalPhone = overridePhone || user?.phone || (() => { try { return JSON.parse(localStorage.getItem('3dish_diner_profile') || '{}').phone; } catch(e) {} })();
    const resolvedCoords = overrideCoords || locationCoords;
    const resolvedAddress = overrideAddress || tempAddress;

    const missingDeliveryInfo = isDelivery && !resolvedCoords && !resolvedAddress;
    if (!finalName || !finalPhone || missingDeliveryInfo) {
      setShowNamePrompt(true);
      return;
    }`;

const newCheckout = `  const executeCheckout = async ({ overrideName, overridePhone, overrideAddress, overrideCoords } = {}) => {
    const finalName = overrideName || user?.name || (() => { try { return JSON.parse(localStorage.getItem('3dish_diner_profile') || '{}').name; } catch(e) {} })();
    const finalPhone = overridePhone || user?.phone || (() => { try { return JSON.parse(localStorage.getItem('3dish_diner_profile') || '{}').phone; } catch(e) {} })();
    const resolvedCoords = overrideCoords || locationCoords;
    const resolvedAddress = overrideAddress || tempAddress;

    // Strict Gate: Delivery ALWAYS requires OTP verification (which passes overrideName).
    // If overrideName is missing and it's delivery, force the prompt.
    if (isDelivery && !overrideName) {
      setShowNamePrompt(true);
      return;
    }
    
    const missingDeliveryInfo = isDelivery && !resolvedCoords && !resolvedAddress;
    if (!finalName || !finalPhone || missingDeliveryInfo) {
      setShowNamePrompt(true);
      return;
    }`;

if (content.includes(oldCheckout)) {
  content = content.replace(oldCheckout, newCheckout);
} else if (content.includes(oldCheckout.replace(/\n/g, '\r\n'))) {
  content = content.replace(oldCheckout.replace(/\n/g, '\r\n'), newCheckout);
}

// Re-inject sendOtp and verifyOtp
const handleFetchLocationTarget = `      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };`;

const functionsToInject = `      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  useEffect(() => {
    if (isDelivery && !window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible'
      });
    }
  }, [isDelivery]);

  const sendOtp = async () => {
    const missingDeliveryInfo = isDelivery && !locationCoords && !tempAddress;
    if (!tempName || !tempPhone || missingDeliveryInfo) {
      showNotification("Please fill in all required details.");
      return;
    }
    
    let formattedPhone = tempPhone.trim();
    if (!formattedPhone.startsWith('+')) {
      formattedPhone = \`+91\${formattedPhone}\`; 
    }

    setIsSendingOtp(true);
    try {
      const appVerifier = window.recaptchaVerifier;
      const result = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      setConfirmationResult(result);
      setShowOtpPrompt(true);
      showNotification("OTP sent successfully!");
    } catch (error) {
      console.error("Error sending OTP:", error);
      showNotification(error.message || "Failed to send OTP. Please check the number or try again.");
    }
    setIsSendingOtp(false);
  };

  const verifyOtp = async () => {
    if (!otpCode || otpCode.length < 6) {
      showNotification("Please enter a valid 6-digit OTP.");
      return;
    }
    
    setIsVerifyingOtp(true);
    try {
      await confirmationResult.confirm(otpCode);
      showNotification("Phone number verified!");
      
      const guestId = user?.uid || user?.guestId || 'guest_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
      const profile = { guestId, name: tempName, phone: tempPhone, firstVisit: new Date().toISOString() };
      localStorage.setItem('3dish_diner_profile', JSON.stringify(profile));
      if (setUser) setUser(prev => ({ ...prev, name: tempName, phone: tempPhone, role: 'diner', guestId }));
      
      setShowOtpPrompt(false);
      setShowNamePrompt(false);
      
      executeCheckout({
        overrideName: tempName,
        overridePhone: tempPhone,
        overrideAddress: tempAddress,
        overrideCoords: locationCoords,
      });
    } catch (error) {
      console.error("Error verifying OTP:", error);
      showNotification("Invalid OTP. Please try again.");
    }
    setIsVerifyingOtp(false);
  };`;

if (!content.includes("const sendOtp")) {
  if (content.includes(handleFetchLocationTarget)) {
    content = content.replace(handleFetchLocationTarget, functionsToInject);
  } else if (content.includes(handleFetchLocationTarget.replace(/\n/g, '\r\n'))) {
    content = content.replace(handleFetchLocationTarget.replace(/\n/g, '\r\n'), functionsToInject);
  }
}

// Re-inject the OTP modal UI
const modalRegex = /<div className="space-y-4 relative z-10 overflow-y-auto no-scrollbar pb-2 px-1">[\s\S]*?Cancel\s*<\/button>/;

const newModalUI = `<div className="space-y-4 relative z-10 overflow-y-auto no-scrollbar pb-2 px-1">
                    {!showOtpPrompt ? (
                      <>
                        <div>
                          <label className="block text-xs font-bold text-neutral-500 mb-1.5 uppercase tracking-wider">Your Name</label>
                          <input autoFocus type="text" value={tempName} onChange={e => setTempName(e.target.value)} placeholder="e.g. John Doe"
                            className="w-full bg-neutral-50 dark:bg-[#0a0a0a] border border-neutral-200 dark:border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-[#D4AF37] dark:text-white" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-neutral-500 mb-1.5 uppercase tracking-wider">Phone Number</label>
                          <input type="tel" value={tempPhone} onChange={e => setTempPhone(e.target.value)} placeholder="e.g. 9876543210"
                            className="w-full bg-neutral-50 dark:bg-[#0a0a0a] border border-neutral-200 dark:border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-[#D4AF37] dark:text-white" />
                        </div>
                        {isDelivery && (
                          <div className="pt-2 border-t border-neutral-200 dark:border-white/10">
                            <label className="block text-xs font-bold text-neutral-500 mb-1.5 uppercase tracking-wider">Delivery Location <span className="text-red-500">*</span></label>
                            <div className="flex gap-2 mb-2">
                              <button 
                                onClick={handleFetchLocation}
                                disabled={isFetchingLocation || locationCoords}
                                className={\`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all \${locationCoords ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400'}\`}
                              >
                                <MapPin size={14} />
                                {isFetchingLocation ? 'Detecting...' : locationCoords ? 'Location Detected' : 'Use GPS Location'}
                              </button>
                            </div>
                            <p className="text-[10px] text-neutral-400 text-center mb-2">OR</p>
                            <textarea 
                              value={tempAddress} onChange={e => setTempAddress(e.target.value)} 
                              placeholder="e.g. 123 Main St, Apt 4B, City"
                              className="w-full bg-neutral-50 dark:bg-[#0a0a0a] border border-neutral-200 dark:border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-[#D4AF37] dark:text-white resize-none" 
                              rows={2}
                            />
                          </div>
                        )}
                        <button 
                          onClick={() => {
                            if (isDelivery) {
                              sendOtp();
                            } else {
                              const missingDeliveryInfo = isDelivery && !locationCoords && !tempAddress;
                              if (tempName && tempPhone && !missingDeliveryInfo) {
                                const guestId = user?.uid || user?.guestId || 'guest_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
                                const profile = { guestId, name: tempName, phone: tempPhone, firstVisit: new Date().toISOString() };
                                localStorage.setItem('3dish_diner_profile', JSON.stringify(profile));
                                if (setUser) setUser(prev => ({ ...prev, name: tempName, phone: tempPhone, role: 'diner', guestId }));
                                setShowNamePrompt(false);
                                executeCheckout({
                                  overrideName: tempName,
                                  overridePhone: tempPhone,
                                  overrideAddress: tempAddress,
                                  overrideCoords: locationCoords,
                                });
                              } else {
                                showNotification("Please fill in all required details.");
                              }
                            }
                          }}
                          disabled={isSendingOtp}
                          className="w-full py-3.5 mt-2 rounded-xl bg-[#D4AF37] text-black font-black text-base hover:bg-amber-400 transition-colors shadow-lg shadow-amber-500/20 disabled:opacity-50">
                          {isSendingOtp ? "Sending OTP..." : (isDelivery ? "Send OTP to Verify" : "Save & Checkout")}
                        </button>
                        <button 
                          onClick={() => setShowNamePrompt(false)}
                          className="w-full py-3 mt-1 text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors">
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="text-center mb-4">
                          <p className="text-sm font-bold text-neutral-900 dark:text-white">OTP sent to {tempPhone}</p>
                          <button onClick={() => setShowOtpPrompt(false)} className="text-xs text-[#D4AF37] mt-1 underline">Change Number</button>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-neutral-500 mb-1.5 uppercase tracking-wider text-center">Enter 6-Digit Code</label>
                          <input autoFocus type="number" value={otpCode} onChange={e => setOtpCode(e.target.value)} placeholder="000000"
                            className="w-full text-center tracking-[0.5em] font-display font-black text-2xl bg-neutral-50 dark:bg-[#0a0a0a] border border-neutral-200 dark:border-white/10 rounded-xl p-4 focus:outline-none focus:border-[#D4AF37] dark:text-white" />
                        </div>
                        <button 
                          onClick={verifyOtp}
                          disabled={isVerifyingOtp}
                          className="w-full py-3.5 mt-2 rounded-xl bg-[#D4AF37] text-black font-black text-base hover:bg-amber-400 transition-colors shadow-lg shadow-amber-500/20 flex items-center justify-center disabled:opacity-50">
                          {isVerifyingOtp ? "Verifying..." : "Verify & Place Order"}
                        </button>
                      </>
                    )}`;

content = content.replace(modalRegex, newModalUI);

// Change floating button text if delivery
const oldButtonText = `{hasSoldOutItem ? 'Remove Sold Out Items to Proceed' : (isProcessing ? (
              <><motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, ease: 'linear', duration: 1 }} className="w-5 h-5 border-2 rounded-full border-white/30 border-t-white mr-2" /> Processing...</>
            ) : 'Make Order')}`;

const newButtonText = `{hasSoldOutItem ? 'Remove Sold Out Items to Proceed' : (isProcessing ? (
              <><motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, ease: 'linear', duration: 1 }} className="w-5 h-5 border-2 rounded-full border-white/30 border-t-white mr-2" /> Processing...</>
            ) : (isDelivery ? 'Proceed to Verification' : 'Make Order'))}`;

if (content.includes(oldButtonText)) {
  content = content.replace(oldButtonText, newButtonText);
} else if (content.includes(oldButtonText.replace(/\n/g, '\r\n'))) {
  content = content.replace(oldButtonText.replace(/\n/g, '\r\n'), newButtonText);
}

fs.writeFileSync('src/pages/CartPage.jsx', content, 'utf8');
console.log('SUCCESS');
