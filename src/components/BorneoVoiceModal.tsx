'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Mic, X, Volume2 } from 'lucide-react';

interface BorneoVoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyText: (spokenText: string) => void;
  promptText?: string;
  sampleCommands?: string[];
  feedbackMessage?: string;
}

export default function BorneoVoiceModal({
  isOpen,
  onClose,
  onApplyText,
  promptText = 'Mendengarkan... Sebutkan kota atau promo tujuan',
  sampleCommands = [
    'Palangkaraya',
    'Hotel',
    'Wisata Orangutan',
    'Rumah Betang',
    'Samarinda',
  ],
  feedbackMessage,
}: BorneoVoiceModalProps) {
  const [isListening, setIsListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [internalFeedback, setInternalFeedback] = useState('');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Abaikan jika sudah berhenti
      }
    }
    setIsListening(false);
  };

  const handleSelectText = (text: string) => {
    const cleaned = text.trim();
    if (!cleaned) return;
    setVoiceTranscript(cleaned);
    setInternalFeedback(`Kata kunci "${cleaned}" siap diterapkan`);
    onApplyText(cleaned);
  };

  const startListening = () => {
    setVoiceTranscript('');
    setInternalFeedback('');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognitionAPI =
      typeof window !== 'undefined'
        ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (window as any).SpeechRecognition ||
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (window as any).webkitSpeechRecognition
        : null;

    if (!SpeechRecognitionAPI) {
      setIsListening(false);
      setInternalFeedback(
        'Browser tidak mendukung mikrofon langsung. Pilih contoh perintah suara di bawah:'
      );
      return;
    }

    try {
      const recognition = new SpeechRecognitionAPI();
      recognition.lang = 'id-ID';
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onresult = (event: any) => {
        let interim = '';
        let finalText = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalText += transcript;
          } else {
            interim += transcript;
          }
        }
        if (interim) setVoiceTranscript(interim);
        if (finalText) {
          handleSelectText(finalText);
          setIsListening(false);
        }
      };

      recognition.onerror = () => {
        setIsListening(false);
        setInternalFeedback(
          'Mikrofon tidak terdeteksi / izin ditolak. Kamu tetap bisa pilih perintah cepat di bawah:'
        );
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      startListening();
    } else {
      stopListening();
    }
    return () => stopListening();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleClose = () => {
    stopListening();
    onClose();
  };

  if (!isOpen) return null;

  const displayedFeedback = feedbackMessage || internalFeedback;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-4">
      <div className="w-full max-w-[390px] bg-white rounded-3xl p-5 shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-[#15803D]" />
            <h3 className="text-sm font-extrabold text-gray-900">
              Borneo Voice Assistant
            </h3>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Tutup Voice Search"
            className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Indikator Mikrofon */}
        <div className="flex flex-col items-center justify-center py-3 text-center">
          <button
            type="button"
            onClick={() => (isListening ? stopListening() : startListening())}
            className={`w-16 h-16 rounded-full flex items-center justify-center text-white shadow-lg transition ${
              isListening
                ? 'bg-red-500 animate-pulse ring-8 ring-red-100'
                : 'btn-borneo hover:scale-105'
            }`}
          >
            <Mic className="w-7 h-7" />
          </button>

          <p className="text-xs font-bold text-gray-800 mt-3">
            {isListening
              ? promptText
              : 'Ketuk mikrofon atau pilih contoh suara'}
          </p>

          {voiceTranscript && (
            <p className="mt-2 px-3 py-1.5 rounded-xl bg-emerald-50 text-xs font-extrabold text-[#15803D]">
              &ldquo;{voiceTranscript}&rdquo;
            </p>
          )}

          {displayedFeedback && (
            <p className="text-[11px] text-gray-500 mt-1.5">
              {displayedFeedback}
            </p>
          )}
        </div>

        {/* Chip Simulasi Perintah Suara Cepat */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">
            Coba Ucapkan / Ketuk Cepat:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {sampleCommands.map((sample) => (
              <button
                key={sample}
                type="button"
                onClick={() => handleSelectText(sample)}
                className="px-3 py-1.5 rounded-full bg-gray-100 hover:bg-emerald-100 text-[11px] font-semibold text-gray-700 hover:text-[#15803D] transition"
              >
                &ldquo;{sample}&rdquo;
              </button>
            ))}
          </div>
        </div>

        {/* Tombol Selesai */}
        <div className="flex gap-2 pt-1">
          <button
            type="button"
            onClick={handleClose}
            className="flex-1 py-2.5 rounded-xl btn-borneo text-white text-xs font-bold shadow"
          >
            Terapkan
          </button>
        </div>
      </div>
    </div>
  );
}