import React, { useState, useRef, useEffect } from "react";

function ChatWidget() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const hasGreeted = useRef(false);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send initial greeting on mount
  useEffect(() => {
    if (hasGreeted.current) return;
    hasGreeted.current = true;

    const greet = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [{ role: "user", content: "hi" }],
          }),
        });
        const data = await response.json();
        if (data.message) {
          setMessages([{ role: "assistant", content: data.message }]);
        }
      } catch (error) {
        console.error("Chat greeting error:", error);
        setMessages([
          {
            role: "assistant",
            content:
              "hey! what kind of project do you want to work on together?",
          },
        ]);
      }
      setLoading(false);
      inputRef.current?.focus();
    };

    greet();
  }, []);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading || submitted) return;

    const userMessage = { role: "user", content: trimmed };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      // Build API messages from conversation history
      // Skip the first assistant message greeting and start fresh
      const apiMessages = [];
      for (const msg of updatedMessages) {
        apiMessages.push({ role: msg.role, content: msg.content });
      }

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages }),
      });

      const data = await response.json();
      if (data.message) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.message },
        ]);
      }
      if (data.submitted) {
        setSubmitted(true);
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "sorry, something went wrong. please try again or email dariondanjou@gmail.com directly.",
        },
      ]);
    }

    setLoading(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="chat-widget">
      <div className="chat-messages">
        {messages.map((msg, i) => (
          <div key={i} className={`chat-message chat-message-${msg.role}`}>
            <div className="chat-bubble">{msg.content}</div>
          </div>
        ))}
        {loading && (
          <div className="chat-message chat-message-assistant">
            <div className="chat-bubble chat-typing">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-container">
        <input
          ref={inputRef}
          type="text"
          className="chat-input"
          placeholder={submitted ? "inquiry submitted!" : "type a message..."}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading || submitted}
        />
        <button
          className="chat-send"
          onClick={sendMessage}
          disabled={loading || submitted || !input.trim()}
        >
          &#x2192;
        </button>
      </div>
    </div>
  );
}

export default ChatWidget;
