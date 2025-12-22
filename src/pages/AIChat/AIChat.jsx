// src/pages/AIChat/AIChat.jsx
import { useState, useEffect, useRef } from "react";
import { aiService } from "../../services/aiService";
import "./AIChat.css";

export default function AIChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  // Загружаем историю с бэкенда при монтировании
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const history = await aiService.getHistory();
        setMessages(history); // [{ sender: "user", text: "..." }, ...]
      } catch (err) {
        console.error("Failed to load chat history:", err);
      }
    };
    loadHistory();
  }, []);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatText = (text) => {
    // твой существующий код без изменений
    let formatted = text
      .replace(/^### (.*$)/gim, '<h3 class="msg-h3">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="msg-h2">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="msg-h1">$1</h1>')
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/^-\s+(.*$)/gim, "<li>$1</li>")
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
      const { reply } = await aiService.sendMessage(input);
      const aiMessage = { sender: "ai", text: reply };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      console.error("AI chat error:", err);
      const errorMessage = {
        sender: "ai",
        text: `⚠️ ${err.message || "Failed to get response."}`,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = async () => {
    if (window.confirm("Clear chat history from server?")) {
      try {
        await aiService.clearHistory();
        setMessages([]);
      } catch (err) {
        alert("Failed to clear history", err);
      }
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
          style={
            {
              /* твой стиль */
            }
          }
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
