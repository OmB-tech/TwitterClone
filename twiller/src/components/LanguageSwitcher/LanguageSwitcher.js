import { useState, useEffect } from 'react';
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

const LanguageSwitcher = ({ user, loggedinuser, onClose }) => {
    const { i18n } = useTranslation();
    const [step, setStep] = useState('SELECT_LANG'); // SELECT_LANG, VERIFY_PHONE, VERIFY_EMAIL
    const [selectedLang, setSelectedLang] = useState(null);
    const [otp, setOtp] = useState("");
    const [confirmationResult, setConfirmationResult] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (step !== 'VERIFY_PHONE') return;
        // Ensure the container is clean before rendering a new verifier
        const recaptchaContainer = document.getElementById('recaptcha-container');
        if (recaptchaContainer) recaptchaContainer.innerHTML = '';
        
        window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
            'size': 'invisible',
            'callback': () => {} // Intentionally empty
        });
        // Render the verifier immediately
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
        } else { // phone auth
            if (!loggedinuser[0]?.phoneNumber) {
                toast.error("Please add and verify your phone number in your profile first.");
                return;
            }
            setStep('VERIFY_PHONE');
            setTimeout(sendPhoneOtp, 100);
        }
    };

    const sendPhoneOtp = async () => {
        setIsLoading(true);
        try {
            const phoneNumber = loggedinuser[0]?.phoneNumber;
            const appVerifier = window.recaptchaVerifier;
            const confirmation = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
            setConfirmationResult(confirmation);
            toast.success('Verification code sent to your phone.');
        } catch (error) {
            console.error(error);
            toast.error('Failed to send verification code. Refresh and try again.');
            setStep('SELECT_LANG');
        } finally {
            setIsLoading(false);
        }
    };

    const verifyPhoneOtp = async () => {
        setIsLoading(true);
        try {
            await confirmationResult.confirm(otp);
            toast.success('Phone number verified!');
            changeLanguage(selectedLang.code);
        } catch (error) {
            toast.error('Invalid verification code.');
        } finally {
            setIsLoading(false);
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
                         <h2>Verify Phone</h2>
                         <p>Enter the code sent to {loggedinuser[0]?.phoneNumber}</p>
                         <input type="text" className="otp-input" placeholder="6-digit code" value={otp} onChange={(e) => setOtp(e.target.value)} />
                         <button onClick={verifyPhoneOtp} disabled={isLoading || otp.length < 6} className="verify-btn">
                            {isLoading ? 'Verifying...' : 'Verify & Switch'}
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
