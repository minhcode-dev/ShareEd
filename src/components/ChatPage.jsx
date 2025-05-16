
import React, { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import mammoth from "mammoth";
import { AuthContext } from "../context/AuthContext";

function ChatPage() {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [docContent, setDocContent] = useState("");
  const [chats, setChats] = useState([]);
  const [chatsLoading, setChatsLoading] = useState(true);
  const [selectedDocumentId, setSelectedDocumentId] = useState(id);

  // Hàm hiển thị thông báo
  const showNotification = (message) => {
    setError(message);
    setTimeout(() => setError(""), 3000);
  };

  // Lấy danh sách các cuộc trò chuyện
  useEffect(() => {
    if (!user) {
      setChatsLoading(false);
      return;
    }

    const fetchChats = async () => {
      setChatsLoading(true);
      try {
        const res = await fetch(`http://localhost:5000/chats/${user.id}`, {
          credentials: "include",
        });
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || "Không thể tải danh sách trò chuyện.");
        }
        const data = await res.json();
        console.log("Fetched chats:", data); // Debug log
        setChats(data.chats || []);
      } catch (err) {
        console.error("Fetch chats error:", err);
        showNotification(err.message);
      } finally {
        setChatsLoading(false);
      }
    };

    fetchChats();
  }, [user]);

  // Lấy chi tiết tài liệu
  useEffect(() => {
    if (!selectedDocumentId) return;

    const fetchDocument = async () => {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:5000/document-detail/${selectedDocumentId}`, {
          credentials: "include",
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || "Không thể tải tài liệu.");
        }

        const data = await res.json();
        setDocument(data.document);
      } catch (err) {
        showNotification(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDocument();
  }, [selectedDocumentId]);

  // Lấy nội dung tài liệu để dùng làm ngữ cảnh
  useEffect(() => {
    if (!document || !document.documentFilename) return;

    const fileExtension = document.documentFilename.split(".").pop().toLowerCase();
    if (fileExtension !== "docx") {
      showNotification("Chỉ hỗ trợ trò chuyện với tài liệu DOCX hiện tại.");
      return;
    }

    const fetchDocContent = async () => {
      try {
        const fileUrl = `http://localhost:5000/uploads/${document.documentFilename}`;
        const response = await fetch(fileUrl, { credentials: "include" });
        if (!response.ok) {
          throw new Error("Không thể tải nội dung tài liệu!");
        }

        const arrayBuffer = await response.arrayBuffer();
        const result = await mammoth.convertToHtml({ arrayBuffer });
        let textContent = result.value
          .replace(/<[^>]+>/g, " ")
          .replace(/\s+/g, " ")
          .replace(/https?:\/\/[^\s]+/g, "")
          .replace(/&/g, "")
          .trim()
          .slice(0, 2000);
        setDocContent(textContent);
      } catch (err) {
        showNotification("Lỗi khi tải nội dung tài liệu: " + err.message);
      }
    };

    fetchDocContent();
  }, [document]);

  // Lấy lịch sử trò chuyện
  useEffect(() => {
    if (!user || !selectedDocumentId) return;

    const fetchChatHistory = async () => {
      try {
        const res = await fetch(`http://localhost:5000/chat/${selectedDocumentId}/${user.id}`, {
          credentials: "include",
        });
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || "Không thể tải lịch sử trò chuyện.");
        }
        const data = await res.json();
        let fetchedMessages = data.messages || [];
        if (typeof fetchedMessages === "string") {
          try {
            fetchedMessages = JSON.parse(fetchedMessages);
          } catch (parseError) {
            console.error("Failed to parse messages JSON:", parseError, "Raw data:", fetchedMessages);
            fetchedMessages = [];
          }
        }
        if (!Array.isArray(fetchedMessages)) {
          console.warn("Fetched messages is not an array:", fetchedMessages);
          fetchedMessages = [];
        }
        setMessages(fetchedMessages);
      } catch (err) {
        showNotification(err.message);
      }
    };

    fetchChatHistory();
  }, [user, selectedDocumentId]);

  // Gửi câu hỏi và lưu lịch sử
  const sendMessage = async () => {
    if (!inputMessage.trim() || !user) {
      showNotification("Vui lòng đăng nhập và nhập câu hỏi!");
      return;
    }

    if (!docContent) {
      showNotification("Không có nội dung tài liệu để trò chuyện!");
      return;
    }

    setChatLoading(true);
    const newMessage = { role: "user", content: inputMessage, timestamp: new Date().toISOString() };
    setMessages((prev) => [...prev, newMessage]);
    setInputMessage("");

    try {
      const saveUserMessage = await fetch(`http://localhost:5000/chat/${selectedDocumentId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          userId: user.id,
          role: "user",
          content: inputMessage,
        }),
      });

      if (!saveUserMessage.ok) {
        const errorData = await saveUserMessage.json();
        throw new Error(errorData.error || "Không thể lưu tin nhắn người dùng.");
      }

      const prompt = `Bạn là một trợ lý AI hữu ích. Dựa trên nội dung tài liệu sau (bằng tiếng Việt), hãy trả lời câu hỏi một cách chính xác và ngắn gọn. Nếu câu hỏi không liên quan đến tài liệu, trả lời dựa trên kiến thức chung của bạn, nhưng ưu tiên ngữ cảnh tài liệu. Nội dung tài liệu: "${docContent}". Câu hỏi: "${inputMessage}"`;

      const geminiResponse = await fetch("http://localhost:5000/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ prompt }),
      });

      if (!geminiResponse.ok) {
        const errorData = await geminiResponse.json();
        throw new Error(errorData.error || "Không thể nhận phản hồi từ Gemini.");
      }

      const data = await geminiResponse.json();
      const answerText = data.candidates[0].content.parts[0].text;
      const assistantMessage = { role: "assistant", content: answerText, timestamp: new Date().toISOString() };

      const saveAssistantMessage = await fetch(`http://localhost:5000/chat/${selectedDocumentId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          userId: user.id,
          role: "assistant",
          content: answerText,
        }),
      });

      if (!saveAssistantMessage.ok) {
        const errorData = await saveAssistantMessage.json();
        throw new Error(errorData.error || "Không thể lưu phản hồi của Gemini.");
      }

      setMessages((prev) => [...prev, assistantMessage]);

      // Update chats list if this is a new chat
      if (!chats.some(chat => chat.document_id === parseInt(selectedDocumentId))) {
        setChats((prev) => [
          ...prev,
          { document_id: parseInt(selectedDocumentId), documentTitle: document.documentTitle || "Tài liệu không xác định" }
        ]);
      }
    } catch (err) {
      showNotification("Lỗi khi trả lời: " + err.message);
      setMessages((prev) => prev.filter((msg) => msg !== newMessage));
    } finally {
      setChatLoading(false);
    }
  };

  // Xử lý nhấn Enter để gửi tin nhắn
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Xử lý chọn tài liệu từ danh sách
  const handleSelectDocument = (documentId) => {
    setSelectedDocumentId(documentId);
    setMessages([]);
    setDocContent("");
  };

  if (loading && !document) {
    return (
      <div>
        <Navbar />
        <p className="text-center mt-4">Đang tải tài liệu...</p>
        <Footer />
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="container-fluid mt-4" style={{ minHeight: "80vh", display: "flex" }}>
        {/* Sidebar */}
        <div
          style={{
            width: "300px",
            borderRight: "1px solid #ddd",
            padding: "15px",
            position: "sticky",
            top: "70px",
            height: "calc(100vh - 70px)",
            overflowY: "auto",
            backgroundColor: "#f8f9fa",
          }}
        >
          <h5 className="mb-3 text-primary">Danh sách trò chuyện</h5>
          {chatsLoading ? (
            <p className="text-muted">Đang tải danh sách...</p>
          ) : chats.length === 0 ? (
            <p className="text-muted">Chưa có cuộc trò chuyện nào.</p>
          ) : (
            <ul className="list-group d-flex flex-column gap-2">
              {chats.map((chat) => (
                <li
                  key={chat.document_id}
                  className={`list-group-item d-flex align-items-center ${
                    chat.document_id === parseInt(selectedDocumentId) ? "active" : ""
                  }`}
                  style={{
                    cursor: "pointer",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    fontWeight: "500",
                    fontSize: "1.1rem",
                  }}
                  title={chat.documentTitle || "Tài liệu không xác định"}
                  onClick={() => handleSelectDocument(chat.document_id)}
                >
                  <i className="bi bi-file-text me-2 text-primary"></i>
                  <span>{chat.title || "Tài liệu không xác định"}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Main Chat Area */}
        <div style={{ flex: 1, padding: "15px" }}>
          {error && <p className="text-danger">{error}</p>}
          {document ? (
            <>
              <h4>Trò chuyện về tài liệu: {document.documentTitle}</h4>
              <div
                className="message-container"
                style={{
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  padding: "15px",
                  maxHeight: "60vh",
                  overflowY: "auto",
                }}
              >
                {messages.length === 0 ? (
                  <p className="text-muted">
                    Chưa có tin nhắn nào cho tài liệu <strong>{document.documentTitle}</strong>. 
                    Hãy đặt câu hỏi để bắt đầu trò chuyện!
                  </p>
                ) : (
                  <>
                    <h6 className="text-muted mb-3">
                      Lịch sử trò chuyện cho tài liệu: <strong>{document.documentTitle}</strong>
                    </h6>
                    {Array.isArray(messages) &&
                      messages.map((msg, index) => (
                        <div
                          key={index}
                          style={{
                            display: "flex",
                            justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                            marginBottom: "10px",
                          }}
                        >
                          <div
                            style={{
                              display: "inline-block",
                              backgroundColor: msg.role === "user" ? "#007bff" : "#f1f1f1",
                              color: msg.role === "user" ? "#fff" : "#000",
                              padding: "8px 12px",
                              borderRadius: "8px",
                              maxWidth: "70%",
                            }}
                          >
                            {msg.content}
                          </div>
                        </div>
                      ))}
                  </>
                )}
              </div>

              <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Đặt câu hỏi về tài liệu..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={chatLoading || !user || !docContent}
                />
                <button
                  className="btn btn-primary"
                  onClick={sendMessage}
                  disabled={chatLoading || !inputMessage.trim() || !user || !docContent}
                >
                  {chatLoading ? (
                    <span className="spinner-border spinner-border-sm"></span>
                  ) : (
                    "Gửi"
                  )}
                </button>
              </div>
            </>
          ) : (
            <p className="text-muted">Vui lòng chọn một tài liệu để trò chuyện.</p>
          )}
          {!user && (
            <p className="text-muted mt-2">
              Vui lòng <a href="/login">đăng nhập</a> để trò chuyện về tài liệu.
            </p>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default ChatPage;
