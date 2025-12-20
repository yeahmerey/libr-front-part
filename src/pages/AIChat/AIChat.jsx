// src/pages/AIChat/AIChat.jsx
import { useState, useRef, useEffect } from "react";
import "./AIChat.css";

const CHAT_HISTORY_KEY = "ai_chat_history";

export default function AIChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const chatEndRef = useRef(null);

  // === Восстановление истории из localStorage ===
  useEffect(() => {
    const saved = localStorage.getItem(CHAT_HISTORY_KEY);
    if (saved) {
      try {
        setMessages(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse chat history ,", e);
      }
    }
  }, []);

  // === Сохранение в localStorage при изменении messages ===
  useEffect(() => {
    localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(messages));
  }, [messages]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatText = (text) => {
    let formatted = text
      .replace(/^### (.*$)/gim, '<h3 class="msg-h3">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="msg-h2">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="msg-h1">$1</h1>')
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/^-\s+(.*$)/gim, "<li>$1</li>") // поддержка - вместо *
      .replace(/(<li>.*<\/li>)/gs, "<ul>$1</ul>")
      .replace(/^\d+\.\s+(.*$)/gim, "<li>$1</li>")
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      .replace(/\n/g, "<br/>");
    return formatted;
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      // 🔥 ИСПРАВЛЕНО: правильная модель + без пробелов!
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${
          import.meta.env.VITE_GEMINI_API_KEY
        }`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: messages
              .map((msg) => ({
                role: msg.sender === "user" ? "user" : "model",
                parts: [{ text: msg.text }],
              }))
              .concat([{ role: "user", parts: [{ text: input }] }]),
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || "API request failed");
      }

      const data = await response.json();
      const reply =
        data?.candidates?.[0]?.content?.parts?.[0]?.text ||
        "Sorry, I couldn't generate a response.";

      const geminiMessage = { sender: "gemini", text: reply };
      setMessages((prev) => [...prev, geminiMessage]);
    } catch (err) {
      console.error("Error calling Gemini API:", err);
      const errorMessage = {
        sender: "gemini",
        text: `⚠️ ${err.message || "Failed to reach AI."}`,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    if (window.confirm("Clear all messages?")) {
      setMessages([]);
      localStorage.removeItem(CHAT_HISTORY_KEY);
    }
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0 20px",
        }}
      >
        <h3 className="gemini-heading">Gemini Chat Bot</h3>
        <button
          onClick={clearChat}
          style={{
            background: "none",
            border: "1px solid #ccc",
            borderRadius: "4px",
            padding: "4px 8px",
            cursor: "pointer",
          }}
        >
          Clear Chat
        </button>
      </div>
      <div className="chat-container">
        <div className="chat-box">
          {messages.length === 0 ? (
            <p style={{ textAlign: "center", color: "#888" }}>
              Start a conversation!
            </p>
          ) : (
            messages.map((msg, idx) => (
              <div key={idx} className={`chat-message ${msg.sender}`}>
                <div
                  className="message-content"
                  dangerouslySetInnerHTML={{ __html: formatText(msg.text) }}
                />
                <span
                  className="copy-icon"
                  onClick={() => navigator.clipboard.writeText(msg.text)}
                  title="Copy to clipboard"
                >
                  📋
                </span>
              </div>
            ))
          )}
          <div ref={chatEndRef}>{loading && <p>Thinking...</p>}</div>
        </div>

        <form className="input-form" onSubmit={sendMessage}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            disabled={loading}
          />
          <button type="submit" disabled={loading}>
            {loading ? "..." : "Send"}
          </button>
        </form>
      </div>
    </div>
  );
}
