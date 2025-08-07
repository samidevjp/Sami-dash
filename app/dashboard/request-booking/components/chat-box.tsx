import React, { useState, useRef, useEffect } from 'react';
import moment from 'moment';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
interface Message {
  id: number;
  sender: 'customer' | 'staff';
  text: string;
  time: string;
  date: string;
}
const ChatBox = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: 'customer',
      text: 'I would like to book a table for 4 at 19:15.',
      time: '15:30',
      date: moment().subtract(2, 'days').format('YYYY-MM-DD')
    },
    {
      id: 2,
      sender: 'staff',
      text: 'Thank you for your reservation request. We are at capacity at 19:15. Would 18:00 work for you?',
      time: '18:45',
      date: moment().subtract(1, 'days').format('YYYY-MM-DD')
    },
    {
      id: 3,
      sender: 'customer',
      text: 'Can I book for tomorrow instead?',
      time: '09:15',
      date: moment().format('YYYY-MM-DD')
    },
    {
      id: 4,
      sender: 'staff',
      text: 'Yes, we have availability tomorrow at 18:00. Would you like to proceed?',
      time: '09:17',
      date: moment().format('YYYY-MM-DD')
    },
    {
      id: 5,
      sender: 'customer',
      text: 'Yes, please proceed with the booking for tomorrow at 18:00.',
      time: '09:20',
      date: moment().format('YYYY-MM-DD')
    },
    {
      id: 6,
      sender: 'staff',
      text: 'Your booking for tomorrow at 18:00 is confirmed. Thank you!',
      time: '09:22',
      date: moment().format('YYYY-MM-DD')
    },
    {
      id: 7,
      sender: 'customer',
      text: 'Great, thank you!',
      time: '09:25',
      date: moment().format('YYYY-MM-DD')
    },
    {
      id: 8,
      sender: 'staff',
      text: 'You are welcome!',
      time: '09:27',
      date: moment().format('YYYY-MM-DD')
    },
    {
      id: 9,
      sender: 'customer',
      text: 'Can I change the booking to 19:00?',
      time: '10:00',
      date: moment().format('YYYY-MM-DD')
    },
    {
      id: 10,
      sender: 'staff',
      text: 'Let me check the availability for 19:00.',
      time: '10:05',
      date: moment().format('YYYY-MM-DD')
    },
    {
      id: 11,
      sender: 'staff',
      text: 'We have availability at 19:00. Shall I update your booking?',
      time: '10:10',
      date: moment().format('YYYY-MM-DD')
    },
    {
      id: 12,
      sender: 'customer',
      text: 'Yes, please update it to 19:00.',
      time: '10:15',
      date: moment().format('YYYY-MM-DD')
    },
    {
      id: 13,
      sender: 'staff',
      text: 'Your booking has been updated to 19:00. Thank you!',
      time: '10:20',
      date: moment().format('YYYY-MM-DD')
    },
    {
      id: 14,
      sender: 'customer',
      text: 'Thank you very much!',
      time: '10:25',
      date: moment().format('YYYY-MM-DD')
    },
    {
      id: 15,
      sender: 'staff',
      text: 'You are welcome!',
      time: '10:30',
      date: moment().format('YYYY-MM-DD')
    },
    {
      id: 16,
      sender: 'customer',
      text: 'Can I add one more person to the booking?',
      time: '11:00',
      date: moment().format('YYYY-MM-DD')
    },
    {
      id: 17,
      sender: 'staff',
      text: 'Sure, I have updated your booking to 5 people.',
      time: '11:05',
      date: moment().format('YYYY-MM-DD')
    },
    {
      id: 18,
      sender: 'customer',
      text: 'Thank you!',
      time: '11:10',
      date: moment().format('YYYY-MM-DD')
    },
    {
      id: 19,
      sender: 'staff',
      text: 'You are welcome!',
      time: '11:15',
      date: moment().format('YYYY-MM-DD')
    },
    {
      id: 20,
      sender: 'customer',
      text: 'Looking forward to it!',
      time: '11:20',
      date: moment().format('YYYY-MM-DD')
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [viewportHeight, setViewportHeight] = useState(window.innerHeight);
  const [inputHeight, setInputHeight] = useState(48);
  const minHeight = 48;
  const maxHeight = 300;
  useEffect(() => {
    const updateHeight = () => setViewportHeight(window.innerHeight);
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [messages]);
  const formatDate = (date: string) => {
    const today = moment().format('YYYY-MM-DD');
    const yesterday = moment().subtract(1, 'days').format('YYYY-MM-DD');
    if (date === today) return 'Today';
    if (date === yesterday) return 'Yesterday';
    return moment(date).format('ddd, DD MMM YYYY');
  };
  const groupMessagesByDate = () => {
    return messages.reduce(
      (acc, msg) => {
        const formattedDate = formatDate(msg.date);
        if (!acc[formattedDate]) {
          acc[formattedDate] = [];
        }
        acc[formattedDate].push(msg);
        return acc;
      },
      {} as Record<string, Message[]>
    );
  };
  const groupedMessages = groupMessagesByDate();
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const newHeight = Math.min(
        Math.max(textareaRef.current.scrollHeight, minHeight),
        maxHeight
      );
      setInputHeight(newHeight);
      textareaRef.current.style.height = `${newHeight}px`;
    }
  }, [newMessage]);
  const handleSendMessage = () => {
    if (newMessage.trim() === '') return;
    const newMsg = {
      id: messages.length + 1,
      sender: 'staff' as const,
      text: newMessage,
      time: moment().format('HH:mm'),
      date: moment().format('YYYY-MM-DD')
    };
    setMessages([...messages, newMsg]);
    setNewMessage('');
    setInputHeight(48);
  };
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="relative mx-auto flex h-full w-full max-w-lg flex-col rounded-lg">
      <div
        className="flex flex-col space-y-2 overflow-y-auto p-2"
        style={{
          height: `calc(${viewportHeight}px - ${inputHeight + 250}px)`,
          marginBottom: `${inputHeight + 32}px`
        }}
      >
        {Object.entries(groupedMessages).map(([dateLabel, msgs]) => (
          <div key={dateLabel}>
            <div className="my-2 text-center text-xs text-muted-foreground">
              {dateLabel}
            </div>
            {msgs.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.sender === 'staff' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`mb-1 max-w-xs break-words rounded-lg p-2 ${
                    msg.sender === 'staff'
                      ? 'ml-8 bg-primary text-primary-foreground'
                      : 'mr-8 bg-secondary'
                  }`}
                >
                  <p>{msg.text}</p>
                  <span
                    className={`mt-1 block text-xs ${
                      msg.sender === 'staff'
                        ? 'text-primary-foreground'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {msg.time}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ))}
        <div ref={scrollRef} />
      </div>
      <div
        className="absolute bottom-0 left-0 w-full border-t px-4 pt-4"
        style={{ height: `${inputHeight + 32}px` }}
      >
        <div className="flex items-end gap-2">
          <Textarea
            ref={textareaRef}
            placeholder="Shift + Enter to send, Enter to add a new line"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            className="w-full resize-none pr-14"
            style={{ height: `${inputHeight}px` }}
          />
          <Button onClick={handleSendMessage}>Send</Button>
        </div>
      </div>
    </div>
  );
};
export default ChatBox;
