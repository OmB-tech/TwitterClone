import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import './LanguageSwitcher.css';
import { auth, RecaptchaVerifier, signInWithPhoneNumber } from '../../context/firebase';

const languages = [
    { code: 'en', name: 'English', auth: 'phone' },
    { code: 'es', name: 'Español', auth: 'phone' },
    { code: 'hi', name: 'हिन्दी', auth: 'phone' },
    { code: 'fr', name: 'Français', auth: 'email' },
    { code: 'pt', name: 'Português', auth: 'phone' },
    { code: 'zh', name: '中文', auth: 'phone' },
];

// Test credentials for the UI
const TEST_PHONE_NUMBER = "+911234567890";
const TEST_OTP = "123456";

const LanguageSwitcher = ({ user, loggedinuser, onClose }) => {
    const { i18n } = useTranslation();
    const [step, setStep] = useState('SELECT_LANG');
    const [selectedLang, setSelectedLang] = useState(null);
    const [otp, setOtp] = useState("");
    const [confirmationResult, setConfirmationResult] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (step !== 'VERIFY_PHONE') return;
        const recaptchaContainer = document.getElementById('recaptcha-container');
        if (recaptchaContainer) recaptchaContainer.innerHTML = '';
        
        window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
            'size': 'invisible',
            'callback': () => {}
        });
        window.recaptchaVerifier.render();
    }, [step]);

    const handleLanguageSelect = async (lang) => {
        setSelectedLang(lang);
        if (lang.auth === 'email') {
            setIsLoading(true);
            try {
                const res = await fetch('http://localhost:5000/send-email-otp', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: user.email })
                });
                const data = await res.json();
                if (!data.success) throw new Error(data.message);
                toast.success('Verification code sent to your email.');
                setStep('VERIFY_EMAIL');
            } catch (error) {
                toast.error(error.message || 'Failed to send OTP.');
            } finally {
                setIsLoading(false);
            }
        } else {
            setStep('VERIFY_PHONE');
            // We don't send a real OTP here anymore, just switch to the view
            // that shows the test credentials.
        }
    };

    const verifyPhoneOtp = async () => {
        // For the portfolio, we just check against the hardcoded test OTP
        if (otp === TEST_OTP) {
            toast.success('Phone number verified!');
            changeLanguage(selectedLang.code);
        } else {
            toast.error('Invalid verification code.');
        }
    };

    const verifyEmailOtp = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('http://localhost:5000/verify-email-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: user.email, otp })
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.message);
            toast.success('Email verified!');
            changeLanguage(selectedLang.code);
        } catch (error) {
            toast.error(error.message || 'Failed to verify OTP.');
        } finally {
            setIsLoading(false);
        }
    };

    const changeLanguage = (langCode) => {
        i18n.changeLanguage(langCode);
        toast.success(`Language changed to ${languages.find(l => l.code === langCode)?.name}`);
        onClose();
    };

    const renderContent = () => {
        switch (step) {
            case 'VERIFY_PHONE':
                return (
                    <div>
                         <h2>Phone Verification</h2>
                         <div className="test-info-box">
                            <p>We're sorry, our app can't send live SMS due to billing limitations.</p>
                            <p>Please use these test credentials to proceed:</p>
                            <p><strong>Phone Number:</strong> {TEST_PHONE_NUMBER}</p>
                            <p><strong>Verification Code:</strong> {TEST_OTP}</p>
                         </div>
                         <input type="text" className="otp-input" placeholder="6-digit code" value={otp} onChange={(e) => setOtp(e.target.value)} />
                         <button onClick={verifyPhoneOtp} disabled={isLoading || otp.length < 6} className="verify-btn">
                            Verify & Switch
                         </button>
                    </div>
                );
            case 'VERIFY_EMAIL':
                return (
                    <div>
                        <h2>Verify Email</h2>
                        <p>Enter the code sent to {user.email}</p>
                        <input type="text" className="otp-input" placeholder="6-digit code" value={otp} onChange={(e) => setOtp(e.target.value)} />
                        <button onClick={verifyEmailOtp} disabled={isLoading || otp.length < 6} className="verify-btn">
                           {isLoading ? 'Verifying...' : 'Verify & Switch'}
                        </button>
                   </div>
                );
            default:
                return (
                    <div>
                        <h2>Switch Language</h2>
                        <div className="lang-grid">
                            {languages.map(lang => (
                                <button key={lang.code} onClick={() => handleLanguageSelect(lang)} disabled={isLoading}>
                                    {lang.name}
                                </button>
                            ))}
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div id="recaptcha-container"></div>
                {renderContent()}
                <button className="close-btn" onClick={onClose}>Cancel</button>
            </div>
        </div>
    );
};

export default LanguageSwitcher;
