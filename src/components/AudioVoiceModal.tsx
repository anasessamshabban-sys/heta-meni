import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Check, X, Loader2, Volume2 } from 'lucide-react';

interface AudioVoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTranscriptReady: (text: string) => void;
  titlePrompt?: string;
}

export const AudioVoiceModal: React.FC<AudioVoiceModalProps> = ({
  isOpen,
  onClose,
  onTranscriptReady,
  titlePrompt = 'سجلي فكرتك أو مهمتك بصوتك',
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordDuration, setRecordDuration] = useState(0);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isOpen) {
      cleanupRecording();
      setTranscript('');
      setErrorMessage(null);
      setRecordDuration(0);
    }
  }, [isOpen]);

  const cleanupRecording = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((t) => t.stop());
    }
    setIsRecording(false);
  };

  const startRecording = async () => {
    setErrorMessage(null);
    setTranscript('');
    audioChunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : MediaRecorder.isTypeSupported('audio/mp4')
        ? 'audio/mp4'
        : 'audio/ogg';

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        await processAudioTranscription(audioBlob, mimeType);
      };

      recorder.start(250);
      setIsRecording(true);
      setRecordDuration(0);

      timerIntervalRef.current = window.setInterval(() => {
        setRecordDuration((prev) => prev + 1);
      }, 1000);
    } catch (err: unknown) {
      console.error('Microphone access failed:', err);
      setErrorMessage('تعذر الوصول إلى الميكروفون. يرجى التأكد من السماح بالوصول في المتصفح.');
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
    }
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    setIsRecording(false);
  };

  const processAudioTranscription = async (blob: Blob, mimeType: string) => {
    setIsTranscribing(true);
    setErrorMessage(null);

    try {
      // Convert blob to base64
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        const base64Data = (reader.result as string).split(',')[1];
        if (!base64Data) {
          throw new Error('فشل في قراءة بيانات الصوت');
        }

        const res = await fetch('/api/transcribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            audioBase64: base64Data,
            mimeType,
          }),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || 'فشل في تفريغ التسجيل الصوتي');
        }

        const data = await res.json();
        setTranscript(data.text || '');
        setIsTranscribing(false);
      };
    } catch (err: unknown) {
      console.error('Transcription error:', err);
      const msg = err instanceof Error ? err.message : 'حدث خطأ أثناء تفريغ الصوت عبر النموذج الذكي';
      setErrorMessage(msg);
      setIsTranscribing(false);
    }
  };

  const handleApply = () => {
    if (transcript.trim()) {
      onTranscriptReady(transcript.trim());
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#182B49]/70 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-[#FFF4E4] border-4 border-[#182B49] paper-shadow-lg p-6 rounded-none">
        {/* Decorative Tape */}
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-32 h-6 washi-tape-yellow flex items-center justify-center text-[11px] font-bold tracking-wider text-[#182B49]">
          ملاحظة صوتية
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="إغلاق نافذة التسجيل"
          className="absolute top-4 left-4 p-1 bg-[#182B49] text-white hover:bg-[#E8473F] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-right mt-2">
          <h3 className="text-xl font-black text-[#182B49] mb-1 font-display">
            {titlePrompt}
          </h3>
          <p className="text-xs text-[#182B49]/80 font-medium">
            تفريغ فوري فائق الدقة باللهجة المصرية والعربية عبر نموذج <bdi dir="ltr" className="font-mono font-bold text-[#2455D6]">gemini-3.5-transcribe</bdi>
          </p>
        </div>

        {/* Central Audio Recording Interface */}
        <div className="my-6 flex flex-col items-center justify-center p-6 bg-white border-2 border-dashed border-[#182B49]/40 relative">
          {isRecording ? (
            <div className="flex flex-col items-center gap-3">
              <div className="relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E8473F] opacity-75" />
                <button
                  onClick={stopRecording}
                  aria-label="إيقاف التسجيل الصوتي"
                  className="relative p-5 bg-[#E8473F] text-white rounded-full paper-shadow hover:scale-105 active:scale-95 transition-transform"
                >
                  <Square className="w-8 h-8 fill-current" />
                </button>
              </div>
              <div className="text-sm font-bold text-[#E8473F] font-mono">
                جاري التسجيل: {Math.floor(recordDuration / 60)}:{(recordDuration % 60).toString().padStart(2, '0')}
              </div>
              <p className="text-xs text-[#182B49]/70 text-center">
                تكلمي براحتك.. اضغطي على المربع الأحمر عند الانتهاء.
              </p>
            </div>
          ) : isTranscribing ? (
            <div className="flex flex-col items-center gap-3 py-4">
              <Loader2 className="w-10 h-10 text-[#2455D6] animate-spin" />
              <div className="text-sm font-bold text-[#2455D6]">
                جاري تفريغ الصوت وتحويله لكلمات بدقة...
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <button
                onClick={startRecording}
                aria-label="بدء التسجيل الصوتي"
                className="p-5 bg-[#2455D6] text-white rounded-full paper-shadow hover:scale-105 active:scale-95 transition-transform"
              >
                <Mic className="w-8 h-8" />
              </button>
              <div className="text-sm font-bold text-[#182B49]">
                اضغطي لبدء التحدث بالصوت
              </div>
              <p className="text-xs text-[#182B49]/60 text-center">
                سجلي فكرة سريعة، أو محاضرة، أو مهمة دراسية جديدة
              </p>
            </div>
          )}

          {errorMessage && (
            <div className="mt-4 p-2 bg-[#E8473F]/10 border border-[#E8473F] text-[#E8473F] text-xs font-bold text-center w-full">
              {errorMessage}
            </div>
          )}
        </div>

        {/* Transcript Box */}
        {transcript && (
          <div className="mb-4">
            <label className="block text-xs font-bold text-[#182B49] mb-1">
              النص المفرغ:
            </label>
            <textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              className="w-full p-3 bg-white border-2 border-[#182B49] text-sm font-medium focus:ring-2 focus:ring-[#2455D6] outline-hidden min-h-[90px]"
              dir="rtl"
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#182B49]/20">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-[#182B49] hover:bg-black/5"
          >
            إلغاء
          </button>
          {transcript && (
            <button
              onClick={handleApply}
              className="px-5 py-2 bg-[#48A868] text-white text-xs font-black border-2 border-[#182B49] paper-shadow-sm hover:brightness-105 flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              اعتماد وإضافة النص
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
