import { useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";
import {
  Bot,
  Clock,
  Globe,
  Image as ImageIcon,
  MapPin,
  MessageCircle,
  Mic,
  Phone,
  Send,
  ShieldCheck,
  Video,
  VideoOff,
  X,
} from "lucide-react";

type ChatMode = "ai" | "support";
type Sender = "user" | "agent" | "ai";
type MessageType = "text" | "location" | "photo" | "voice" | "system";
type LanguageCode = "en" | "ta" | "hi" | "te" | "ml" | "kn";

interface Message {
  id: string;
  sender: Sender;
  text: string;
  timestamp: number;
  type: MessageType;
  mediaUrl?: string;
  fileName?: string;
  durationLabel?: string;
}

interface UnifiedChatProps {
  currentLocation: { lat: number; lon: number } | null;
  destination: { lat: number; lon: number } | null;
  currentSafetyScore?: number;
  nearbyHelp?: number;
}

const languages: Array<{ code: LanguageCode; label: string }> = [
  { code: "en", label: "English" },
  { code: "ta", label: "Tamil" },
  { code: "hi", label: "Hindi" },
  { code: "te", label: "Telugu" },
  { code: "ml", label: "Malayalam" },
  { code: "kn", label: "Kannada" },
];

const copy: Record<
  LanguageCode,
  { hello: string; support: string; back: string; placeholder: string; hint: string }
> = {
  en: {
    hello: "Hello! I'm your AI safety assistant.",
    support: "You've been connected to SafeRoute Support.",
    back: "Back to AI assistant.",
    placeholder: "Type your message...",
    hint: "Emergency? Press the red SOS button or call 100",
  },
  ta: {
    hello: "வணக்கம்! நான் உங்கள் பாதுகாப்பு உதவியாளர்.",
    support: "நீங்கள் SafeRoute ஆதரவுடன் இணைக்கப்பட்டுள்ளீர்கள்.",
    back: "மீண்டும் AI உதவியாளர் நிலைக்கு வந்துவிட்டீர்கள்.",
    placeholder: "உங்கள் செய்தியை உள்ளிடுங்கள்...",
    hint: "அவசரம்? சிவப்பு SOS அல்லது 100 அழைக்கவும்",
  },
  hi: {
    hello: "नमस्ते! मैं आपका सुरक्षा सहायक हूं।",
    support: "आप SafeRoute सपोर्ट से जुड़ चुके हैं।",
    back: "आप फिर से AI सहायक मोड में हैं।",
    placeholder: "अपना संदेश लिखें...",
    hint: "आपात स्थिति? SOS दबाएँ या 100 पर कॉल करें",
  },
  te: {
    hello: "నమస్తే! నేను మీ భద్రత సహాయకుడిని.",
    support: "మీరు SafeRoute సపోర్ట్‌తో కనెక్ట్ అయ్యారు.",
    back: "మళ్లీ AI సహాయక మోడ్‌కు వచ్చారు.",
    placeholder: "మీ సందేశాన్ని టైప్ చేయండి...",
    hint: "అత్యవసరం? SOS నొక్కండి లేదా 100 కి కాల్ చేయండి",
  },
  ml: {
    hello: "നമസ്കാരം! ഞാൻ നിങ്ങളുടെ സുരക്ഷാ സഹായി.",
    support: "നിങ്ങൾ SafeRoute സപ്പോർട്ടുമായി ബന്ധപ്പെട്ടു.",
    back: "വീണ്ടും AI സഹായി മോഡിലേക്ക് മടങ്ങി.",
    placeholder: "സന്ദേശം ടൈപ്പ് ചെയ്യൂ...",
    hint: "അടിയന്തിരാവസ്ഥ? SOS അമർത്തുക അല്ലെങ്കിൽ 100 വിളിക്കുക",
  },
  kn: {
    hello: "ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ ಸುರಕ್ಷತಾ ಸಹಾಯಕ.",
    support: "ನೀವು SafeRoute ಸಹಾಯ ಕೇಂದ್ರಕ್ಕೆ ಸಂಪರ್ಕಗೊಂಡಿದ್ದೀರಿ.",
    back: "ಮತ್ತೆ AI ಸಹಾಯಕ ಮೋಡ್‌ಗೆ ಮರಳಿದ್ದೀರಿ.",
    placeholder: "ನಿಮ್ಮ ಸಂದೇಶವನ್ನು ಟೈಪ್ ಮಾಡಿ...",
    hint: "ತುರ್ತು ಪರಿಸ್ಥಿತಿ? SOS ಒತ್ತಿರಿ ಅಥವಾ 100 ಕರೆ ಮಾಡಿ",
  },
};

export function UnifiedChat({
  currentLocation,
  destination,
  currentSafetyScore = 75,
  nearbyHelp = 3,
}: UnifiedChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [chatMode, setChatMode] = useState<ChatMode>("ai");
  const [language, setLanguage] = useState<LanguageCode>("en");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "ai",
      text: copy.en.hello,
      timestamp: Date.now(),
      type: "text",
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [videoOpen, setVideoOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const currentCopy = copy[language];

  const addMessage = (message: Message) => {
    setMessages((prev) => [...prev, message]);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!isRecording) return;
    const id = window.setInterval(() => {
      setRecordingSeconds((prev) => prev + 1);
    }, 1000);
    return () => window.clearInterval(id);
  }, [isRecording]);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const respond = (text: string) => {
    window.setTimeout(() => {
      addMessage({
        id: `${Date.now()}-reply`,
        sender: chatMode === "ai" ? "ai" : "agent",
        text,
        timestamp: Date.now(),
        type: "text",
      });
    }, 600);
  };

  const switchMode = (mode: ChatMode) => {
    setChatMode(mode);
    addMessage({
      id: `${Date.now()}-${mode}`,
      sender: mode === "ai" ? "ai" : "agent",
      text: mode === "ai" ? currentCopy.back : currentCopy.support,
      timestamp: Date.now(),
      type: "system",
    });
  };

  const handleLanguageChange = (next: LanguageCode) => {
    setLanguage(next);
    addMessage({
      id: `${Date.now()}-lang`,
      sender: chatMode === "ai" ? "ai" : "agent",
      text: `${languages.find((item) => item.code === next)?.label} enabled.`,
      timestamp: Date.now(),
      type: "system",
    });
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;
    const text = inputMessage;
    addMessage({
      id: `${Date.now()}-user`,
      sender: "user",
      text,
      timestamp: Date.now(),
      type: "text",
    });
    setInputMessage("");

    const lower = text.toLowerCase();
    if (lower.includes("route")) respond("I recommend the highlighted route because it has better lighting and emergency access.");
    else if (lower.includes("safe")) respond(`Current safety score is ${currentSafetyScore}%. ${currentSafetyScore >= 70 ? "This area looks relatively safe." : "Please stay alert and use main roads."}`);
    else if (lower.includes("police") || lower.includes("hospital")) respond(`I can see ${nearbyHelp} nearby emergency services from your route.`);
    else if (lower.includes("photo")) respond("You can send photos using the photo button in support mode.");
    else if (lower.includes("voice")) respond("You can send a voice note using the microphone button.");
    else if (lower.includes("video")) respond("You can start a live video support call from support mode.");
    else respond(chatMode === "ai" ? "I can help with route safety, nearby services, and multilingual guidance." : "We are here with you. Keep sending updates and use SOS for immediate danger.");
  };

  const handleShareLocation = () => {
    if (!currentLocation) {
      alert("Location not available");
      return;
    }
    addMessage({
      id: `${Date.now()}-location`,
      sender: "user",
      text: `Location: ${currentLocation.lat.toFixed(6)}, ${currentLocation.lon.toFixed(6)}`,
      timestamp: Date.now(),
      type: "location",
    });
    respond("Location shared. Support can now guide you faster.");
  };

  const handlePhotoSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    addMessage({
      id: `${Date.now()}-photo`,
      sender: "user",
      text: "Photo sent.",
      timestamp: Date.now(),
      type: "photo",
      mediaUrl: URL.createObjectURL(file),
      fileName: file.name,
    });
    respond("Photo received. Our team can review the scene now.");
    event.target.value = "";
  };

  const toggleVoiceRecording = async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      alert("Voice recording is not supported.");
      return;
    }
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    streamRef.current = stream;
    recordedChunksRef.current = [];
    setRecordingSeconds(0);
    const recorder = new MediaRecorder(stream);
    mediaRecorderRef.current = recorder;
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) recordedChunksRef.current.push(event.data);
    };
    recorder.onstop = () => {
      const blob = new Blob(recordedChunksRef.current, { type: "audio/webm" });
      addMessage({
        id: `${Date.now()}-voice`,
        sender: "user",
        text: "Voice note sent.",
        timestamp: Date.now(),
        type: "voice",
        mediaUrl: URL.createObjectURL(blob),
        durationLabel: formatDuration(recordingSeconds),
      });
      respond("Voice note received. We are listening now.");
      stream.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      setRecordingSeconds(0);
    };
    recorder.start();
    setIsRecording(true);
  };

  const toggleVideoCall = async () => {
    if (videoOpen) {
      setVideoOpen(false);
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      alert("Video calling is not supported.");
      return;
    }
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    streamRef.current = stream;
    setVideoOpen(true);
    window.setTimeout(() => {
      if (videoRef.current) videoRef.current.srcObject = stream;
    }, 0);
    addMessage({
      id: `${Date.now()}-video`,
      sender: "agent",
      text: "Live video support started.",
      timestamp: Date.now(),
      type: "system",
    });
  };

  const renderMessage = (message: Message) => {
    if (message.type === "photo" && message.mediaUrl) {
      return (
        <div className="space-y-2">
          <p className="text-sm">{message.text}</p>
          <img src={message.mediaUrl} alt={message.fileName ?? "Shared photo"} className="max-h-44 w-full rounded-xl object-cover" />
        </div>
      );
    }
    if (message.type === "voice" && message.mediaUrl) {
      return (
        <div className="space-y-2">
          <p className="text-sm">{message.text}</p>
          <audio controls className="w-full">
            <source src={message.mediaUrl} type="audio/webm" />
          </audio>
          {message.durationLabel && <p className="text-xs opacity-80">Duration {message.durationLabel}</p>}
        </div>
      );
    }
    return <p className="text-sm">{message.text}</p>;
  };

  if (!isOpen) {
    return (
      <button onClick={() => setIsOpen(true)} className="fixed bottom-6 right-6 z-[999] rounded-full border-2 border-white bg-blue-600 p-4 text-white shadow-2xl transition-all hover:scale-110 hover:bg-blue-700">
        <MessageCircle className="h-6 w-6" />
      </button>
    );
  }

  return (
    <>
      <div className="fixed bottom-4 right-4 z-[999] w-full max-w-sm">
        <div className="flex h-[660px] max-h-[84vh] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
          <div className={`${chatMode === "ai" ? "bg-gradient-to-r from-blue-600 to-blue-700" : "bg-gradient-to-r from-green-600 to-green-700"} p-4`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {chatMode === "ai" ? <Bot className="h-8 w-8 text-white" /> : <ShieldCheck className="h-8 w-8 text-white" />}
                <div>
                  <h3 className="font-bold text-white">{chatMode === "ai" ? "AI Assistant" : "Live Support"}</h3>
                  <p className="text-xs text-white/80">{chatMode === "ai" ? "Multilingual help" : "Chat, photo, voice note, video"}</p>
                </div>
              </div>
              <Button onClick={() => setIsOpen(false)} variant="ghost" size="sm" className="text-white hover:bg-white/20">
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <div className="border-b border-gray-200 bg-gray-50 p-2">
            <div className="mb-2 flex gap-2">
              <button onClick={() => switchMode("ai")} className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium ${chatMode === "ai" ? "bg-blue-600 text-white" : "bg-white text-gray-700"}`}>AI Mode</button>
              <button onClick={() => switchMode("support")} className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium ${chatMode === "support" ? "bg-green-600 text-white" : "bg-white text-gray-700"}`}>Live Support</button>
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-white px-3 py-2">
              <Globe className="h-4 w-4 text-slate-500" />
              <select value={language} onChange={(e) => handleLanguageChange(e.target.value as LanguageCode)} className="w-full bg-transparent text-sm outline-none">
                {languages.map((item) => <option key={item.code} value={item.code}>{item.label}</option>)}
              </select>
            </div>
          </div>

          {chatMode === "support" && (
            <div className="border-b border-blue-200 bg-blue-50 p-3">
              <div className="grid grid-cols-2 gap-2">
                <Button onClick={() => (window.location.href = "tel:+911234567890")} size="sm" className="bg-red-600 hover:bg-red-700"><Phone className="mr-2 h-4 w-4" />Call</Button>
                <Button onClick={handleShareLocation} size="sm" variant="outline" disabled={!currentLocation}><MapPin className="mr-2 h-4 w-4" />Location</Button>
                <Button onClick={() => fileInputRef.current?.click()} size="sm" variant="outline"><ImageIcon className="mr-2 h-4 w-4" />Photo</Button>
                <Button onClick={toggleVoiceRecording} size="sm" variant="outline" className={isRecording ? "bg-red-100 text-red-700" : ""}><Mic className="mr-2 h-4 w-4" />{isRecording ? formatDuration(recordingSeconds) : "Voice"}</Button>
              </div>
              <Button onClick={toggleVideoCall} size="sm" className="mt-2 w-full bg-green-600 hover:bg-green-700">
                {videoOpen ? <><VideoOff className="mr-2 h-4 w-4" />End Live Video</> : <><Video className="mr-2 h-4 w-4" />Start Live Video Call</>}
              </Button>
            </div>
          )}

          <div className="flex-1 space-y-3 overflow-y-auto bg-gray-50 p-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[84%] rounded-2xl px-4 py-3 ${message.sender === "user" ? "rounded-br-none bg-blue-600 text-white" : message.sender === "ai" ? "rounded-bl-none bg-gradient-to-r from-cyan-600 to-blue-700 text-white" : "rounded-bl-none border border-gray-200 bg-white text-gray-900"}`}>
                  {renderMessage(message)}
                  <div className={`mt-1 flex items-center gap-1 ${message.sender === "user" || message.sender === "ai" ? "text-white/70" : "text-gray-500"}`}>
                    <Clock className="h-3 w-3" />
                    <span className="text-xs">{new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-gray-200 bg-white p-3">
            <div className="flex gap-2">
              <input value={inputMessage} onChange={(e) => setInputMessage(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSendMessage()} placeholder={currentCopy.placeholder} className="flex-1 rounded-full border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <Button onClick={handleSendMessage} disabled={!inputMessage.trim()} className={`h-10 w-10 rounded-full p-0 ${chatMode === "ai" ? "bg-blue-600 hover:bg-blue-700" : "bg-green-600 hover:bg-green-700"}`}>
                <Send className="h-5 w-5" />
              </Button>
            </div>
            <p className="mt-2 text-center text-xs text-gray-500">{currentCopy.hint}</p>
          </div>
        </div>
      </div>

      {videoOpen && (
        <div className="fixed inset-0 z-[1200] bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="mx-auto flex h-full max-h-[720px] w-full max-w-4xl flex-col overflow-hidden rounded-3xl bg-slate-900 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4 text-white">
              <div>
                <h3 className="text-lg font-semibold">Live Safety Video Support</h3>
                <p className="text-sm text-white/70">Destination: {destination ? `${destination.lat.toFixed(4)}, ${destination.lon.toFixed(4)}` : "Not selected"}</p>
              </div>
              <Button onClick={toggleVideoCall} variant="ghost" className="text-white hover:bg-white/10"><X className="h-5 w-5" /></Button>
            </div>
            <div className="grid flex-1 gap-4 p-4 md:grid-cols-[1.2fr_0.8fr]">
              <div className="overflow-hidden rounded-2xl bg-black">
                <video ref={videoRef} autoPlay muted playsInline className="h-full w-full object-cover" />
              </div>
              <div className="space-y-4">
                <div className="rounded-2xl bg-gradient-to-br from-green-600 to-emerald-800 p-6 text-white">
                  <p className="text-lg font-semibold">Support agent connected</p>
                  <p className="mt-2 text-sm text-white/80">Keep the camera steady and continue chatting in your chosen language.</p>
                </div>
                <div className="rounded-2xl bg-white p-4 text-sm text-slate-700">
                  <p>Language: {languages.find((item) => item.code === language)?.label}</p>
                  <p className="mt-2">Current location: {currentLocation ? `${currentLocation.lat.toFixed(4)}, ${currentLocation.lon.toFixed(4)}` : "Unavailable"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoSelected} />
    </>
  );
}
