import { useState } from 'react';
import { MessageCircle, Send, X } from 'lucide-react';
import { Button } from './ui/button';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

interface ChatAssistantProps {
  currentSafetyScore?: number;
  nearbyHelp?: number;
}

export function ChatAssistant({ currentSafetyScore = 75, nearbyHelp = 3 }: ChatAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I\'m your safety assistant. How can I help you today?',
      sender: 'assistant',
      timestamp: new Date(),
    },
  ]);

  const quickQuestions = [
    'Best route to take?',
    'Is this area safe?',
    'Nearest police station?',
    'Show safe zones',
  ];

  const handleQuickQuestion = (question: string) => {
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: question,
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);

    // Generate response based on question
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
      } else if (question.includes('safe zones')) {
        response = 'Green zones on the map indicate high safety areas with good lighting and emergency services. Yellow zones need moderate caution, and red zones should be avoided especially at night.';
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        sender: 'assistant',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    }, 500);
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-2xl bg-blue-600 hover:bg-blue-700 z-50 border-2 border-white"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </Button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 w-[calc(100vw-3rem)] max-w-96 h-[32rem] bg-white rounded-lg shadow-2xl z-50 flex flex-col border border-gray-200">
          <div className="p-4 bg-blue-600 text-white rounded-t-lg flex-shrink-0">
            <h3 className="font-semibold">Safety Assistant</h3>
            <p className="text-xs text-blue-100">Ask me anything about your safety</p>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.sender === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                  <p
                    className={`text-xs mt-1 ${
                      message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                    }`}
                  >
                    {message.timestamp.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-gray-200 space-y-2 flex-shrink-0">
            <div className="flex flex-wrap gap-2">
              {quickQuestions.map((question) => (
                <button
                  key={question}
                  onClick={() => handleQuickQuestion(question)}
                  className="px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700 transition-colors"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}