import { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { 
  MessageCircle, 
  Phone, 
  Send, 
  ShieldCheck,
  MapPin,
  Clock,
  X,
  Bot
} from 'lucide-react';

interface Message {
  id: string;
  sender: 'user' | 'agent' | 'ai' | 'police';
  text: string;
  timestamp: number;
  type?: 'location' | 'text';
}

interface UnifiedChatProps {
  currentLocation: { lat: number; lon: number } | null;
  destination: { lat: number; lon: number } | null;
  currentSafetyScore?: number;
  nearbyHelp?: number;
}

export function UnifiedChat({ 
  currentLocation, 
  destination,
  currentSafetyScore = 75,
  nearbyHelp = 3
}: UnifiedChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [chatMode, setChatMode] = useState<'ai' | 'support'>('ai');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'ai',
      text: 'Hello! I\'m your AI safety assistant. How can I help you today?',
      timestamp: Date.now(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [agentStatus, setAgentStatus] = useState<'online' | 'away'>('online');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Switch chat mode
  const switchToSupport = () => {
    setChatMode('support');
    const welcomeMsg: Message = {
      id: Date.now().toString(),
      sender: 'agent',
      text: 'You\'ve been connected to SafeRoute Support. How can we help you?',
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, welcomeMsg]);
  };

  const switchToAI = () => {
    setChatMode('ai');
    const welcomeMsg: Message = {
      id: Date.now().toString(),
      sender: 'ai',
      text: 'Back to AI assistant. What would you like to know?',
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, welcomeMsg]);
  };

  // Quick questions for AI mode
  const quickQuestions = [
    'Best route to take?',
    'Is this area safe?',
    'Nearest police station?',
    'Contact Support',
  ];

  const handleQuickQuestion = (question: string) => {
    if (question === 'Contact Support') {
      switchToSupport();
      return;
    }

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: question,
      sender: 'user',
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMessage]);

    // Generate AI response
    setTimeout(() => {
      let response = '';
      
      if (question.includes('route')) {
        response = 'Based on current safety analysis, I recommend the highlighted route. It has good lighting, passes by 2 police stations, and has a safety score of 85%.';
      } else if (question.includes('safe')) {
        response = `The current area has a safety score of ${currentSafetyScore}%. ${
          currentSafetyScore >= 70
            ? 'This is considered safe with good infrastructure and nearby emergency services.'
            : 'Exercise caution. Consider using main roads and avoid isolated areas.'
        }`;
      } else if (question.includes('police')) {
        response = `There are ${nearbyHelp} police stations within 2km. The nearest one is 850m away on Main Road. Tap on the blue markers on the map to see details.`;
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        sender: 'ai',
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    }, 500);
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: inputMessage,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');

    // Generate response based on mode
    setTimeout(() => {
      const response = chatMode === 'ai' 
        ? getAIResponse(inputMessage)
        : getAgentResponse(inputMessage);

      const responseMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: chatMode === 'ai' ? 'ai' : 'agent',
        text: response,
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, responseMessage]);
    }, 800);
  };

  const getAIResponse = (userMsg: string): string => {
    const msg = userMsg.toLowerCase();
    
    if (msg.includes('route')) {
      return 'I\'ll help you find the safest route. The current selected route has excellent safety features.';
    } else if (msg.includes('safe')) {
      return `Your current area has a safety score of ${currentSafetyScore}%. ${
        currentSafetyScore >= 70 ? 'You\'re in a safe zone!' : 'Please stay alert and use main roads.'
      }`;
    } else if (msg.includes('police') || msg.includes('hospital')) {
      return `I can see ${nearbyHelp} emergency services nearby. Check the map for exact locations.`;
    } else if (msg.includes('support') || msg.includes('help')) {
      return 'Would you like me to connect you to live support? Type "yes" or click the Support button.';
    } else {
      return 'I\'m here to help with safety and navigation. What would you like to know?';
    }
  };

  const getAgentResponse = (userMsg: string): string => {
    const msg = userMsg.toLowerCase();
    
    if (msg.includes('help') || msg.includes('emergency')) {
      return 'I understand you need help. Can you describe your situation? Are you in immediate danger?';
    } else if (msg.includes('location')) {
      return 'I can see your current location. Please stay where you are if it\'s safe. Help is being dispatched.';
    } else if (msg.includes('police')) {
      return 'The nearest police station is about 850m from your location. I can call them for you if needed.';
    } else if (msg.includes('safe')) {
      return 'I\'m glad you\'re safe. Is there anything else I can help you with?';
    } else {
      return 'I\'m here to help. Please provide more details about your situation.';
    }
  };

  const handleCallSupport = () => {
    if (confirm('Call SafeRoute Emergency Support?')) {
      window.location.href = 'tel:+911234567890';
    }
  };

  const handleShareLocation = () => {
    if (!currentLocation) {
      alert('Location not available');
      return;
    }

    const locationMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: `📍 My Location: ${currentLocation.lat.toFixed(6)}, ${currentLocation.lon.toFixed(6)}`,
      timestamp: Date.now(),
      type: 'location',
    };

    setMessages(prev => [...prev, locationMsg]);

    setTimeout(() => {
      const response: Message = {
        id: (Date.now() + 1).toString(),
        sender: chatMode === 'ai' ? 'ai' : 'agent',
        text: 'Thank you for sharing your location. I can see you\'re monitored. Nearby emergency services are aware of your route.',
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, response]);
    }, 1000);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-[999] bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-2xl transform hover:scale-110 transition-all border-2 border-white"
      >
        <MessageCircle className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-[999] w-full max-w-sm">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col h-[600px] max-h-[80vh]">
        {/* Header */}
        <div className={`p-4 ${
          chatMode === 'ai' 
            ? 'bg-gradient-to-r from-blue-600 to-blue-700' 
            : 'bg-gradient-to-r from-green-600 to-green-700'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                {chatMode === 'ai' ? (
                  <Bot className="w-8 h-8 text-white" />
                ) : (
                  <>
                    <ShieldCheck className="w-8 h-8 text-white" />
                    <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 ${
                      chatMode === 'ai' ? 'border-blue-600' : 'border-green-600'
                    } ${agentStatus === 'online' ? 'bg-green-400' : 'bg-yellow-400'}`} />
                  </>
                )}
              </div>
              <div>
                <h3 className="font-bold text-white">
                  {chatMode === 'ai' ? 'AI Assistant' : 'Live Support'}
                </h3>
                <p className="text-xs text-white/80">
                  {chatMode === 'ai' 
                    ? 'Instant AI help' 
                    : agentStatus === 'online' ? 'Online • ~1 min response' : 'Away'}
                </p>
              </div>
            </div>
            <Button
              onClick={() => setIsOpen(false)}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Mode Switch */}
        <div className="bg-gray-50 border-b border-gray-200 p-2 flex gap-2">
          <button
            onClick={switchToAI}
            className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              chatMode === 'ai'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Bot className="w-4 h-4 inline mr-2" />
            AI Mode
          </button>
          <button
            onClick={switchToSupport}
            className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              chatMode === 'support'
                ? 'bg-green-600 text-white shadow-sm'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            <ShieldCheck className="w-4 h-4 inline mr-2" />
            Live Support
          </button>
        </div>

        {/* Quick Actions (Support mode only) */}
        {chatMode === 'support' && (
          <div className="bg-blue-50 border-b border-blue-200 p-3 flex gap-2">
            <Button
              onClick={handleCallSupport}
              size="sm"
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
            >
              <Phone className="w-4 h-4 mr-2" />
              Emergency Call
            </Button>
            <Button
              onClick={handleShareLocation}
              size="sm"
              variant="outline"
              className="flex-1 border-blue-300"
              disabled={!currentLocation}
            >
              <MapPin className="w-4 h-4 mr-2" />
              Share Location
            </Button>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                  message.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-br-none'
                    : message.sender === 'ai'
                    ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-bl-none'
                    : 'bg-white text-gray-900 border border-gray-200 rounded-bl-none'
                }`}
              >
                <p className="text-sm">{message.text}</p>
                <div className={`flex items-center gap-1 mt-1 ${
                  message.sender === 'user' || message.sender === 'ai' ? 'text-white/70' : 'text-gray-500'
                }`}>
                  <Clock className="w-3 h-3" />
                  <span className="text-xs">
                    {new Date(message.timestamp).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Questions (AI mode only) */}
        {chatMode === 'ai' && (
          <div className="border-t border-gray-200 p-3 bg-white">
            <div className="flex flex-wrap gap-2 mb-2">
              {quickQuestions.map((question) => (
                <button
                  key={question}
                  onClick={() => handleQuickQuestion(question)}
                  className={`px-3 py-1.5 text-xs rounded-full transition-colors ${
                    question === 'Contact Support'
                      ? 'bg-green-100 text-green-700 hover:bg-green-200 font-medium'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="border-t border-gray-200 p-3 bg-white">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type your message..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <Button
              onClick={handleSendMessage}
              className={`${
                chatMode === 'ai' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'
              } rounded-full w-10 h-10 p-0 flex items-center justify-center`}
              disabled={!inputMessage.trim()}
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            Emergency? Press the red SOS button or call 100
          </p>
        </div>
      </div>
    </div>
  );
}
