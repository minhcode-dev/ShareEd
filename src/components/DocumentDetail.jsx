import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import mammoth from "mammoth";
import { AuthContext } from "../context/AuthContext";

function DocumentDetail() {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [docContent, setDocContent] = useState(null);
  const [docError, setDocError] = useState("");
  const [docLoading, setDocLoading] = useState(false);
  const [favorite, setFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [favoriteError, setFavoriteError] = useState("");

  // Hàm hiển thị thông báo
  const showNotification = (type, message) => {
    if (type === "error") {
      setError(message);
      setTimeout(() => setError(""), 3000);
    } else if (type === "favoriteError") {
      setFavoriteError(message);
      setTimeout(() => setFavoriteError(""), 3000);
    }
  };

  useEffect(() => {
    const fetchDocument = async () => {
      setLoading(true);
      try {
        await fetch(`http://localhost:5000/documents/${id}/view`, {
          method: "POST",
          credentials: "include",
        });

        const res = await fetch(`http://localhost:5000/document-detail/${id}`, {
          credentials: "include",
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || "Không thể tải tài liệu.");
        }

        const data = await res.json();
        setDocument(data.document);
        setFavorite(data.document.favorite || false);
      } catch (err) {
        showNotification("error", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDocument();
  }, [id]);

  useEffect(() => {
    if (!document || !document.documentFilename) return;

    setDocLoading(true);
    const fileUrl = `http://localhost:5000/uploads/${document.documentFilename}`;
    const fileExtension = document.documentFilename.split(".").pop().toLowerCase();

    if (fileExtension === "pdf" || ["jpg", "jpeg", "png", "gif"].includes(fileExtension)) {
      setDocContent(null);
      setDocError("");
      setDocLoading(false);
    } else if (fileExtension === "docx") {
      const fetchDocxContent = async () => {
        try {
          const response = await fetch(fileUrl, { credentials: "include" });
          if (!response.ok) {
            throw new Error("Không thể tải tài liệu!");
          }

          const arrayBuffer = await response.arrayBuffer();
          const result = await mammoth.convertToHtml({ arrayBuffer });
          setDocContent(result.value);
          setDocError("");
        } catch (err) {
          setDocError("Lỗi khi hiển thị tài liệu Word: " + err.message);
        } finally {
          setDocLoading(false);
        }
      };

      fetchDocxContent();
    } else if (fileExtension === "doc") {
      setDocError("Định dạng .doc không được hỗ trợ. Vui lòng chuyển đổi sang .docx!");
      setDocLoading(false);
    } else {
      setDocError("Định dạng tệp không được hỗ trợ để xem trực tiếp!");
      setDocLoading(false);
    }
  }, [document]);

  const summarizeDocument = () => {
    if (!document || !document.documentFilename) {
      showNotification("error", "Không có tài liệu để tóm tắt!");
      return;
    }
    navigate(`/chat/${document.documentId}`);
  };

  const handleDownload = () => {
    if (!document || !document.documentFilename) return;
    const fileUrl = `http://localhost:5000/download/${document.documentFilename}`;
    window.open(fileUrl, "_blank");
  };

  const toggleFavorite = async () => {
    if (!document || !user) {
      showNotification("favoriteError", "Vui lòng đăng nhập để yêu thích tài liệu!");
      return;
    }

    setFavoriteLoading(true);
    setFavoriteError("");

    const newFavorite = !favorite;
    try {
      const res = await fetch(`http://localhost:5000/documents/${document.documentId}/favorite`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ favorite: newFavorite ? 1 : 0 }),
      });

      if (res.ok) {
        setFavorite(newFavorite);
        showNotification("favoriteError", `Đã ${newFavorite ? "thêm vào" : "bỏ"} yêu thích.`);
      } else {
        const data = await res.json();
        showNotification("favoriteError", data.error || "Không thể cập nhật trạng thái yêu thích.");
      }
    } catch (err) {
      showNotification("favoriteError", "Không thể kết nối đến máy chủ.");
    } finally {
      setFavoriteLoading(false);
    }
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <p className="text-center mt-4">Đang tải chi tiết tài liệu...</p>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Navbar />
        <p className="text-center mt-4 text-danger">{error}</p>
        <Footer />
      </div>
    );
  }

  if (!document) {
    return (
      <div>
        <Navbar />
        <p className="text-center mt-4">Không tìm thấy tài liệu.</p>
        <Footer />
      </div>
    );
  }

  const fileUrl = `http://localhost:5000/uploads/${document.documentFilename}`;
  const fileExtension = document.documentFilename.split(".").pop().toLowerCase();

  return (
    <div>
      <Navbar />
      <div className="container mt-4" style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "20px", minHeight: "80vh" }}>
        <div
          style={{
            backgroundColor: "#f0f0f0",
            padding: "20px",
            borderRadius: "8px",
            position: "sticky",
            top: "80px",
            height: "fit-content",
          }}
        >
          <h4>{document.documentTitle}</h4>
          <p>{document.documentDescription}</p>
          <p><strong>Người đăng:</strong> {document.userName}</p>
          <p><strong>Ngày tải lên:</strong> {new Date(document.documentUploadDate).toLocaleDateString()}</p>
          <p><strong>Hạng mục:</strong> {document.documentCategory || "Không rõ"}</p>
          <p><strong>Lượt xem:</strong> {document.viewCount || 0}</p>
          <p><strong>Lượt tải:</strong> {document.downloadCount || 0}</p>
          <div className="mt-3">
            <button
              className="btn btn-primary me-2"
              onClick={handleDownload}
              disabled={!user}
            >
              Tải xuống
            </button>
            <button
              className={`btn btn-${favorite ? "warning" : "outline-warning"} me-2`}
              onClick={toggleFavorite}
              disabled={favoriteLoading || !user}
            >
              {favoriteLoading ? (
                <span className="spinner-border spinner-border-sm"></span>
              ) : favorite ? (
                "Bỏ yêu thích"
              ) : (
                "Yêu thích"
              )}
            </button>
            <button
              className="btn btn-info me-2"
              onClick={summarizeDocument}
              disabled={!document || !document.documentFilename}
            >
              Trò chuyện
            </button>
            {favoriteError && <p className="text-success mt-2">{favoriteError}</p>}
            {!user && (
              <p className="text-muted mt-2">
                Vui lòng <a href="/login">đăng nhập</a> để tải xuống hoặc yêu thích tài liệu.
              </p>
            )}
          </div>
        </div>

        <div
          style={{
            backgroundColor: "#ffffff",
            padding: "20px",
            borderRadius: "8px",
            overflow: "auto",
            maxHeight: "80vh",
          }}
        >
          {docError ? (
            <p className="text-danger">{docError}</p>
          ) : docLoading ? (
            <div className="text-center">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Đang tải tài liệu...</span>
              </div>
            </div>
          ) : fileExtension === "pdf" ? (
            <iframe
              src={fileUrl}
              style={{ width: "100%", height: "500px", border: "none" }}
              title="PDF Viewer"
            />
          ) : ["jpg", "jpeg", "png", "gif"].includes(fileExtension) ? (
            <img
              src={fileUrl}
              alt={document.documentTitle}
              style={{ maxWidth: "100%", height: "auto", display: "block", margin: "0 auto" }}
            />
          ) : fileExtension === "docx" && docContent ? (
            <div
              style={{
                maxWidth: "100%",
                overflowWrap: "break-word",
                fontFamily: "Times New Roman",
                fontSize: "12pt",
              }}
              dangerouslySetInnerHTML={{ __html: docContent }}
            />
          ) : (
            <p>Đang tải nội dung tài liệu...</p>
          )}
        </div>
      </div>
      <div style={{ marginTop: "50vh" }}>
        <Footer />
      </div>
    </div>
  );
}

export default DocumentDetail;