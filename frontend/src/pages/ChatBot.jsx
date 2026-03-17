import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Send,
  Paperclip,
  MessageSquare,
  X,
  FileText,
  Image,
  File,
  Plus,
  Sparkles,
  Zap,
  Brain,
  ChevronLeft,
  Trash2,
} from "lucide-react";
import { GiMoonOrbit } from "react-icons/gi";

const API_BASE_URL = "http://localhost:8000";

/* ─── Typing Animation ─── */
function TypingIndicator() {
  return (
    <div className="flex justify-start animate-fade-slide-up">
      <div
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "18px 18px 18px 4px",
          padding: "14px 18px",
          display: "flex",
          alignItems: "center",
          gap: 6,
          boxShadow: "var(--shadow-card)",
        }}
      >
        <div className="typing-dot" />
        <div className="typing-dot" />
        <div className="typing-dot" />
      </div>
    </div>
  );
}

/* ─── Orbit Logo ─── */
function OrbitLogo({ size = 32 }) {
  return (
    <div
      style={{
        position: "relative",
        width: size,
        height: size,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        className="orbit-ring orbit-ring-1"
        style={{
          width: size * 1.15,
          height: size * 1.15,
          top: "50%",
          left: "50%",
          marginLeft: -(size * 1.15) / 2,
          marginTop: -(size * 1.15) / 2,
        }}
      />
      <div
        className="orbit-ring orbit-ring-2"
        style={{
          width: size * 0.78,
          height: size * 0.78,
          top: "50%",
          left: "50%",
          marginLeft: -(size * 0.78) / 2,
          marginTop: -(size * 0.78) / 2,
        }}
      />
      <GiMoonOrbit
        style={{
          fontSize: size * 0.65,
          background: "var(--gradient-primary)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          position: "relative",
          zIndex: 1,
        }}
      />
    </div>
  );
}

/* ─── Message Bubble ─── */
function MessageBubble({ msg, getFileIcon, idx }) {
  const isUser = msg.role === "user";
  const isSystem = msg.role === "system";

  const userStyle = {
    background: "var(--gradient-primary)",
    color: "#fff",
    borderRadius: "18px 18px 4px 18px",
    boxShadow: "0 4px 20px rgba(139,92,246,0.3)",
  };

  const assistantStyle = {
    background: "var(--bg-card)",
    color: "var(--text-primary)",
    border: "1px solid var(--border-subtle)",
    borderRadius: "18px 18px 18px 4px",
    boxShadow: "var(--shadow-card)",
  };

  const systemStyle = {
    background: "rgba(6,182,212,0.08)",
    color: "var(--accent-cyan)",
    border: "1px solid rgba(6,182,212,0.2)",
    borderRadius: "12px",
  };

  return (
    <div
      className={`flex animate-fade-slide-up ${isUser ? "justify-end" : "justify-start"}`}
      style={{
        animationDelay: `${idx * 0.04}s`,
        animationFillMode: "backwards",
      }}
    >
      {/* Assistant Avatar */}
      {!isUser && !isSystem && (
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: "50%",
            background: "var(--bg-tertiary)",
            border: "1px solid var(--border-accent)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginRight: 10,
            flexShrink: 0,
            marginTop: 4,
          }}
        >
          <OrbitLogo size={20} />
        </div>
      )}

      <div
        className={`max-w-[78%] msg-bubble ${isSystem ? "w-full" : ""}`}
        style={{
          ...(isUser ? userStyle : isSystem ? systemStyle : assistantStyle),
          padding: "12px 16px",
        }}
      >
        {msg.file && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 8,
              opacity: 0.85,
              fontSize: 13,
              padding: "6px 10px",
              background: "rgba(255,255,255,0.08)",
              borderRadius: 8,
            }}
          >
            {getFileIcon(msg.file)}
            <span style={{ truncate: true }}>{msg.file}</span>
          </div>
        )}
        <div
          style={{
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            lineHeight: 1.65,
            fontSize: 14,
          }}
        >
          {msg.content}
        </div>
        {msg.model && (
          <div
            style={{
              fontSize: 11,
              opacity: 0.5,
              marginTop: 8,
              display: "flex",
              gap: 6,
              alignItems: "center",
            }}
          >
            <Zap style={{ width: 10, height: 10 }} />
            {msg.mode && <span>{msg.mode}</span>}
            {msg.mode && <span>·</span>}
            <span>{msg.model}</span>
            {msg.source && <span>· {msg.source}</span>}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Welcome Screen ─── */
function WelcomeScreen() {
  const suggestions = [
    {
      icon: <Brain style={{ width: 18, height: 18 }} />,
      text: "Analyze a document",
      color: "var(--accent-purple)",
    },
    {
      icon: <Sparkles style={{ width: 18, height: 18 }} />,
      text: "Summarize key points",
      color: "var(--accent-blue)",
    },
    {
      icon: <Zap style={{ width: 18, height: 18 }} />,
      text: "Ask me anything",
      color: "var(--accent-cyan)",
    },
    {
      icon: <FileText style={{ width: 18, height: 18 }} />,
      text: "Upload a file to start",
      color: "var(--accent-pink)",
    },
  ];

  return (
    <div
      className="animate-fade-in"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        flex: 1,
        padding: "40px 24px",
        textAlign: "center",
      }}
    >
      {/* Logo glow ring */}
      <div
        style={{
          position: "relative",
          marginBottom: 28,
          display: "inline-block",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: -16,
            background:
              "radial-gradient(circle, rgba(139,92,246,0.18) 0%, transparent 70%)",
            borderRadius: "50%",
            animation: "pulseGlow 3s ease-in-out infinite",
          }}
        />
        <OrbitLogo size={64} />
      </div>

      <h2
        style={{
          fontSize: 28,
          fontWeight: 700,
          marginBottom: 8,
          letterSpacing: "-0.5px",
        }}
      >
        <span className="animate-gradient-text">How can I help you?</span>
      </h2>
      <p
        style={{
          color: "var(--text-secondary)",
          fontSize: 14,
          marginBottom: 36,
          maxWidth: 400,
        }}
      >
        ORBIT is your intelligent AI assistant. Ask anything, upload documents,
        and explore knowledge orbiting around you.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12,
          width: "100%",
          maxWidth: 480,
        }}
      >
        {suggestions.map((s, i) => (
          <div
            key={i}
            className="glass btn-glow"
            style={{
              padding: "14px 16px",
              borderRadius: 14,
              cursor: "default",
              display: "flex",
              alignItems: "center",
              gap: 10,
              transition: "all 0.25s ease",
              animationDelay: `${i * 0.08}s`,
            }}
          >
            <div
              style={{
                color: s.color,
                display: "flex",
                alignItems: "center",
              }}
            >
              {s.icon}
            </div>
            <span
              style={{
                fontSize: 13,
                fontWeight: 500,
                color: "var(--text-secondary)",
              }}
            >
              {s.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Main ChatBot Component ─── */
export default function ChatBot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [file, setFile] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [showSidebar, setShowSidebar] = useState(true);
  const [contextInfo, setContextInfo] = useState(null);
  const [inputFocused, setInputFocused] = useState(false);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const loadConversations = useCallback(async () => {
    try {
      const formData = new FormData();
      const response = await fetch(
        `${API_BASE_URL}/chat/?action=get_conversations`,
        {
          method: "POST",
          body: formData,
        },
      );
      const data = await response.json();
      if (data.status === "success") {
        const conversationsWithMessages = data.conversations.filter(
          (conv) => conv.message_count > 0,
        );
        const conversationsWithTitles = await Promise.all(
          conversationsWithMessages.map(async (conv) => {
            try {
              const historyFormData = new FormData();
              const historyResponse = await fetch(
                `${API_BASE_URL}/chat/?action=get_history&session_id=${conv.session_id}`,
                { method: "POST", body: historyFormData },
              );
              const historyData = await historyResponse.json();
              const firstUserMessage = historyData.messages?.find(
                (msg) => msg.role === "user",
              );
              return {
                ...conv,
                displayTitle: firstUserMessage?.content || "Untitled chat",
              };
            } catch {
              return { ...conv, displayTitle: "Untitled chat" };
            }
          }),
        );
        setConversations((prev) => {
          const map = new Map();
          prev.forEach((c) => map.set(c.session_id, c));
          conversationsWithTitles.forEach((c) => map.set(c.session_id, c));
          return Array.from(map.values());
        });
      }
    } catch (error) {
      console.error("Failed to load conversations:", error);
    }
  }, []);

  const loadContextInfo = useCallback(async () => {
    if (!sessionId) return;
    try {
      const formData = new FormData();
      const response = await fetch(
        `${API_BASE_URL}/chat/?action=get_context&session_id=${sessionId}`,
        { method: "POST", body: formData },
      );
      const data = await response.json();
      setContextInfo(data);
    } catch (error) {
      console.error("Failed to load context:", error);
    }
  }, [sessionId]);

  const loadConversationHistory = useCallback(async (convSessionId) => {
    try {
      const formData = new FormData();
      const response = await fetch(
        `${API_BASE_URL}/chat/?action=get_history&session_id=${convSessionId}`,
        { method: "POST", body: formData },
      );
      const data = await response.json();
      if (data.status === "success") {
        const formattedMessages = data.messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
          model: msg.model_used,
          timestamp: msg.created_at,
        }));
        setMessages(formattedMessages);
        setSessionId(convSessionId);
        if (window.innerWidth < 1024) setShowSidebar(false);
      }
    } catch (error) {
      console.error("Failed to load history:", error);
    }
  }, []);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    if (sessionId) loadContextInfo();
  }, [sessionId, loadContextInfo]);

  const generateTitleFromMessage = (text) => {
    if (!text) return "Untitled chat";
    return text.trim().split(" ").slice(0, 7).join(" ");
  };

  const getFileIcon = (filename) => {
    const ext = filename?.toLowerCase().split(".").pop();
    if (["jpg", "jpeg", "png", "gif", "webp", "bmp"].includes(ext))
      return <Image style={{ width: 14, height: 14 }} />;
    if (ext === "pdf") return <FileText style={{ width: 14, height: 14 }} />;
    return <File style={{ width: 14, height: 14 }} />;
  };

  const handleSend = async () => {
    if (!input.trim() && !file) return;

    const userMessage = { role: "user", content: input, file: file?.name };
    setMessages((prev) => [...prev, userMessage]);

    const currentInput = input;
    const currentFile = file;
    setInput("");
    setFile(null);
    setLoading(true);

    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    try {
      const formData = new FormData();
      if (currentFile) formData.append("file", currentFile);
      if (currentInput.trim()) formData.append("message", currentInput);

      const url = sessionId
        ? `${API_BASE_URL}/chat/?session_id=${sessionId}`
        : `${API_BASE_URL}/chat/`;

      const response = await fetch(url, { method: "POST", body: formData });
      const data = await response.json();

      if (!sessionId && data.session_id) {
        const newTitle = generateTitleFromMessage(currentInput);
        setSessionId(data.session_id);
        setConversations((prev) => [
          {
            session_id: data.session_id,
            message_count: 1,
            displayTitle: newTitle,
          },
          ...prev,
        ]);
      }

      if (data.answer) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: data.answer,
            model: data.model_used,
            mode: data.mode,
            source: data.source,
          },
        ]);
      } else if (data.message) {
        setMessages((prev) => [
          ...prev,
          { role: "system", content: data.message },
        ]);
      }

      await loadConversations();
      loadContextInfo();
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: "system", content: `Error: ${error.message}` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) setFile(selectedFile);
  };

  const clearContext = async () => {
    if (!sessionId) return;
    try {
      const formData = new FormData();
      const response = await fetch(
        `${API_BASE_URL}/chat/?action=clear_context&session_id=${sessionId}`,
        { method: "POST", body: formData },
      );
      const data = await response.json();
      if (data.status === "success") {
        setMessages((prev) => [
          ...prev,
          { role: "system", content: "Context cleared successfully" },
        ]);
        loadContextInfo();
      }
    } catch (error) {
      console.error("Failed to clear context:", error);
    }
  };

  const startNewChat = () => {
    setMessages([]);
    setSessionId(null);
    setFile(null);
    setInput("");
    setContextInfo(null);
    if (window.innerWidth < 1024) setShowSidebar(false);
  };

  // Auto-resize textarea
  const handleTextareaChange = (e) => {
    setInput(e.target.value);
    const ta = e.target;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 160) + "px";
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  /* ─────────── RENDER ─────────── */
  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        background: "var(--bg-primary)",
        color: "var(--text-primary)",
        fontFamily: "'Inter', system-ui, sans-serif",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* ── Backdrop overlay ── */}
      {showSidebar && (
        <div
          onClick={() => setShowSidebar(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.55)",
            zIndex: 40,
            backdropFilter: "blur(2px)",
            animation: "fadeIn 0.2s ease",
          }}
        />
      )}

      {/* ── Sidebar (fixed overlay drawer) ── */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          height: "100vh",
          width: 260,
          background: "var(--bg-secondary)",
          borderRight: "1px solid var(--border-subtle)",
          display: "flex",
          flexDirection: "column",
          transform: showSidebar ? "translateX(0)" : "translateX(-270px)",
          transition: "transform 0.3s cubic-bezier(0.4,0,0.2,1)",
          zIndex: 50,
          boxShadow: showSidebar ? "4px 0 32px rgba(0,0,0,0.5)" : "none",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "16px 12px",
            borderBottom: "1px solid var(--border-subtle)",
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          {/* Brand */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "4px 4px 8px",
            }}
          >
            <OrbitLogo size={28} />
            <span
              className="animate-gradient-text"
              style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.3px" }}
            >
              ORBIT
            </span>
          </div>

          {/* New Chat */}
          <button
            onClick={startNewChat}
            className="btn-glow"
            style={{
              width: "100%",
              padding: "10px 14px",
              background: "var(--gradient-primary)",
              border: "none",
              borderRadius: 12,
              color: "#fff",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
              boxShadow: "0 4px 20px rgba(139,92,246,0.35)",
            }}
          >
            <Plus style={{ width: 16, height: 16 }} />
            New Chat
          </button>
        </div>

        {/* Conversation List */}
        <div style={{ flex: 1, overflowY: "auto", padding: "12px 8px" }}>
          <div
            style={{
              fontSize: 10,
              fontWeight: 600,
              color: "var(--text-muted)",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              padding: "0 8px 8px",
            }}
          >
            Recent
          </div>

          {conversations.length === 0 ? (
            <div
              style={{
                fontSize: 12,
                color: "var(--text-muted)",
                padding: "20px 12px",
                textAlign: "center",
                lineHeight: 1.6,
              }}
            >
              <MessageSquare
                style={{
                  width: 28,
                  height: 28,
                  margin: "0 auto 8px",
                  opacity: 0.3,
                }}
              />
              No conversations yet
            </div>
          ) : (
            conversations.map((conv) => {
              const preview = generateTitleFromMessage(conv.displayTitle);
              const isActive = sessionId === conv.session_id;
              return (
                <button
                  key={conv.session_id}
                  onClick={() => loadConversationHistory(conv.session_id)}
                  className={`conv-item ${isActive ? "active" : ""}`}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    padding: "9px 12px",
                    borderRadius: 10,
                    marginBottom: 3,
                    background: isActive
                      ? "rgba(139,92,246,0.12)"
                      : "transparent",
                    border: "none",
                    color: isActive
                      ? "var(--text-primary)"
                      : "var(--text-secondary)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 9,
                    borderLeft: isActive
                      ? "2px solid var(--accent-purple)"
                      : "2px solid transparent",
                  }}
                >
                  <MessageSquare
                    style={{
                      width: 13,
                      height: 13,
                      flexShrink: 0,
                      marginTop: 2,
                      color: isActive
                        ? "var(--accent-purple)"
                        : "var(--text-muted)",
                    }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: isActive ? 600 : 400,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {preview}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: "var(--text-muted)",
                        marginTop: 2,
                      }}
                    >
                      {conv.message_count}{" "}
                      {conv.message_count === 1 ? "message" : "messages"}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Context Info */}
        {contextInfo?.has_context && (
          <div
            style={{
              padding: "12px",
              borderTop: "1px solid var(--border-subtle)",
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            <div
              style={{
                fontSize: 10,
                fontWeight: 600,
                color: "var(--text-muted)",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}
            >
              Active Context
            </div>
            {contextInfo.file && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: 12,
                  color: "var(--text-secondary)",
                  padding: "7px 10px",
                  background: "var(--bg-tertiary)",
                  borderRadius: 8,
                  border: "1px solid var(--border-subtle)",
                }}
              >
                {getFileIcon(contextInfo.file.filename)}
                <span
                  style={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    flex: 1,
                  }}
                >
                  {contextInfo.file.filename}
                </span>
              </div>
            )}
            <button
              onClick={clearContext}
              style={{
                padding: "7px 12px",
                background: "rgba(236,72,153,0.12)",
                border: "1px solid rgba(236,72,153,0.25)",
                borderRadius: 8,
                color: "var(--accent-pink)",
                fontSize: 12,
                fontWeight: 500,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
                justifyContent: "center",
                transition: "all 0.2s ease",
              }}
            >
              <Trash2 style={{ width: 12, height: 12 }} />
              Clear Context
            </button>
          </div>
        )}
      </div>

      {/* ── Main Chat Area (always full width) ── */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          width: "100%",
        }}
      >
        {/* Header */}
        <div
          className="glass"
          style={{
            padding: "14px 20px",
            borderBottom: "1px solid var(--border-subtle)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "relative",
            zIndex: 10,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              style={{
                padding: 8,
                background: "transparent",
                border: "1px solid var(--border-subtle)",
                borderRadius: 10,
                color: "var(--text-secondary)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                transition: "all 0.2s ease",
              }}
              title={showSidebar ? "Hide sidebar" : "Show sidebar"}
            >
              <ChevronLeft
                style={{
                  width: 16,
                  height: 16,
                  transform: showSidebar ? "rotate(0deg)" : "rotate(180deg)",
                  transition: "transform 0.3s ease",
                }}
              />
            </button>

            <OrbitLogo size={30} />
            <div>
              <div
                className="animate-gradient-text"
                style={{
                  fontSize: 17,
                  fontWeight: 700,
                  letterSpacing: "-0.3px",
                }}
              >
                ORBIT
              </div>
              <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                AI Assistant
              </div>
            </div>
          </div>

          {sessionId && (
            <div
              style={{
                fontSize: 11,
                color: "var(--text-muted)",
                background: "var(--bg-tertiary)",
                padding: "5px 10px",
                borderRadius: 20,
                border: "1px solid var(--border-subtle)",
                fontFamily: "monospace",
              }}
            >
              {sessionId.slice(0, 10)}…
            </div>
          )}

          {/* Live status indicator */}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: "var(--accent-green)",
                boxShadow: "0 0 8px var(--accent-green)",
                animation: "pulseGlow 2s ease-in-out infinite",
              }}
            />
            <span
              style={{
                fontSize: 11,
                color: "var(--accent-green)",
                fontWeight: 500,
              }}
            >
              Online
            </span>
          </div>
        </div>

        {/* Messages */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "24px 20px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {messages.length === 0 ? (
            <WelcomeScreen />
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 16,
                maxWidth: 760,
                margin: "0 auto",
                width: "100%",
              }}
            >
              {messages.map((msg, idx) => (
                <MessageBubble
                  key={idx}
                  msg={msg}
                  getFileIcon={getFileIcon}
                  idx={idx}
                />
              ))}
              {loading && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </div>
          )}
          {messages.length > 0 && loading && (
            <div
              style={{
                maxWidth: 760,
                margin: "0 auto",
                width: "100%",
                display: messages.length === 0 ? "none" : "block",
              }}
            />
          )}
        </div>

        {/* Input Area */}
        <div
          style={{
            padding: "16px 20px",
            borderTop: "1px solid var(--border-subtle)",
            background: "var(--bg-secondary)",
          }}
        >
          <div
            style={{
              maxWidth: 760,
              margin: "0 auto",
            }}
          >
            {/* File preview */}
            {file && (
              <div
                className="animate-scale-in"
                style={{
                  marginBottom: 10,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  background: "rgba(139,92,246,0.08)",
                  border: "1px solid rgba(139,92,246,0.2)",
                  borderRadius: 10,
                  padding: "8px 12px",
                }}
              >
                <div style={{ color: "var(--accent-purple)" }}>
                  {getFileIcon(file.name)}
                </div>
                <span
                  style={{
                    fontSize: 13,
                    flex: 1,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    color: "var(--text-secondary)",
                  }}
                >
                  {file.name}
                </span>
                <button
                  onClick={() => setFile(null)}
                  style={{
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--text-muted)",
                    padding: 4,
                    borderRadius: 6,
                    display: "flex",
                    alignItems: "center",
                    transition: "color 0.2s",
                  }}
                >
                  <X style={{ width: 14, height: 14 }} />
                </button>
              </div>
            )}

            {/* Input box */}
            <div
              style={{
                display: "flex",
                alignItems: "flex-end",
                gap: 8,
                background: "var(--bg-card)",
                border: inputFocused
                  ? "1px solid rgba(139,92,246,0.5)"
                  : "1px solid var(--border-subtle)",
                borderRadius: 16,
                padding: "8px 8px 8px 12px",
                boxShadow: inputFocused
                  ? "0 0 0 3px rgba(139,92,246,0.1), var(--shadow-card)"
                  : "var(--shadow-card)",
                transition: "all 0.3s ease",
              }}
            >
              {/* Attach */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                style={{ display: "none" }}
                accept=".pdf,.txt,.md,.jpg,.jpeg,.png,.webp,.gif,.doc,.docx"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
                title="Attach file"
                style={{
                  padding: 8,
                  background: "transparent",
                  border: "none",
                  borderRadius: 10,
                  color: file ? "var(--accent-purple)" : "var(--text-muted)",
                  cursor: loading ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  transition: "all 0.2s ease",
                  flexShrink: 0,
                  alignSelf: "flex-end",
                  marginBottom: 2,
                }}
              >
                <Paperclip style={{ width: 18, height: 18 }} />
              </button>

              {/* Textarea */}
              <textarea
                ref={textareaRef}
                value={input}
                onChange={handleTextareaChange}
                onKeyDown={handleKeyDown}
                onFocus={() => setInputFocused(true)}
                onBlur={() => setInputFocused(false)}
                placeholder="Message ORBIT… (Enter to send, Shift+Enter for newline)"
                disabled={loading}
                rows={1}
                style={{
                  flex: 1,
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  color: "var(--text-primary)",
                  fontSize: 14,
                  lineHeight: 1.6,
                  resize: "none",
                  fontFamily: "inherit",
                  maxHeight: 160,
                  overflowY: "auto",
                  padding: "6px 0",
                  scrollbarWidth: "thin",
                }}
              />

              {/* Send */}
              <button
                onClick={handleSend}
                disabled={loading || (!input.trim() && !file)}
                style={{
                  padding: "9px 10px",
                  background:
                    loading || (!input.trim() && !file)
                      ? "var(--bg-tertiary)"
                      : "var(--gradient-primary)",
                  border: "none",
                  borderRadius: 11,
                  color:
                    loading || (!input.trim() && !file)
                      ? "var(--text-muted)"
                      : "#fff",
                  cursor:
                    loading || (!input.trim() && !file)
                      ? "not-allowed"
                      : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  transition: "all 0.2s ease",
                  flexShrink: 0,
                  alignSelf: "flex-end",
                  boxShadow:
                    loading || (!input.trim() && !file)
                      ? "none"
                      : "0 4px 16px rgba(139,92,246,0.4)",
                  transform:
                    loading || (!input.trim() && !file)
                      ? "scale(1)"
                      : "scale(1.02)",
                }}
              >
                {loading ? (
                  <div
                    style={{
                      display: "flex",
                      gap: 3,
                      alignItems: "center",
                      padding: "0 4px",
                    }}
                  >
                    <div
                      className="typing-dot"
                      style={{ width: 5, height: 5 }}
                    />
                    <div
                      className="typing-dot"
                      style={{ width: 5, height: 5 }}
                    />
                    <div
                      className="typing-dot"
                      style={{ width: 5, height: 5 }}
                    />
                  </div>
                ) : (
                  <Send style={{ width: 16, height: 16 }} />
                )}
              </button>
            </div>

            {/* Footer note */}
            <div
              style={{
                textAlign: "center",
                marginTop: 8,
                fontSize: 11,
                color: "var(--text-muted)",
              }}
            >
              Supports PDF, images, text files & Word docs · Press{" "}
              <kbd
                style={{
                  background: "var(--bg-tertiary)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: 4,
                  padding: "1px 5px",
                  fontSize: 10,
                  fontFamily: "monospace",
                }}
              >
                Enter
              </kbd>{" "}
              to send
            </div>
          </div>
        </div>
      </div>

      {/* (backdrop handled above) */}
    </div>
  );
}
