import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, MapPin, QrCode, CheckCircle, AlertCircle, ArrowLeft, Check, RotateCcw } from 'lucide-react';
import { Button } from '../ui/button';

interface CheckInOutProps {
  type: 'in' | 'out';
}

export function CheckInOut({ type }: CheckInOutProps) {
  const navigate = useNavigate();
  const [step, setStep] = useState<'initial' | 'location' | 'photo' | 'confirm-photo' | 'comment' | 'qr' | 'success' | 'error'>('initial');
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [comment, setComment] = useState('');
  const [useQR, setUseQR] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const title = type === 'in' ? 'Giriş Et' : 'Çıxış Et';
  const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  const handleGetLocation = () => {
    setStep('location');
    // Simulate geolocation
    setTimeout(() => {
      setLocation({ lat: 40.4093, lng: 49.8671 });
      if (useQR) {
        setStep('qr');
      } else {
        setStep('photo');
      }
    }, 1000);
  };

  const handleTakePhoto = () => {
    // Simulate photo capture
    setTimeout(() => {
      setPhoto('https://i.pravatar.cc/300?img=1');
      setStep('confirm-photo');
    }, 1000);
  };

  const handleRetakePhoto = () => {
    setPhoto(null);
    setStep('photo');
  };

  const handleConfirmPhoto = () => {
    setStep('comment');
  };

  const handleSubmitComment = () => {
    setStep('success');
  };

  const handleSkipComment = () => {
    setStep('success');
  };

  const handleQRScan = () => {
    // Simulate QR scan
    setTimeout(() => {
      setStep('success');
    }, 1500);
  };

  const handleComplete = () => {
    navigate('/employee');
  };

  const handleBack = () => {
    if (step === 'confirm-photo') {
      setStep('photo');
    } else if (step === 'comment') {
      setStep('confirm-photo');
    } else if (step === 'photo' || step === 'qr') {
      setStep('location');
      setTimeout(() => setStep('initial'), 300);
    } else {
      navigate('/employee');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={handleBack}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
            <p className="text-sm text-gray-600">{time}</p>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6 pb-20">
        {/* Initial Step */}
        {step === 'initial' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="font-semibold text-gray-900 mb-4">
                {title} Üsulunu Seçin
              </h2>
              
              <div className="space-y-3">
                <button
                  onClick={() => {
                    setUseQR(true);
                    handleGetLocation();
                  }}
                  className="w-full flex items-center gap-4 p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all"
                >
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <QrCode className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="text-left flex-1">
                    <p className="font-medium text-gray-900">QR Kod Skan</p>
                    <p className="text-sm text-gray-600">Sürətli və təsdiqlənmiş</p>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setUseQR(false);
                    handleGetLocation();
                  }}
                  className="w-full flex items-center gap-4 p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all"
                >
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Camera className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="text-left flex-1">
                    <p className="font-medium text-gray-900">Şəkil + Yer</p>
                    <p className="text-sm text-gray-600">Standart yoxlama</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Location Step */}
        {step === 'location' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-blue-600 animate-pulse" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Yer Müəyyən Edilir
              </h2>
              <p className="text-gray-600">
                Zəhmət olmasa yerinizi yoxlayarkən gözləyin...
              </p>
            </div>
          </div>
        )}

        {/* Photo Step */}
        {step === 'photo' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4 text-green-600">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">Yer təsdiqləndi</span>
              </div>
              <p className="text-sm text-gray-600 mb-1">Nizami küç. 123, Bakı</p>
              <p className="text-xs text-gray-500">40.4093° N, 49.8671° E</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Şəkil Çək</h2>
              
              <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                <Camera className="w-16 h-16 text-gray-400" />
              </div>

              <Button variant="primary" fullWidth onClick={handleTakePhoto}>
                <Camera className="w-5 h-5 mr-2" />
                Şəkil Çək
              </Button>
            </div>
          </div>
        )}

        {/* Confirm Photo Step */}
        {step === 'confirm-photo' && photo && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Şəkili Təsdiqləyin</h2>
              
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
                <img src={photo} alt="Captured" className="w-full h-full object-cover" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" fullWidth onClick={handleRetakePhoto}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Yenidən Çək
                </Button>
                <Button variant="primary" fullWidth onClick={handleConfirmPhoto}>
                  <Check className="w-4 h-4 mr-2" />
                  Təsdiq Et
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Comment Step */}
        {step === 'comment' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="font-semibold text-gray-900 mb-2">
                Şərh Əlavə Edin (İstəyə bağlı)
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                Gecikmə və ya erkən çıxış üçün izahat əlavə edə bilərsiniz
              </p>

              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px] resize-none"
                placeholder="Şərh daxil edin..."
              />

              <div className="grid grid-cols-2 gap-3 mt-4">
                <Button variant="outline" fullWidth onClick={handleSkipComment}>
                  Keç
                </Button>
                <Button variant="primary" fullWidth onClick={handleSubmitComment}>
                  Təsdiq Et
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* QR Step */}
        {step === 'qr' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4 text-green-600">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">Yer təsdiqləndi</span>
              </div>
              <p className="text-sm text-gray-600 mb-1">Nizami küç. 123, Bakı</p>
              <p className="text-xs text-gray-500">40.4093° N, 49.8671° E</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="font-semibold text-gray-900 mb-4 text-center">
                QR Kodu Skan Edin
              </h2>
              
              <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center mb-4 relative overflow-hidden">
                <QrCode className="w-16 h-16 text-gray-400" />
                <div className="absolute inset-0 border-2 border-blue-500 animate-pulse" />
              </div>

              <p className="text-sm text-gray-600 text-center mb-4">
                QR kodu çərçivə daxilində yerləşdirin
              </p>

              <Button variant="primary" fullWidth onClick={handleQRScan}>
                Skan Edilir...
              </Button>
            </div>
          </div>
        )}

        {/* Success Step */}
        {step === 'success' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                {title} Uğurlu!
              </h2>
              <p className="text-gray-600 mb-6">
                Saat {time}-də qeydə alındı
              </p>

              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Yer</span>
                  <span className="text-gray-900 font-medium">Təsdiqləndi</span>
                </div>
                {useQR ? (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">QR Kod</span>
                    <span className="text-green-600 font-medium">Təsdiqləndi</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Şəkil</span>
                    <span className="text-gray-900 font-medium">Çəkildi</span>
                  </div>
                )}
                {comment && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Şərh</span>
                    <span className="text-gray-900 font-medium">Əlavə edildi</span>
                  </div>
                )}
              </div>

              <Button variant="primary" fullWidth onClick={handleComplete}>
                Ana Səhifəyə Qayıt
              </Button>
            </div>
          </div>
        )}

        {/* Error Step */}
        {step === 'error' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="text-center">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-10 h-10 text-red-600" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                {title} Uğursuz
              </h2>
              <p className="text-gray-600 mb-6">
                {error || 'Xəta baş verdi. Zəhmət olmasa yenidən cəhd edin.'}
              </p>

              <Button variant="primary" fullWidth onClick={() => setStep('initial')}>
                Yenidən Cəhd Et
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}