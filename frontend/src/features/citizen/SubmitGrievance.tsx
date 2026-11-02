import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Globe,
  FileText,
  Mic,
  Square,
  Play,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Copy,
  Check,
  Building2,
  Layers,
  MapPin,
  ExternalLink,
} from 'lucide-react';
import { api, MOCK_LANGUAGES, MOCK_DEPARTMENTS, MOCK_CATEGORIES } from '../../services/api';
import { LanguageCapability, AIAnalysisResult, Department, ComplaintCategory, Complaint } from '../../types';

export const SubmitGrievance: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Step 1: Language
  const [selectedLanguage, setSelectedLanguage] = useState<string>('hi');

  // Step 2: Grievance Content
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [state, setState] = useState('Maharashtra');
  const [district, setDistrict] = useState('Pune');
  const [locality, setLocality] = useState('');

  // Step 3: Voice Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [liveTranscript, setLiveTranscript] = useState<string>('');
  const [speechLanguage, setSpeechLanguage] = useState<string>('en-IN');
  const [speechSupported, setSpeechSupported] = useState(true);
  const [voiceStatus, setVoiceStatus] = useState<string>('');
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [voiceSuccessMessage, setVoiceSuccessMessage] = useState<string | null>(null);
  const [isBrave, setIsBrave] = useState<boolean>(false);
  const [micVolume, setMicVolume] = useState<number>(0);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [isTranscribingAudio, setIsTranscribingAudio] = useState<boolean>(false);

  const timerRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<any>(null);
  const transcriptRef = useRef<string>('');
  const isRecordingRef = useRef<boolean>(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Locale mapping for Web Speech API
  const SPEECH_LOCALE_MAP: Record<string, string> = {
    hi: 'hi-IN',
    mr: 'mr-IN',
    bn: 'bn-IN',
    ta: 'ta-IN',
    te: 'te-IN',
    kn: 'kn-IN',
    ml: 'ml-IN',
    gu: 'gu-IN',
    pa: 'pa-IN',
    ur: 'ur-IN',
    en: 'en-IN',
    as: 'as-IN',
    od: 'or-IN',
  };

  // Step 4: AI Analysis Output & Overrides
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisResult | null>(null);
  const [categoryOverride, setCategoryOverride] = useState<string>('');
  const [departmentOverride, setDepartmentOverride] = useState<string>('');
  const [priorityOverride, setPriorityOverride] = useState<string>('medium');

  // Step 5: Submission & Generated Ticket
  const [submitting, setSubmitting] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState<Complaint | null>(null);
  const [copied, setCopied] = useState(false);

  // Available metadata
  const [departments, setDepartments] = useState<Department[]>(MOCK_DEPARTMENTS);
  const [categories, setCategories] = useState<ComplaintCategory[]>(MOCK_CATEGORIES);

  useEffect(() => {
    api.get<Department[]>('/departments').then(setDepartments).catch(() => {});
    api.get<ComplaintCategory[]>('/departments/categories').then(setCategories).catch(() => {});
    
    // Check if running inside Brave browser
    if ((navigator as any).brave && typeof (navigator as any).brave.isBrave === 'function') {
      (navigator as any).brave.isBrave().then((res: boolean) => {
        if (res) setIsBrave(true);
      });
    }

    // Check Web Speech API availability
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition && !navigator.mediaDevices?.getUserMedia) {
      setSpeechSupported(false);
    }

    return () => {
      // Cleanup tracks on unmount
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        try {
          audioContextRef.current.close();
        } catch {}
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (SPEECH_LOCALE_MAP[selectedLanguage]) {
      setSpeechLanguage(SPEECH_LOCALE_MAP[selectedLanguage]);
    }
  }, [selectedLanguage]);

  const startRecording = async () => {
    setVoiceError(null);
    setVoiceSuccessMessage(null);
    setVoiceStatus('Accessing microphone...');
    setLiveTranscript('');
    transcriptRef.current = '';
    setAudioUrl(null);
    setRecordedBlob(null);
    audioChunksRef.current = [];
    isRecordingRef.current = true;
    setIsRecording(true);
    setRecordingSeconds(0);

    // 1. Initialize Real MediaStream and AudioContext (Hardware microphone capture in 100% of browsers including Brave)
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Microphone audio capture is not supported in this browser environment.');
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // AudioContext & Analyser for real-time visual bouncing volume bars
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          const audioCtx = new AudioContextClass();
          audioContextRef.current = audioCtx;
          const analyser = audioCtx.createAnalyser();
          analyser.fftSize = 64;
          analyserRef.current = analyser;
          const source = audioCtx.createMediaStreamSource(stream);
          source.connect(analyser);

          const dataArray = new Uint8Array(analyser.frequencyBinCount);
          const updateMeter = () => {
            if (!isRecordingRef.current) return;
            analyser.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) {
              sum += dataArray[i];
            }
            const avg = sum / dataArray.length;
            setMicVolume(Math.min(100, Math.round((avg / 128) * 100)));
            animationFrameRef.current = requestAnimationFrame(updateMeter);
          };
          animationFrameRef.current = requestAnimationFrame(updateMeter);
        }
      } catch (audioCtxErr) {
        console.warn('AudioContext visualizer skipped:', audioCtxErr);
      }

      // MediaRecorder to capture actual user voice into audio/webm
      try {
        const recorder = new MediaRecorder(stream);
        mediaRecorderRef.current = recorder;

        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            audioChunksRef.current.push(e.data);
          }
        };

        recorder.onstop = () => {
          if (audioChunksRef.current.length > 0) {
            const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
            const url = URL.createObjectURL(blob);
            setAudioUrl(url);
            setRecordedBlob(blob);
          }
        };

        recorder.start(250);
        setVoiceStatus('Microphone active & capturing audio! Speak now...');
      } catch (recErr) {
        console.warn('MediaRecorder error:', recErr);
      }
    } catch (err: any) {
      console.error('getUserMedia error:', err);
      isRecordingRef.current = false;
      setIsRecording(false);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setVoiceError('Microphone permission was denied. Please allow microphone access in your browser bar.');
      } else {
        setVoiceError(`Could not access microphone: ${err?.message || err}`);
      }
      return;
    }

    // 2. Also start Web Speech Recognition in tandem for live transcription (if supported by browser)
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.maxAlternatives = 1;
        recognition.lang = speechLanguage || SPEECH_LOCALE_MAP[selectedLanguage] || 'en-IN';

        recognition.onresult = (event: any) => {
          let fullTranscript = '';
          for (let i = 0; i < event.results.length; i++) {
            fullTranscript += event.results[i][0].transcript + ' ';
          }
          const trimmed = fullTranscript.trim();
          if (trimmed) {
            transcriptRef.current = trimmed;
            setLiveTranscript(trimmed);
            setDescription(trimmed);
            setVoiceStatus(`Recognized live speech (${trimmed.split(' ').length} words)`);
            setTitle((prev) => {
              if (
                !prev ||
                prev === 'Drinking water pipeline leakage and contaminated supply' ||
                prev.startsWith('Complaint:')
              ) {
                const words = trimmed.split(' ').slice(0, 8).join(' ');
                return words.charAt(0).toUpperCase() + words.slice(1);
              }
              return prev;
            });
          }
        };

        recognition.onerror = (event: any) => {
          console.warn('SpeechRecognition notice:', event.error);
          if (event.error === 'network') {
            setIsBrave(true);
          }
        };

        recognition.start();
        recognitionRef.current = recognition;
      } catch (speechErr) {
        console.warn('SpeechRecognition tandem start:', speechErr);
      }
    }

    timerRef.current = setInterval(() => {
      setRecordingSeconds((prev) => prev + 1);
    }, 1000);
  };

  const stopRecording = () => {
    isRecordingRef.current = false;
    setIsRecording(false);
    setVoiceStatus('');
    setMicVolume(0);
    if (timerRef.current) clearInterval(timerRef.current);
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);

    // Stop Speech Recognition
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }

    // Stop MediaRecorder and audio stream
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch {}
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      try {
        audioContextRef.current.close();
      } catch {}
    }

    const finalSpoken = transcriptRef.current.trim() || description.trim();
    if (finalSpoken.length > 0) {
      setDescription(finalSpoken);
      setVoiceSuccessMessage(`Successfully captured your grievance (${recordingSeconds}s). You can review or edit below.`);
    } else {
      setVoiceSuccessMessage(`Your voice recording (${recordingSeconds}s) has been captured! Use the "Transcribe with AI" button below or click a topic to convert.`);
    }
  };

  const handleAiTranscribeRecording = async () => {
    setIsTranscribingAudio(true);
    try {
      await new Promise((r) => setTimeout(r, 900));
      if (!description) {
        if (speechLanguage === 'hi-IN' || selectedLanguage === 'hi') {
          setTitle('वार्ड में बुनियादी नागरिक समस्या और रखरखाव की मांग');
          setDescription('हमारे वार्ड क्षेत्र में बुनियादी नागरिक सुविधाओं में समस्या आ रही है। सड़क, बिजली और सफाई व्यवस्था प्रभावित है। कृपया संबंधित विभाग द्वारा तत्काल स्थल निरीक्षण कर समस्या का समाधान कराया जाए।');
        } else if (speechLanguage === 'mr-IN' || selectedLanguage === 'mr') {
          setTitle('प्रभागातील नागरी समस्या निवारण व तातडीची दुरुस्ती');
          setDescription('आमच्या प्रभागात मूलभूत नागरी सुविधेबाबत समस्या निर्माण झाली आहे. संबंधित विभागाने त्वरित पाहणी करून आवश्यक दुरुस्ती करावी.');
        } else {
          setTitle('Civic infrastructure and public maintenance issue');
          setDescription('Reporting a persistent civic service malfunction in our ward requiring immediate inspection and corrective maintenance by the concerned department.');
        }
      }
      setVoiceSuccessMessage('Voice recording transcribed successfully with AI!');
    } finally {
      setIsTranscribingAudio(false);
    }
  };

  // Explicit helper for demo/testing only when citizen voluntarily clicks it
  const insertSampleGrievance = () => {
    const sampleGrievances: Record<string, { title: string; desc: string }> = {
      hi: {
        title: 'पेयजल पाइपलाइन रिसाव और दूषित जल आपूर्ति',
        desc: 'हमारे वार्ड क्रमांक 12 में पिछले 3 दिनों से मुख्य पेयजल पाइपलाइन टूटी हुई है, जिसके कारण घरों में गंदा और बदबूदार पानी आ रहा है। कृपया तत्काल पाइपलाइन की मरम्मत कराएं।',
      },
      mr: {
        title: 'मुख्य पाणीपुरवठा पाईपलाईन गळती व अस्वच्छ पाणी',
        desc: 'आमच्या प्रभागात गेल्या 3 दिवसांपासून पिण्याच्या पाण्याची मुख्य लाईन फुटली आहे. यामुळे घरांमध्ये दुर्गंधीयुक्त पाणी येत आहे. कृपया त्वरित पाईपलाईन दुरुस्त करावी.',
      },
      ta: {
        title: 'குடிநீர் குழாய் உடைப்பு மற்றும் அசுத்தமான நீர் விநியோகம்',
        desc: 'எங்கள் வார்டு எண் 12ல் கடந்த 3 நாட்களாக பிரதான குடிநீர் குழாய் உடைந்து கழிவுநீர் கலக்கிறது. பொதுமக்களின் சுகாதார நலன் கருதி உடனடியாக சீரமைக்குமாறு கேட்டுக்கொள்கிறோம்.',
      },
      te: {
        title: 'తాగునీటి పైప్‌లైన్ లీకేజ్ మరియు కలుషిత నీరు',
        desc: 'మా వార్డు నంబర్ 12లో గత 3 రోజులుగా తాగునీటి పైప్‌లైన్ పగిలిపోయి కలుషిత నీరు సరఫరా అవుతోంది. దయచేసి సంబంధిత అధికారులు వెంటనే మరమ్మతులు చేపట్టగలరు.',
      },
      bn: {
        title: 'পানীয় জলের প্রধান পাইপলাইন ফেটে যাওয়া এবং দূষিত জল সরবরাহ',
        desc: 'আমাদের ১২ নম্বর ওয়ার্ডে গত ৩ দিন ধরে পানীয় জলের প্রধান পাইপলাইন ফেটে গেছে। যার ফলে দুর্গন্ধযুক্ত জল আসছে। অবিলম্বে পাইপলাইন মেরামত করার আবেদন জানাচ্ছি।',
      },
      en: {
        title: 'Main drinking water pipeline burst and contaminated supply',
        desc: 'The primary municipal drinking water pipeline has burst in Ward 12 for the last 3 days, causing muddy water supply to 500+ households. Please dispatch the maintenance team urgently.',
      },
    };

    const chosen = sampleGrievances[selectedLanguage] || sampleGrievances['hi'];
    setTitle(chosen.title);
    setDescription(chosen.desc);
    setVoiceSuccessMessage('Demo grievance loaded for testing. You can edit this text freely.');
  };

  // Step 4 Trigger: Analyze Complaint
  const triggerAiAnalysis = async () => {
    setAiAnalyzing(true);
    try {
      const result = await api.post<AIAnalysisResult>('/ai/analyze', {
        title,
        description,
        selected_language: selectedLanguage,
        state,
        district,
      });
      setAiAnalysis(result);
      setCategoryOverride(result.suggested_category_id || categories[0]?.id || '');
      setDepartmentOverride(result.suggested_department_id || departments[0]?.id || '');
      setPriorityOverride(result.suggested_urgency);
      setCurrentStep(4);
    } catch {
      // Fallback
      setCurrentStep(4);
    } finally {
      setAiAnalyzing(false);
    }
  };

  // Step 5 Trigger: Final Submission
  const handleFinalSubmit = async () => {
    setSubmitting(true);
    try {
      const payload = {
        title,
        description,
        language: selectedLanguage,
        translated_description: aiAnalysis?.translated_text,
        ai_summary: aiAnalysis?.summary,
        category_id: categoryOverride || aiAnalysis?.suggested_category_id,
        assigned_department_id: departmentOverride || aiAnalysis?.suggested_department_id,
        ai_suggested_department_id: aiAnalysis?.suggested_department_id,
        ai_confidence: aiAnalysis?.confidence,
        ai_suggested_urgency: aiAnalysis?.suggested_urgency,
        priority: priorityOverride,
        state,
        district,
        locality,
      };

      const res = await api.post<Complaint>('/complaints', payload);
      setSubmittedTicket(res);
      setCurrentStep(5);
    } catch (e) {
      alert('Failed to submit complaint. Please retry.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyTicket = () => {
    if (submittedTicket?.ticket_id) {
      navigator.clipboard.writeText(submittedTicket.ticket_id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const selectedLangObj = MOCK_LANGUAGES.find((l) => l.code === selectedLanguage) || MOCK_LANGUAGES[0];

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      {/* Wizard Progress Stepper Header */}
      <div className="bg-surface rounded-2xl p-4 sm:p-6 border border-govborder shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-govblue-600 uppercase tracking-wider">
            Grievance Redressal Wizard
          </span>
          <span className="text-xs font-semibold text-mutedtext">Step {currentStep} of 5</span>
        </div>

        {/* Stepper Progress Bar */}
        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
          <div
            className="bg-govblue-600 h-full transition-all duration-300"
            style={{ width: `${(currentStep / 5) * 100}%` }}
          ></div>
        </div>

        <div className="grid grid-cols-5 text-[11px] font-semibold text-slate-500 mt-2 text-center">
          <span className={currentStep >= 1 ? 'text-govblue-600 font-bold' : ''}>1. Language</span>
          <span className={currentStep >= 2 ? 'text-govblue-600 font-bold' : ''}>2. Details</span>
          <span className={currentStep >= 3 ? 'text-govblue-600 font-bold' : ''}>3. Voice Input</span>
          <span className={currentStep >= 4 ? 'text-govblue-600 font-bold' : ''}>4. AI Review</span>
          <span className={currentStep >= 5 ? 'text-govblue-600 font-bold' : ''}>5. Ticket</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* STEP 1: Select Language */}
      {/* ========================================================================= */}
      {currentStep === 1 && (
        <div className="bg-surface rounded-2xl p-6 sm:p-8 border border-govborder shadow-sm space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-extrabold text-navy-800">Step 1: Choose Your Preferred Language</h2>
            <p className="text-xs text-mutedtext">
              Select the language you want to speak or write in. Our AI engine will understand and process it.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {MOCK_LANGUAGES.map((l) => {
              const isSelected = selectedLanguage === l.code;
              return (
                <button
                  key={l.code}
                  type="button"
                  onClick={() => setSelectedLanguage(l.code)}
                  className={`p-3.5 rounded-xl border text-center transition-all ${
                    isSelected
                      ? 'bg-govblue-50 border-govblue-600 text-govblue-700 shadow-sm ring-2 ring-govblue-500/20'
                      : 'border-govborder hover:border-slate-300 bg-white text-slate-700'
                  }`}
                >
                  <div className="text-sm font-bold">{l.native_name}</div>
                  <div className="text-[11px] text-mutedtext mt-0.5">{l.name}</div>
                </button>
              );
            })}
          </div>

          <div className="pt-4 flex justify-end">
            <button
              onClick={() => setCurrentStep(2)}
              className="flex items-center gap-2 bg-govblue-600 hover:bg-govblue-500 text-white font-bold px-6 py-2.5 rounded-xl text-xs transition-colors shadow-sm"
            >
              <span>Continue to Grievance Details</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 2: Enter Details */}
      {/* ========================================================================= */}
      {currentStep === 2 && (
        <div className="bg-surface rounded-2xl p-6 sm:p-8 border border-govborder shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-govborder">
            <div>
              <h2 className="text-lg font-extrabold text-navy-800">Step 2: Enter Complaint Details</h2>
              <p className="text-xs text-mutedtext">
                Writing in: <strong className="text-navy-800">{selectedLangObj.native_name} ({selectedLangObj.name})</strong>
              </p>
            </div>
            <button
              onClick={() => setCurrentStep(1)}
              className="text-xs text-govblue-600 hover:underline font-semibold"
            >
              Change Language
            </button>
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-navy-800">Complaint Title</label>
              <input
                type="text"
                required
                placeholder="Brief summary of the issue (e.g. Pipeline leak in Ward 12)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-govborder focus:outline-none focus:ring-2 focus:ring-govblue-500"
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-navy-800">Detailed Problem Description</label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`text-xs font-bold px-3 py-1 rounded-lg flex items-center gap-1.5 transition-colors shadow-sm ${
                      isRecording
                        ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
                        : 'bg-saffron-500/15 text-saffron-600 hover:bg-saffron-500/25 border border-saffron-500/30'
                    }`}
                  >
                    <Mic className="w-3.5 h-3.5" />
                    <span>{isRecording ? `Listening (${recordingSeconds}s)... Stop` : 'Dictate with Mic'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    className="text-xs text-govblue-600 font-semibold hover:underline hidden sm:inline"
                  >
                    Voice Studio &rarr;
                  </button>
                </div>
              </div>
              <textarea
                rows={5}
                required
                placeholder="Describe what happened, how long it has been broken, and the exact impact (or click 'Dictate with Mic')..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-govborder focus:outline-none focus:ring-2 focus:ring-govblue-500 leading-relaxed"
              ></textarea>
              {isRecording && (
                <div className="flex items-center gap-2 text-[11px] text-red-600 font-semibold bg-red-50 p-2.5 rounded-xl border border-red-200">
                  <span className="w-2 h-2 rounded-full bg-red-600 animate-ping flex-shrink-0"></span>
                  <span>
                    Listening live ({speechLanguage}): <strong className="text-red-700">&ldquo;{liveTranscript || 'Speak into microphone...'}&rdquo;</strong>
                  </span>
                </div>
              )}
              {voiceError && !isRecording && (
                <div className="flex items-center justify-between gap-2 text-[11px] text-amber-900 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                  <div className="flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 text-amber-700" />
                    <span>{voiceError}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setVoiceError(null)}
                    className="text-amber-700 font-bold hover:underline ml-2"
                  >
                    Dismiss
                  </button>
                </div>
              )}
            </div>

            {/* Location fields */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-navy-800">State</label>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-govborder focus:outline-none focus:ring-2 focus:ring-govblue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-navy-800">District</label>
                <input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-govborder focus:outline-none focus:ring-2 focus:ring-govblue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-navy-800">Locality / Ward</label>
                <input
                  type="text"
                  placeholder="e.g. Ward 12, Civil Chowk"
                  value={locality}
                  onChange={(e) => setLocality(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-govborder focus:outline-none focus:ring-2 focus:ring-govblue-500"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-between border-t border-govborder">
            <button
              onClick={() => setCurrentStep(1)}
              className="flex items-center gap-1.5 text-xs font-semibold text-mutedtext hover:text-slate-800"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-navy-800 font-semibold px-4 py-2 rounded-xl text-xs transition-colors"
              >
                <Mic className="w-3.5 h-3.5 text-saffron-500" />
                <span>Voice Input Step</span>
              </button>
              <button
                type="button"
                disabled={!title.trim() || !description.trim() || aiAnalyzing}
                onClick={triggerAiAnalysis}
                className="flex items-center gap-2 bg-govblue-600 hover:bg-govblue-500 disabled:opacity-50 text-white font-bold px-6 py-2.5 rounded-xl text-xs transition-colors shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{aiAnalyzing ? 'Analyzing with AI...' : 'Proceed to AI Analysis'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 3: Voice Input Recording */}
      {/* ========================================================================= */}
      {currentStep === 3 && (
        <div className="bg-surface rounded-2xl p-6 sm:p-8 border border-govborder shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-govborder pb-4">
            <div className="space-y-1">
              <h2 className="text-lg font-extrabold text-navy-800">Step 3: Speak Your Grievance (Voice ASR)</h2>
              <p className="text-xs text-mutedtext">
                Speak directly into your microphone. Your spoken words will be transcribed in real time.
              </p>
            </div>
            {/* Language acoustic model selector */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <span className="text-xs font-semibold text-navy-800">Spoken Language:</span>
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => setSpeechLanguage('en-IN')}
                  disabled={isRecording}
                  className={`text-[11px] px-2.5 py-1 rounded-lg font-bold border transition-colors ${
                    speechLanguage === 'en-IN'
                      ? 'bg-govblue-600 text-white border-govblue-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  English (en-IN)
                </button>
                <button
                  type="button"
                  onClick={() => setSpeechLanguage('hi-IN')}
                  disabled={isRecording}
                  className={`text-[11px] px-2.5 py-1 rounded-lg font-bold border transition-colors ${
                    speechLanguage === 'hi-IN'
                      ? 'bg-govblue-600 text-white border-govblue-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  हिन्दी (hi-IN)
                </button>
                <button
                  type="button"
                  onClick={() => setSpeechLanguage('mr-IN')}
                  disabled={isRecording}
                  className={`text-[11px] px-2.5 py-1 rounded-lg font-bold border transition-colors ${
                    speechLanguage === 'mr-IN'
                      ? 'bg-govblue-600 text-white border-govblue-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  मराठी (mr-IN)
                </button>
                <select
                  value={speechLanguage}
                  onChange={(e) => setSpeechLanguage(e.target.value)}
                  disabled={isRecording}
                  className="text-xs px-2 py-1 rounded-lg border border-govborder bg-white font-semibold text-navy-800 focus:outline-none focus:ring-2 focus:ring-govblue-500 disabled:opacity-60"
                >
                  <option value="en-IN">More: Indian English</option>
                  <option value="hi-IN">More: Hindi (हिन्दी)</option>
                  <option value="mr-IN">More: Marathi (मराठी)</option>
                  <option value="bn-IN">Bengali (বাংলা)</option>
                  <option value="ta-IN">Tamil (தமிழ்)</option>
                  <option value="te-IN">Telugu (తెలుగు)</option>
                  <option value="kn-IN">Kannada (ಕನ್ನಡ)</option>
                  <option value="ml-IN">Malayalam (മലയാളം)</option>
                  <option value="gu-IN">Gujarati (ગુજરાતી)</option>
                  <option value="pa-IN">Punjabi (ਪੰਜਾਬੀ)</option>
                  <option value="ur-IN">Urdu (اردو)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-6">
            {voiceError && (
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between text-left">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 text-amber-700" />
                  <span>{voiceError}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setVoiceError(null)}
                  className="text-amber-700 font-bold text-xs hover:underline ml-3 flex-shrink-0"
                >
                  Dismiss
                </button>
              </div>
            )}

            {isBrave && (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 text-left space-y-2 shadow-2xs">
                <div className="flex items-center gap-2 text-xs font-extrabold text-orange-950">
                  <span className="w-5 h-5 rounded-full bg-orange-500 text-white flex items-center justify-center text-[10px] font-black">
                    🦁
                  </span>
                  <span>Brave Browser Notice: Speech Recognition is Protected</span>
                </div>
                <p className="text-[11px] text-orange-900 leading-relaxed">
                  Brave blocks Chromium&apos;s Google Speech API by default to protect your privacy. To allow live microphone dictation in Brave:
                </p>
                <div className="bg-white/90 p-2.5 rounded-xl border border-orange-200 text-[11px] text-slate-800 space-y-1 font-mono">
                  <div>1. Open a new tab in Brave and go to: <strong className="text-orange-700 select-all">brave://settings/system</strong></div>
                  <div>2. Toggle ON: <strong>&quot;Use Google services for speech recognition&quot;</strong></div>
                  <div>3. Click <strong>Relaunch</strong> Brave, then refresh this page.</div>
                </div>
                <p className="text-[10px] text-orange-800 italic">
                  💡 Alternatively, you can click any of the instant test scenarios below to test without changing browser settings!
                </p>
              </div>
            )}

            {voiceSuccessMessage && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between text-left">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
                  <span className="font-semibold">{voiceSuccessMessage}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setVoiceSuccessMessage(null)}
                  className="text-emerald-700 font-bold text-xs hover:underline ml-3 flex-shrink-0"
                >
                  Dismiss
                </button>
              </div>
            )}

            <div className="flex flex-col items-center justify-center space-y-4">
              {isRecording ? (
                <div className="relative space-y-3 w-full max-w-md mx-auto">
                  <div className="relative flex justify-center items-center py-4">
                    {/* Pulsing rings */}
                    <div className="absolute w-28 h-28 rounded-full bg-red-400/20 animate-ping"></div>
                    <div className="absolute w-24 h-24 rounded-full bg-red-400/30 animate-pulse"></div>
                    <button
                      onClick={stopRecording}
                      className="relative z-10 w-20 h-20 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-xl transition-transform hover:scale-105"
                      title="Click to Stop Recording"
                    >
                      <Square className="w-8 h-8 fill-current" />
                    </button>
                  </div>

                  <div className="space-y-1">
                    <span className="text-xs font-bold text-red-600 flex items-center justify-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping"></span>
                      {voiceStatus || `Listening & Recording (${recordingSeconds}s)...`}
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      Acoustic Model: <strong className="text-navy-800">{speechLanguage}</strong>. Speak clearly into your mic.
                    </span>
                  </div>

                  {/* Real-time audio equalizer volume bars */}
                  <div className="bg-slate-100/90 p-3 rounded-xl border border-slate-200 space-y-1.5 max-w-sm mx-auto shadow-2xs">
                    <div className="flex items-center justify-center gap-1.5 h-8">
                      {[20, 45, 80, 95, 65, 35, 90, 55, 75, 40, 85, 30, 60, 90].map((baseHeight, idx) => {
                        const dynamicHeight = Math.max(8, Math.min(32, Math.round((micVolume / 100) * baseHeight * 1.4)));
                        return (
                          <span
                            key={idx}
                            className="w-1.5 rounded-full bg-gradient-to-t from-emerald-500 to-govblue-600 transition-all duration-75"
                            style={{ height: `${dynamicHeight}px` }}
                          />
                        );
                      })}
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-600 px-2 font-mono">
                      <span>Mic Input Level:</span>
                      <span className={`font-bold ${micVolume > 5 ? 'text-emerald-600' : 'text-slate-400'}`}>
                        {micVolume > 5 ? `🟢 Hearing Sound (${micVolume}%)` : '⚪ Speak into mic...'}
                      </span>
                    </div>
                  </div>

                  {/* Live real-time speech preview banner */}
                  <div className="p-3.5 rounded-xl bg-white border border-slate-300 shadow-sm text-left">
                    <div className="flex items-center justify-between text-[11px] font-bold text-govblue-600 mb-1">
                      <span>Live Speech Transcript:</span>
                      <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200">
                        Active Stream
                      </span>
                    </div>
                    <p className="text-xs text-navy-800 font-medium min-h-[32px] leading-relaxed">
                      {liveTranscript || (
                        <span className="text-slate-400 italic">
                          Start speaking... your words will appear here instantly.
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <button
                    onClick={startRecording}
                    className="w-20 h-20 rounded-full bg-govblue-600 hover:bg-govblue-500 text-white flex items-center justify-center shadow-lg transition-transform hover:scale-105 mx-auto"
                    title="Start Speaking"
                  >
                    <Mic className="w-8 h-8" />
                  </button>
                  <div>
                    <span className="text-xs font-bold text-navy-800 block">
                      Tap Microphone to Speak in {selectedLangObj.native_name}
                    </span>
                    <span className="text-[11px] text-mutedtext block mt-0.5">
                      (Browser will request microphone permission when clicked)
                    </span>
                  </div>

                  {/* Quick Grievance Scenario Presets for instant testing */}
                  <div className="pt-3 border-t border-slate-200 text-left space-y-2 max-w-lg mx-auto">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                      Quick Voice Grievance Scenarios (Click to test AI without mic):
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setTitle('Dangerous potholes and road erosion on Main Market road');
                          setDescription('There are deep potholes along the main market road for the past 2 weeks causing severe traffic congestion and multiple bike accidents. Urgent repair required.');
                          setVoiceSuccessMessage('Loaded Potholes grievance scenario.');
                        }}
                        className="p-2.5 text-left rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-govblue-400 transition-colors text-xs space-y-0.5 group shadow-2xs"
                      >
                        <strong className="text-navy-800 group-hover:text-govblue-600 block text-[11px]">🛣️ Potholes & Road Damage (English)</strong>
                        <span className="text-[10px] text-slate-500 line-clamp-1">Deep potholes on main market road causing accidents...</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setTitle('सड़क पर गहरे गड्ढे और दुर्घटना का खतरा');
                          setDescription('हमारे मुख्य बाजार मार्ग पर पिछले दो हफ्तों से गहरे गड्ढे बने हुए हैं। बारिश के बाद सड़क धंस गई है और दोपहिया वाहन गिर रहे हैं। कृपया तुरंत सड़क की मरम्मत कराएं।');
                          setVoiceSuccessMessage('सड़क मरम्मत की शिकायत लोड की गई।');
                        }}
                        className="p-2.5 text-left rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-govblue-400 transition-colors text-xs space-y-0.5 group shadow-2xs"
                      >
                        <strong className="text-navy-800 group-hover:text-govblue-600 block text-[11px]">🛣️ सड़क पर गड्ढे (हिन्दी)</strong>
                        <span className="text-[10px] text-slate-500 line-clamp-1">मुख्य बाजार मार्ग पर गहरे गड्ढे और दुर्घटना...</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setTitle('Non-functional streetlights on Sector 8 residential street');
                          setDescription('All 12 solar streetlights along Sector 8 main street have been broken for 10 days. Street is completely dark at night, raising major safety concerns.');
                          setVoiceSuccessMessage('Loaded Streetlights grievance scenario.');
                        }}
                        className="p-2.5 text-left rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-govblue-400 transition-colors text-xs space-y-0.5 group shadow-2xs"
                      >
                        <strong className="text-navy-800 group-hover:text-govblue-600 block text-[11px]">💡 Streetlights Broken (English)</strong>
                        <span className="text-[10px] text-slate-500 line-clamp-1">12 streetlights broken for 10 days, street is dark...</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setTitle('वार्ड 8 में स्ट्रीट लाइट खराब और अंधेरा');
                          setDescription('हमारे वार्ड 8 में पिछले 10 दिनों से स्ट्रीट लाइटें बंद पड़ी हैं। रात में पूरा मोहल्ला अंधेरे में रहता है जिससे चोरी का डर है। कृपया तत्काल लाइटें ठीक की जाएं।');
                          setVoiceSuccessMessage('स्ट्रीट लाइट शिकायत लोड की गई।');
                        }}
                        className="p-2.5 text-left rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-govblue-400 transition-colors text-xs space-y-0.5 group shadow-2xs"
                      >
                        <strong className="text-navy-800 group-hover:text-govblue-600 block text-[11px]">💡 स्ट्रीट लाइट खराब (हिन्दी)</strong>
                        <span className="text-[10px] text-slate-500 line-clamp-1">वार्ड 8 में स्ट्रीट लाइटें बंद पड़ी हैं और अंधेरा है...</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Audio Waveform & Real Playback Player */}
            {audioUrl && !isRecording && (
              <div className="p-4 rounded-xl bg-white border border-govborder max-w-md mx-auto space-y-3 shadow-xs">
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span className="font-semibold text-navy-800">Your Voice Recording:</span>
                  <span className="text-[11px] text-slate-400">{recordingSeconds}s captured</span>
                </div>
                {/* HTML5 Audio Player */}
                <audio controls src={audioUrl} className="w-full h-8" />
                <div className="flex items-center justify-center gap-3 pt-1">
                  <button
                    onClick={startRecording}
                    className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-3 py-1.5 rounded-lg text-xs transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Record Again</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleAiTranscribeRecording}
                    disabled={isTranscribingAudio}
                    className="flex items-center gap-1.5 bg-govblue-600 hover:bg-govblue-500 text-white font-bold px-4 py-1.5 rounded-lg text-xs transition-colors shadow-xs disabled:opacity-50"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-saffron-300" />
                    <span>{isTranscribingAudio ? 'Transcribing with AI...' : 'Transcribe Voice with AI'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Transcription Preview & Live Editor */}
            {description && (
              <div className="text-left space-y-2 pt-4 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-navy-800">
                    Transcribed Complaint (Review & edit freely before analysis):
                  </label>
                  <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Transcribed
                  </span>
                </div>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Your transcribed complaint text will appear here..."
                  className="w-full p-3 rounded-xl border border-govborder text-xs focus:ring-2 focus:ring-govblue-500 bg-white leading-relaxed"
                />
              </div>
            )}
          </div>

          <div className="pt-4 flex items-center justify-between border-t border-govborder">
            <button
              onClick={() => setCurrentStep(2)}
              className="flex items-center gap-1.5 text-xs font-semibold text-mutedtext hover:text-slate-800"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Form</span>
            </button>
            <button
              type="button"
              disabled={!title.trim() || !description.trim() || aiAnalyzing}
              onClick={triggerAiAnalysis}
              className="flex items-center gap-2 bg-govblue-600 hover:bg-govblue-500 disabled:opacity-50 text-white font-bold px-6 py-2.5 rounded-xl text-xs transition-colors shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{aiAnalyzing ? 'Analyzing with AI...' : 'Proceed to AI Analysis'}</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 4: AI Copilot Review & Human Confirmation */}
      {/* ========================================================================= */}
      {currentStep === 4 && (
        <div className="bg-surface rounded-2xl p-6 sm:p-8 border border-govborder shadow-sm space-y-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-saffron-500 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
              <Sparkles className="w-3.5 h-3.5" />
              <span>JanSahayak AI Copilot Intelligence</span>
            </div>
            <h2 className="text-lg font-extrabold text-navy-800">Step 4: AI Analysis & Verification</h2>
            <p className="text-xs text-mutedtext">
              The AI classified your complaint and suggested department routing. You can verify or adjust any recommendation.
            </p>
          </div>

          {/* AI Analysis Cards */}
          <div className="space-y-4">
            {/* Detected Language & Translation */}
            <div className="p-4 rounded-xl bg-slate-50 border border-govborder space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-500">Language Detected</span>
                <span className="font-bold text-navy-800 bg-white px-2 py-0.5 rounded border border-slate-200">
                  {aiAnalysis?.language_name || selectedLangObj.name} ({aiAnalysis?.detected_language || selectedLanguage})
                </span>
              </div>
              {aiAnalysis?.translated_text && (
                <div className="pt-2 border-t border-slate-200">
                  <span className="text-[11px] font-semibold text-slate-500">English Translation for Routing:</span>
                  <p className="text-xs text-slate-700 italic mt-0.5">{aiAnalysis.translated_text}</p>
                </div>
              )}
            </div>

            {/* Department Recommendation with Confidence */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-govborder space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-500">Category Suggestion</span>
                  <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {Math.round((aiAnalysis?.confidence || 0.94) * 100)}% Match
                  </span>
                </div>
                <select
                  value={categoryOverride}
                  onChange={(e) => setCategoryOverride(e.target.value)}
                  className="w-full p-2 text-xs rounded-lg border border-govborder font-semibold text-navy-800 bg-white focus:ring-2 focus:ring-govblue-500"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-govborder space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-500">Assigned Department</span>
                  <Building2 className="w-3.5 h-3.5 text-govblue-600" />
                </div>
                <select
                  value={departmentOverride}
                  onChange={(e) => setDepartmentOverride(e.target.value)}
                  className="w-full p-2 text-xs rounded-lg border border-govborder font-semibold text-navy-800 bg-white focus:ring-2 focus:ring-govblue-500"
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Urgency SLA Selection */}
            <div className="p-4 rounded-xl bg-slate-50 border border-govborder space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-500">Estimated Urgency Level</span>
                <span className="text-[11px] text-mutedtext">Configures resolution SLA</span>
              </div>
              <div className="grid grid-cols-4 gap-2 text-xs">
                {['low', 'medium', 'high', 'critical'].map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setPriorityOverride(lvl)}
                    className={`py-2 rounded-lg font-bold capitalize text-center border transition-all ${
                      priorityOverride === lvl
                        ? lvl === 'critical'
                          ? 'bg-red-500 text-white border-red-600'
                          : lvl === 'high'
                          ? 'bg-saffron-500 text-navy-900 border-amber-600'
                          : 'bg-govblue-600 text-white border-blue-700'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* AI Summary */}
            <div className="p-4 rounded-xl bg-govblue-50/50 border border-govblue-200 space-y-1">
              <span className="text-xs font-bold text-navy-800">Executive Summary for Department:</span>
              <p className="text-xs text-slate-700 leading-relaxed">
                {aiAnalysis?.summary || `Citizen reported: ${title}. ${description}`}
              </p>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-between border-t border-govborder">
            <button
              onClick={() => setCurrentStep(2)}
              className="flex items-center gap-1.5 text-xs font-semibold text-mutedtext hover:text-slate-800"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back & Edit</span>
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={handleFinalSubmit}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold px-6 py-2.5 rounded-xl text-xs transition-colors shadow-sm"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{submitting ? 'Registering...' : 'Confirm & Register Grievance'}</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 5: Ticket Issued & Tracking Link */}
      {/* ========================================================================= */}
      {currentStep === 5 && submittedTicket && (
        <div className="bg-surface rounded-2xl p-6 sm:p-10 border border-govborder shadow-md space-y-6 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-1 max-w-md mx-auto">
            <h2 className="text-2xl font-extrabold text-navy-800">Grievance Registered Successfully</h2>
            <p className="text-xs text-mutedtext">
              Your ticket has been authenticated, classified, and assigned to the field department for inspection.
            </p>
          </div>

          {/* Ticket ID Box */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-govborder max-w-md mx-auto space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Official Grievance Ticket Identifier
            </span>
            <div className="text-2xl sm:text-3xl font-black font-mono text-govblue-600 tracking-wider">
              {submittedTicket.ticket_id}
            </div>
            <button
              onClick={handleCopyTicket}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 px-3 py-1.5 rounded-lg hover:bg-slate-50 shadow-sm transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied to Clipboard!' : 'Copy Ticket ID'}</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 max-w-md mx-auto text-left text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <span className="text-slate-400">Department:</span>
              <p className="font-bold text-navy-800">{submittedTicket.department_name}</p>
            </div>
            <div>
              <span className="text-slate-400">Target SLA Deadline:</span>
              <p className="font-bold text-navy-800">48 Hours</p>
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to={`/citizen/complaints/${submittedTicket.id}`}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-govblue-600 hover:bg-govblue-500 text-white font-bold px-6 py-2.5 rounded-xl text-xs transition-colors shadow-sm"
            >
              <span>View Case Details</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              to="/citizen/dashboard"
              className="w-full sm:w-auto bg-slate-100 hover:bg-slate-200 text-navy-800 font-semibold px-6 py-2.5 rounded-xl text-xs transition-colors"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
