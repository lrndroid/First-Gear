import React, { useEffect, useState } from 'react';
import {
  Smartphone,
  QrCode,
  Copy,
  Check,
  Download,
  Share,
  PlusSquare,
  ShieldCheck,
  Compass,
  Zap,
  X,
  ExternalLink
} from 'lucide-react';
import QRCode from 'qrcode';

interface InstallDeviceModalProps {
  isOpen: boolean;
  onClose: () => void;
  deferredPrompt?: any;
  onNativeInstall?: () => void;
}

export const InstallDeviceModal: React.FC<InstallDeviceModalProps> = ({
  isOpen,
  onClose,
  deferredPrompt,
  onNativeInstall,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [activePlatform, setActivePlatform] = useState<'android' | 'ios'>('android');

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  useEffect(() => {
    if (isOpen && currentUrl) {
      QRCode.toDataURL(currentUrl, {
        width: 260,
        margin: 1,
        color: {
          dark: '#020617',
          light: '#ffffff',
        },
      })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error('Failed to generate QR code:', err));
    }
  }, [isOpen, currentUrl]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Download to Test Device
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  PWA Ready
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Install as a standalone native app on iPhone or Android for live vehicle testing
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Native Install Banner if browser supports beforeinstallprompt */}
          {deferredPrompt && (
            <div className="p-4 rounded-xl bg-gradient-to-r from-blue-600/20 to-indigo-600/20 border border-blue-500/30 flex items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <Download className="w-5 h-5 text-blue-400 shrink-0" />
                <div>
                  <div className="font-semibold text-white text-sm">Direct Install Available</div>
                  <div className="text-xs text-slate-300">
                    Your current browser supports 1-click home screen installation.
                  </div>
                </div>
              </div>
              <button
                onClick={onNativeInstall}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition shadow-lg shadow-blue-500/25 shrink-0"
              >
                Install App Now
              </button>
            </div>
          )}

          {/* QR Code and URL section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center bg-slate-950/60 p-4 rounded-xl border border-slate-800">
            {/* QR Code */}
            <div className="flex flex-col items-center justify-center p-3 bg-white rounded-xl shadow-lg">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="Scan to open TeenDrive Guard on phone"
                  className="w-48 h-48 rounded-lg object-contain"
                />
              ) : (
                <div className="w-48 h-48 flex items-center justify-center text-slate-400 text-xs">
                  Generating QR Code...
                </div>
              )}
              <div className="mt-2 text-center text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                <QrCode className="w-3.5 h-3.5 text-blue-600" />
                Scan with Test Phone Camera
              </div>
            </div>

            {/* URL & Link info */}
            <div className="space-y-3">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  App Web Address
                </span>
                <p className="text-xs text-slate-400 mt-1">
                  Point your mobile test device’s browser to this link or scan the QR code to open the real-time telemetry dashboard.
                </p>
              </div>

              <div className="flex items-center bg-slate-900 border border-slate-700 rounded-lg p-2 gap-2">
                <input
                  type="text"
                  readOnly
                  value={currentUrl}
                  className="bg-transparent text-xs text-slate-200 font-mono focus:outline-none flex-1 truncate"
                />
                <button
                  onClick={handleCopy}
                  className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded text-xs font-medium flex items-center gap-1 transition shrink-0"
                  title="Copy application URL"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              <div className="pt-2 text-xs text-slate-400 space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Full HTTPS & Hardware Motion Support</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Runs directly in standalone mode without an App Store or Play Store download.
                </p>
              </div>
            </div>
          </div>

          {/* Platform Installation Guide Tabs */}
          <div>
            <div className="flex items-center space-x-2 border-b border-slate-800 pb-2">
              <button
                onClick={() => setActivePlatform('android')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
                  activePlatform === 'android'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>Android (Chrome)</span>
              </button>
              <button
                onClick={() => setActivePlatform('ios')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
                  activePlatform === 'ios'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>iPhone / iPad (iOS Safari)</span>
              </button>
            </div>

            {/* Android Instructions */}
            {activePlatform === 'android' && (
              <div className="mt-4 space-y-3">
                <div className="flex items-start space-x-3 text-xs bg-slate-800/40 p-3 rounded-xl border border-slate-800">
                  <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 font-bold flex items-center justify-center shrink-0">
                    1
                  </div>
                  <div>
                    <div className="font-semibold text-slate-200">Open in Chrome Browser</div>
                    <div className="text-slate-400">
                      Scan the QR code with your device camera or open the URL in Chrome on your Android test phone.
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-3 text-xs bg-slate-800/40 p-3 rounded-xl border border-slate-800">
                  <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 font-bold flex items-center justify-center shrink-0">
                    2
                  </div>
                  <div>
                    <div className="font-semibold text-slate-200">Tap "Install" or "Add to Home screen"</div>
                    <div className="text-slate-400">
                      Tap the prompt banner at the bottom, or tap the three dots (<span className="text-white font-bold">⋮</span>) menu in the top right and select <span className="text-blue-300 font-semibold">"Install app"</span> (or <span className="text-blue-300 font-semibold">"Add to Home screen"</span>).
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-3 text-xs bg-slate-800/40 p-3 rounded-xl border border-slate-800">
                  <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 font-bold flex items-center justify-center shrink-0">
                    3
                  </div>
                  <div>
                    <div className="font-semibold text-slate-200">Grant Location & Mount on Vehicle</div>
                    <div className="text-slate-400">
                      Open <span className="text-white font-medium">TeenDrive</span> from your home screen. When prompted, allow <span className="text-emerald-400 font-semibold">"While using the app"</span> location access for real-time Google Roads speed tracking.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* iOS Instructions */}
            {activePlatform === 'ios' && (
              <div className="mt-4 space-y-3">
                <div className="flex items-start space-x-3 text-xs bg-slate-800/40 p-3 rounded-xl border border-slate-800">
                  <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 font-bold flex items-center justify-center shrink-0">
                    1
                  </div>
                  <div>
                    <div className="font-semibold text-slate-200">Open in Safari</div>
                    <div className="text-slate-400">
                      Scan the QR code with your iPhone Camera app and tap the prompt to open in <span className="text-white font-semibold">Safari</span>.
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-3 text-xs bg-slate-800/40 p-3 rounded-xl border border-slate-800">
                  <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 font-bold flex items-center justify-center shrink-0">
                    2
                  </div>
                  <div>
                    <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                      <span>Tap the Share Button</span>
                      <Share className="w-3.5 h-3.5 text-blue-400" />
                    </div>
                    <div className="text-slate-400">
                      Tap the square icon with an arrow pointing up at the bottom of Safari.
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-3 text-xs bg-slate-800/40 p-3 rounded-xl border border-slate-800">
                  <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 font-bold flex items-center justify-center shrink-0">
                    3
                  </div>
                  <div>
                    <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                      <span>Tap "Add to Home Screen"</span>
                      <PlusSquare className="w-3.5 h-3.5 text-blue-400" />
                    </div>
                    <div className="text-slate-400">
                      Scroll down the share sheet and tap <span className="text-blue-300 font-semibold">"Add to Home Screen"</span>, then tap <span className="text-white font-bold">"Add"</span> in the upper right.
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-3 text-xs bg-slate-800/40 p-3 rounded-xl border border-slate-800">
                  <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 font-bold flex items-center justify-center shrink-0">
                    4
                  </div>
                  <div>
                    <div className="font-semibold text-slate-200">Launch from Home Screen & Enable Sensors</div>
                    <div className="text-slate-400">
                      Launch the TeenDrive app from your iPhone home screen. When starting a drive, tap <span className="text-emerald-400 font-semibold">"Allow Motion Sensors"</span> so the accelerometer can calculate braking G-force and jerk.
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Test Drive Recommendations */}
          <div className="p-3.5 rounded-xl bg-slate-800/30 border border-slate-700/60 text-xs text-slate-300 flex items-start gap-2.5">
            <Zap className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-amber-300">Vehicle Test Drive Tip:</span> Place or mount your phone in a standard car dashboard mount facing forward. The app will automatically align its accelerometer coordinate frame to measure longitudinal braking deceleration and lateral cornering jerk.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <span className="text-xs text-slate-400">No App Store account or side-loading required.</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
