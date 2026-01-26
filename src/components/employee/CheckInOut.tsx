import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, MapPin, QrCode, CheckCircle, AlertCircle, ArrowLeft, Check, RotateCcw } from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '../ui/utils';
import { useAppDispatch } from '../../store/hooks';
import { submitCheckIn, submitCheckOut, fetchTodayRecord } from '../../store/attendanceSlice';

interface CheckInOutProps {
  type: 'in' | 'out';
}

export function CheckInOut({ type }: CheckInOutProps) {
  const navigate = useNavigate();
  const [step, setStep] = useState<'initial' | 'location' | 'photo' | 'confirm-photo' | 'comment' | 'qr' | 'success' | 'error'>('initial');
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [photoBlob, setPhotoBlob] = useState<Blob | null>(null);
  const [comment, setComment] = useState('');
  const [useQR, setUseQR] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locationDenied, setLocationDenied] = useState(false);
  const [cameraDenied, setCameraDenied] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const dispatch = useAppDispatch();

  const title = type === 'in' ? 'Giriş Et' : 'Çıxış Et';
  const time = new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: false });

  // Calculate current step number
  const getStepNumber = () => {
    switch (step) {
      case 'initial': return 1;
      case 'location': return 2;
      case 'photo': return 3;
      case 'confirm-photo': return 3;
      case 'qr': return 3;
      case 'comment': return 4;
      case 'success': return 4;
      case 'error': return 4;
      default: return 1;
    }
  };

  const totalSteps = 4;

  const handleGetLocation = () => {
    setStep('location');
    if (!navigator.geolocation) {
      setLocationDenied(true);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = pos.coords;
        setLocation({ lat: coords.latitude, lng: coords.longitude });
        setLocationDenied(false);
        // Do not auto-advance. Stay on location step to show map.
      },
      (err) => {
        setLocationDenied(true);
        setError(err.message);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleContinueToCamera = () => {
    if (useQR) {
      setStep('qr');
    } else {
      setStep('photo');
    }
  };

  const startCamera = async () => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
      }
      const constraints: MediaStreamConstraints = {
        video: { facingMode },
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setCameraDenied(false);
    } catch (e: any) {
      setCameraDenied(true);
      setError(e?.message || 'Camera access denied');
    }
  };

  // Auto-start camera when entering photo step
  useEffect(() => {
    if (step === 'photo') {
      startCamera();
    }
    // Cleanup when leaving photo step
    return () => {
      if (step !== 'photo' && streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
      }
    };
  }, [step, facingMode]); // Re-run if step changes to photo or facingMode changes

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    };
  }, []);

  const handleCaptureFromVideo = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current || document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 640;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setPhoto(dataUrl);
    canvas.toBlob((b) => {
      if (b) setPhotoBlob(b);
    }, 'image/jpeg', 0.9);
    setStep('confirm-photo');
  };

  const handleSwitchCamera = async () => {
    setFacingMode(f => (f === 'user' ? 'environment' : 'user'));
    // useEffect will handle restart
  };

  const handleRetakePhoto = () => {
    setPhoto(null);
    setPhotoBlob(null);
    setStep('photo');
  };

  const handleConfirmPhoto = () => {
    setStep('comment');
  };

  const handleSubmitComment = () => {
    finishSubmission();
  };

  const handleSkipComment = () => {
    finishSubmission();
  };

  const handleQRScan = () => {
    // Simulate QR scan and then submit
    setTimeout(() => {
      finishSubmission();
    }, 1500);
  };

  const finishSubmission = async () => {
    try {
      const trimmedComment = comment.trim();
      const finalComment = trimmedComment || null;
      const timeStr = new Date().toTimeString().split(' ')[0]; // HH:mm:ss

      // Determine the image to send based on useQR flag
      const imageToSend = useQR ? null : photoBlob;

      if (type === 'in') {
        await dispatch(submitCheckIn({
          arrivalImg: imageToSend,
          arrivalLatitude: location?.lat ?? null,
          arrivalLongitude: location?.lng ?? null,
          lateReason: finalComment,
          arrivalTime: timeStr
        })).unwrap();
      } else {
        await dispatch(submitCheckOut({
          leaveImg: imageToSend,
          leaveLatitude: location?.lat ?? null,
          leaveLongitude: location?.lng ?? null,
          earlyLeaveReason: finalComment,
          leaveTime: timeStr
        })).unwrap();
      }
      await dispatch(fetchTodayRecord()).unwrap();
      setStep('success');
    } catch (e: any) {
      console.error('Submission error:', e);
      setError(e?.message || 'Submission failed');
      setStep('error');
    }
  };

  const handleComplete = () => {
    navigate('/employee');
  };

  const handleBack = () => {
    if (step === 'location') {
      setStep('initial');
    } else if (step === 'photo' || step === 'qr') {
      setStep('location');
    } else if (step === 'confirm-photo') {
      setStep('photo');
    } else if (step === 'comment') {
      setStep('confirm-photo');
    } else {
      navigate('/employee');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={handleBack}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex-1">
              <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
              <p className="text-sm text-gray-600">{time}</p>
            </div>
          </div>

          {/* Progress Indicator */}
          {step !== 'success' && step !== 'error' && (
            <div className="flex items-center justify-between text-sm font-medium text-gray-600">
              <span>Adım {getStepNumber()} / {totalSteps}</span>
              <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 transition-all duration-300 ease-out"
                  style={{ width: `${(getStepNumber() / totalSteps) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </header>

      <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-6 pb-20">
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
                  className={cn(
                    "w-full flex items-center gap-4 p-4 border-2 border-gray-200 rounded-lg transition-all",
                    type === 'in' ? "hover:border-green-500 hover:bg-green-50" : "hover:border-blue-500 hover:bg-blue-50"
                  )}
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
                  className={cn(
                    "w-full flex items-center gap-4 p-4 border-2 border-gray-200 rounded-lg transition-all",
                    type === 'in' ? "hover:border-green-500 hover:bg-green-50" : "hover:border-blue-500 hover:bg-blue-50"
                  )}
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
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              {!location ? (
                <div className="text-center py-8">
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
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-green-600 mb-2">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">Yer təsdiqləndi</span>
                  </div>

                  <div className="aspect-video w-full bg-gray-100 rounded-lg overflow-hidden relative border border-gray-200">
                    <img
                      src={`https://static-maps.yandex.ru/1.x/?ll=${location.lng},${location.lat}&z=17&l=map&size=600,300&pt=${location.lng},${location.lat},pm2gnm`}
                      alt="Location Map"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="text-xs text-center text-gray-500 font-mono bg-gray-50 py-2 rounded">
                    {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                  </div>

                  <Button
                    className={cn(
                      "w-full mt-4",
                      type === 'in' ? "bg-green-600 hover:bg-green-700 text-white" : "bg-blue-600 hover:bg-blue-700 text-white"
                    )}
                    size="lg"
                    onClick={handleContinueToCamera}
                  >
                    Davam Et
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Permission Modal (centered) */}
        {(locationDenied || cameraDenied) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <div className="relative z-10 w-[90%] max-w-md rounded-lg overflow-hidden">
              <div className="bg-red-600 text-white p-6 rounded-lg shadow-lg">
                <div className="font-medium text-lg mb-1">İcazə tələb olunur</div>
                <div className="text-sm mb-4">{locationDenied ? 'Yerə girişə icazə verilmədi' : 'Kameraya girişə icazə verilmədi'}</div>
                <div className="flex gap-3">
                  <button
                    className="flex-1 bg-white text-red-600 rounded-md py-2 font-medium"
                    onClick={() => {
                      setLocationDenied(false);
                      setCameraDenied(false);
                      if (step === 'location') handleGetLocation();
                      else if (step === 'photo') startCamera();
                    }}
                  >
                    Yenidən cəhd
                  </button>
                  <button
                    className="flex-1 bg-transparent border border-white rounded-md py-2 text-white"
                    onClick={() => {
                      // If they deny location, maybe just let them pass but without location? 
                      // For now we just let them try again or stuck. 
                      // But user might want to cancel.
                      navigate('/employee');
                    }}
                  >
                    Ləğv et
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Photo Step */}
        {step === 'photo' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {/* Camera Viewport */}
              <div className="aspect-3/4 bg-black relative">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />

                {/* Switch Camera Button Overlay */}
                <div className="absolute bottom-4 left-0 right-0 flex justify-center pb-2">
                  <button
                    onClick={handleSwitchCamera}
                    className="bg-black/30 backdrop-blur-md text-white px-4 py-2 rounded-full flex items-center gap-2 border border-white/20 active:scale-95 transition-transform"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span className="text-sm">Çevir</span>
                  </button>
                </div>
              </div>

              {/* Controls Below Camera */}
              <div className="p-6 bg-white">
                <div className="flex flex-col gap-3">
                  <Button
                    className={cn(
                      "w-full py-6 text-lg",
                      type === 'in' ? "bg-green-600 hover:bg-green-700 text-white" : "bg-blue-600 hover:bg-blue-700 text-white"
                    )}
                    onClick={handleCaptureFromVideo}
                  >
                    <Camera className="w-6 h-6 mr-2" />
                    Çək
                  </Button>

                  <Button
                    variant="ghost"
                    onClick={() => { setPhoto(null); setPhotoBlob(null); setStep('confirm-photo'); }}
                    className="text-gray-500"
                  >
                    Şəkilsiz davam et
                  </Button>
                </div>
              </div>

              <canvas ref={canvasRef} style={{ display: 'none' }} />
            </div>
          </div>
        )}

        {/* Confirm Photo Step (allows skip without photo) */}
        {step === 'confirm-photo' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Şəkili Təsdiqləyin</h2>

              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4 flex items-center justify-center">
                {photo ? (
                  <img src={photo} alt="Captured" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center text-gray-500">
                    <Camera className="mx-auto w-12 h-12 mb-2" />
                    <div className="text-sm">Şəkil atlandı</div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" fullWidth onClick={handleRetakePhoto}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Yenidən Çək
                </Button>
                <Button
                  className={cn(
                    "flex-1",
                    type === 'in' ? "bg-green-600 hover:bg-green-700 text-white" : "bg-blue-600 hover:bg-blue-700 text-white"
                  )}
                  onClick={handleConfirmPhoto}
                >
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
                <Button
                  className={cn(
                    "flex-1",
                    type === 'in' ? "bg-green-600 hover:bg-green-700 text-white" : "bg-blue-600 hover:bg-blue-700 text-white"
                  )}
                  onClick={handleSubmitComment}
                >
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
              {location && (
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-2 text-green-600">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">Yer təsdiqləndi</span>
                  </div>
                  <div className="aspect-video w-full bg-gray-100 rounded-lg overflow-hidden relative border border-gray-200 mb-2">
                    <img
                      src={`https://static-maps.yandex.ru/1.x/?ll=${location.lng},${location.lat}&z=17&l=map&size=600,300&pt=${location.lng},${location.lat},pm2gnm`}
                      alt="Location Map"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}

              <div className="text-center">
                <h2 className="font-semibold text-gray-900 mb-4">
                  QR Kodu Skan Edin
                </h2>

                <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center mb-4 relative overflow-hidden">
                  <QrCode className="w-16 h-16 text-gray-400" />
                  <div className="absolute inset-0 border-2 border-blue-500 animate-pulse" />
                </div>

                <p className="text-sm text-gray-600 mb-4">
                  QR kodu çərçivə daxilində yerləşdirin
                </p>

                <Button
                  className={cn(
                    "w-full",
                    type === 'in' ? "bg-green-600 hover:bg-green-700 text-white" : "bg-blue-600 hover:bg-blue-700 text-white"
                  )}
                  onClick={handleQRScan}
                >
                  Skan Edilir...
                </Button>
              </div>
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

              <Button
                className={cn(
                  "w-full",
                  type === 'in' ? "bg-green-600 hover:bg-green-700 text-white" : "bg-blue-600 hover:bg-blue-700 text-white"
                )}
                onClick={handleComplete}
              >
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

              <Button
                className={cn(
                  "w-full",
                  type === 'in' ? "bg-green-600 hover:bg-green-700 text-white" : "bg-blue-600 hover:bg-blue-700 text-white"
                )}
                onClick={() => setStep('initial')}
              >
                Yenidən Cəhd Et
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}