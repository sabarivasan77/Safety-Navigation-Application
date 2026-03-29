import { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { 
  MessageCircle, 
  Phone, 
  Send, 
  ShieldCheck,
  MapPin,
  Clock,
  X
} from 'lucide-react';

interface Message {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  timestamp: number;
}

interface SupportCenterProps {
  currentLocation: { lat: number; lon: number } | null;
  destination: { lat: number; lon: number } | null;
  onClose?: () => void;
}

export function SupportCenter({ currentLocation, destination, onClose }: SupportCenterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'agent',
      text: 'Hello! This is SafeRoute Support. How can we help you today?',
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

    // Simulate agent response
    setTimeout(() => {
      const agentMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'agent',
        text: getAgentResponse(inputMessage),
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, agentMessage]);
    }, 1000);
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
    // In a real app, this would connect to actual support
    if (confirm('Call SafeRoute Support Center?')) {
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
    };

    setMessages(prev => [...prev, locationMsg]);

    setTimeout(() => {
      const response: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'agent',
        text: 'Thank you for sharing your location. I can see you\'re in a safe area. Nearby police and hospitals are monitoring your route.',
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, response]);
    }, 1000);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-4 z-[999] bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-2xl transform hover:scale-110 transition-all"
      >
        <MessageCircle className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-[999] w-full max-w-sm">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col h-[600px] max-h-[80vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <ShieldCheck className="w-8 h-8 text-white" />
                <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-blue-600 ${
                  agentStatus === 'online' ? 'bg-green-400' : 'bg-yellow-400'
                }`} />
              </div>
              <div>
                <h3 className="font-bold text-white">SafeRoute Support</h3>
                <p className="text-xs text-blue-100">
                  {agentStatus === 'online' ? 'Online • Response time ~1 min' : 'Away'}
                </p>
              </div>
            </div>
            <Button
              onClick={() => setIsOpen(false)}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-blue-500"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-blue-50 border-b border-blue-200 p-3 flex gap-2">
          <Button
            onClick={handleCallSupport}
            size="sm"
            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
          >
            <Phone className="w-4 h-4 mr-2" />
            Call Support
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
                    : 'bg-white text-gray-900 border border-gray-200 rounded-bl-none'
                }`}
              >
                <p className="text-sm">{message.text}</p>
                <div className={`flex items-center gap-1 mt-1 ${
                  message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
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
              className="bg-blue-600 hover:bg-blue-700 rounded-full w-10 h-10 p-0 flex items-center justify-center"
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
