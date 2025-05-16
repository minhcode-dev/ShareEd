import React, { useState, useEffect, useContext, useRef } from "react";
import { AuthContext } from "../context/AuthContext";
import Nav from "../components/Navbar";
import Footer from "../components/Footer";
import mammoth from "mammoth";
import { useNavigate } from 'react-router-dom';

const categories = [
  "Toán cao cấp",
  "Xác suất thống kê",
  "Lập trình cơ bản",
  "Cấu trúc dữ liệu và giải thuật",
  "Kinh tế vi mô",
  "Kinh tế vĩ mô",
  "Quản trị học",
  "Kế toán tài chính",
  "Marketing căn bản",
  "Luật kinh doanh",
  "Vật lý đại cương",
  "Hóa học đại cương",
  "Cơ học kỹ thuật",
  "Điện tử cơ bản",
  "Trí tuệ nhân tạo",
  "Học máy",
  "Mạng máy tính",
  "An ninh mạng",
  "Xã hội học",
  "Tâm lý học",
  "Ngôn ngữ học",
  "Khác",
];

function DocumentPage() {
  const { user } = useContext(AuthContext);
  const [documents, setDocuments] = useState([]);
  const [files, setFiles] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [visibility, setVisibility] = useState("public");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [viewingDoc, setViewingDoc] = useState(null);
  const [docContent, setDocContent] = useState(null);
  const [docError, setDocError] = useState("");
  const [docLoading, setDocLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(3);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  // Hàm hiển thị thông báo và tự động xóa sau 3 giây
  const showNotification = (type, message) => {
    if (type === "success") {
      setSuccess(message);
      setTimeout(() => setSuccess(""), 3000);
    } else if (type === "error") {
      setError(message);
      setTimeout(() => setError(""), 3000);
    }
  };

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      console.log("Fetching documents for user:", user?.id);
      const res = await fetch(
        `http://localhost:5000/documents?page=${currentPage}&limit=${itemsPerPage}`,
        { credentials: "include" }
      );
      const contentType = res.headers.get("content-type");

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error("Fetch documents error:", res.status, errorData);
        showNotification("error", errorData.error || `Lỗi khi lấy danh sách tài liệu (Mã: ${res.status})`);
        setDocuments([]);
        setTotalPages(1);
      } else if (!contentType || !contentType.includes("application/json")) {
        console.error("Invalid response content-type:", contentType);
        showNotification("error", "Phản hồi không hợp lệ từ máy chủ!");
        setDocuments([]);
        setTotalPages(1);
      } else {
        const data = await res.json();
        console.log("Fetched documents:", data);
        setDocuments(Array.isArray(data.documents) ? data.documents : []);
        setTotalPages(Number.isFinite(data.totalPages) ? data.totalPages : 1);
        showNotification("error", "");
      }
    } catch (err) {
      console.error("Fetch documents catch error:", err.message);
      showNotification("error", "Không thể kết nối đến máy chủ.");
      setDocuments([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  // Kiểm tra user và tải tài liệu
  useEffect(() => {
    console.log("AuthContext user:", user);
    if (!user) {
      setLoading(false);
      return;
    }
    fetchDocuments();
  }, [user]);

  // Tải lại tài liệu khi currentPage thay đổi
  useEffect(() => {
    if (user) {
      fetchDocuments();
    }
  }, [currentPage, user]);

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
    showNotification("error", "");
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!user) {
      showNotification("error", "Bạn cần đăng nhập để tải lên tài liệu!");
      return;
    }
    if (!files.length || !title || !category) {
      showNotification("error", "Vui lòng điền tiêu đề, chọn hạng mục và ít nhất một tệp!");
      return;
    }

    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    formData.append("title", title);
    formData.append("description", description);
    formData.append("visibility", visibility);
    formData.append("category", category);

    setUploading(true);
    try {
      const res = await fetch("http://localhost:5000/upload-multiple", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      const data = await res.json();
      if (!res.ok) {
        showNotification("error", data.error || "Lỗi khi tải lên tài liệu!");
      } else {
        showNotification("success", "Tải lên thành công!");
        setTitle("");
        setDescription("");
        setFiles([]);
        setCategory("");
        setVisibility("public");
        showNotification("error", "");
        setCurrentPage(1);
        await fetchDocuments();
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    } catch (err) {
      showNotification("error", "Không thể kết nối đến máy chủ.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (docId) => {
    if (!user) {
      showNotification("error", "Bạn cần đăng nhập để xóa tài liệu!");
      return;
    }
    const confirmDelete = window.confirm("Bạn có chắc muốn xóa tài liệu này?");
    if (!confirmDelete) return;

    try {
      const res = await fetch(`http://localhost:5000/documents/${docId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (res.ok) {
        setDocuments((prev) => prev.filter((doc) => doc.id !== docId));
        showNotification("success", "Đã xóa tài liệu thành công.");
        if (documents.length <= 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        }
      } else {
        const data = await res.json().catch(() => ({}));
        showNotification("error", data.error || "Lỗi khi xóa tài liệu!");
      }
    } catch (err) {
      showNotification("error", "Không thể kết nối đến máy chủ.");
    }
  };

  const toggleVisibility = async (doc) => {
    if (!user) {
      showNotification("error", "Bạn cần đăng nhập để chỉnh sửa quyền riêng tư!");
      return;
    }
    const newVisibility = doc.visibility === "public" ? "private" : "public";
    const confirmChange = window.confirm(
      `Bạn có chắc muốn thay đổi quyền truy cập thành "${newVisibility === "public" ? "Công khai" : "Riêng tư"}"?`
    );
    if (!confirmChange) return;

    try {
      const res = await fetch(`http://localhost:5000/documents/${doc.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ visibility: newVisibility }),
      });

      if (res.ok) {
        setDocuments((prev) =>
          prev.map((d) =>
            d.id === doc.id ? { ...d, visibility: newVisibility } : d
          )
        );
        showNotification("success", "Đã cập nhật quyền truy cập.");
      } else {
        const data = await res.json().catch(() => ({}));
        showNotification("error", data.error || "Không thể cập nhật quyền truy cập.");
      }
    } catch (err) {
      showNotification("error", "Không thể kết nối đến máy chủ.");
    }
  };

  const handleViewDocument = async (doc) => {
    if (!doc.filename) {
      setDocError("Tài liệu không có tệp đính kèm!");
      setViewingDoc(doc);
      return;
    }

    setViewingDoc(doc);
    setDocError("");
    setDocContent(null);
    setDocLoading(true);

    const fileUrl = `http://localhost:5000/uploads/${doc.filename}`;
    const fileExtension = doc.filename.split(".").pop().toLowerCase();

    if (fileExtension === "pdf" || ["jpg", "jpeg", "png", "gif"].includes(fileExtension)) {
      setDocLoading(false);
      return;
    } else if (fileExtension === "docx") {
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
    } else if (fileExtension === "doc") {
      setDocError("Định dạng .doc không được hỗ trợ. Vui lòng chuyển đổi sang .docx!");
      setDocLoading(false);
    } else {
      setDocError("Định dạng tệp không được hỗ trợ để xem trực tiếp!");
      setDocLoading(false);
    }
  };

  const closeViewer = () => {
    setViewingDoc(null);
    setDocContent(null);
    setDocError("");
    setDocLoading(false);
  };

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  if (!user) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Nav />
        <main style={{ flex: 1 }}>
          <p className="text-center mt-4">
            Vui lòng <a href="/login">đăng nhập</a> để xem danh sách tài liệu.
          </p>
        </main>
        <Footer />
      </div>
    );
  }
  

  return (
    <>
      <Nav />
      <div className="d-flex flex-column min-vh-100">
        <div className="container-fluid flex-grow-1">
          <div className="row">
            <div className="col-md-4 p-4 d-flex flex-column">
              <form onSubmit={handleUpload} className="p-4 border bg-light rounded shadow-sm">
                <h4 className="mb-3 text-center">Tải lên tài liệu</h4>
                <input
                  type="text"
                  className="form-control mb-3"
                  placeholder="Tiêu đề tài liệu"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />

                <textarea
                  className="form-control mb-3"
                  placeholder="Mô tả tài liệu (tùy chọn)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />

                <select
                  className="form-control mb-3"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                >
                  <option value="">-- Chọn hạng mục môn học --</option>
                  {categories.map((cat, idx) => (
                    <option key={idx} value={cat}>{cat}</option>
                  ))}
                </select>

                <input
                  type="file"
                  className="form-control mb-3"
                  multiple
                  accept=".pdf,image/*,.doc,.docx"
                  onChange={handleFileChange}
                  required
                  ref={fileInputRef}
                />

                {files.length > 0 && (
                  <ul className="list-unstyled small">
                    {files.map((file, idx) => (
                      <li key={idx}>📄 {file.name}</li>
                    ))}
                  </ul>
                )}

                <label className="form-label mt-3">Chế độ truy cập</label>
                <select
                  className="form-control mb-3"
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value)}
                >
                  <option value="public">Công khai</option>
                  <option value="private">Riêng tư</option>
                </select>

                <button
                  type="submit"
                  className="btn btn-success w-100"
                  disabled={uploading}
                >
                  {uploading ? (
                    <span className="spinner-border spinner-border-sm"></span>
                  ) : (
                    "Tải lên"
                  )}
                </button>
              </form>
            </div>

            <div className="col-md-8 p-5">
              <h3 className="text-primary mb-4">Tài liệu của bạn</h3>
              {error && <p className="text-danger">{error}</p>}
              {success && <p className="text-success">{success}</p>}

              {loading ? (
                <div className="text-center">
                  <div className="spinner-border" role="status">
                    <span className="visually-hidden">Đang tải...</span>
                  </div>
                </div>
              ) : documents.length === 0 ? (
                <p className="text-center">Chưa có tài liệu nào.</p>
              ) : (
                <div className="list-group">
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="list-group-item p-3 mb-3 border rounded shadow-sm"
                    >
                      <h5>{doc.title || "Không có tiêu đề"}</h5>
                      <p>{doc.description || "Không có mô tả"}</p>
                      <p>
                        <strong>Hạng mục:</strong> {doc.category || "Không rõ"}
                      </p>
                      <p>
                        <strong>Ngày tải lên:</strong>{" "}
                        {doc.uploadDate
                          ? new Date(doc.uploadDate).toLocaleString()
                          : "Không xác định"}
                      </p>
                      <p>
                        <strong>Chế độ:</strong>{" "}
                        {doc.visibility === "private" ? "Riêng tư" : "Công khai"}
                      </p>

                      {doc.filename && (
                        <button
                          className="btn btn-outline-primary btn-sm me-2"
                          onClick={() => handleViewDocument(doc)}
                        >
                          Xem tài liệu
                        </button>
                      )}

                      <button
                        className="btn btn-secondary btn-sm me-2"
                        onClick={() => toggleVisibility(doc)}
                      >
                        Chỉnh sửa quyền riêng tư
                      </button>

                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(doc.id)}
                      >
                        Xóa
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {documents.length > 0 && (
                <nav className="mt-4">
                  <ul className="pagination justify-content-center">
                    <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                      <button
                        className="page-link"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        Trang trước
                      </button>
                    </li>
                    <li className="page-item active">
                      <button className="page-link" disabled>
                        {currentPage}
                      </button>
                    </li>
                    <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                      <button
                        className="page-link"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      >
                        Trang sau
                      </button>
                    </li>
                  </ul>
                </nav>
              )}
            </div>
          </div>
        </div>
        <Footer />
      </div>
      {viewingDoc && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{viewingDoc.title}</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeViewer}
                ></button>
              </div>
              <div className="modal-body" style={{ maxHeight: "70vh", overflowY: "auto" }}>
                {docError ? (
                  <p className="text-danger">{docError}</p>
                ) : docLoading ? (
                  <div className="text-center">
                    <div className="spinner-border" role="status">
                      <span className="visually-hidden">Đang tải tài liệu...</span>
                    </div>
                  </div>
                ) : viewingDoc.filename ? (
                  (() => {
                    const fileExtension = viewingDoc.filename.split(".").pop().toLowerCase();
                    const fileUrl = `http://localhost:5000/uploads/${viewingDoc.filename}`;

                    if (fileExtension === "pdf") {
                      return (
                        <iframe
                          src={fileUrl}
                          style={{ width: "100%", height: "500px" }}
                          title="PDF Viewer"
                        />
                      );
                    } else if (["jpg", "jpeg", "png", "gif"].includes(fileExtension)) {
                      return (
                        <img
                          src={fileUrl}
                          alt={viewingDoc.title}
                          style={{ maxWidth: "100%", height: "auto" }}
                        />
                      );
                    } else if (fileExtension === "docx" && docContent) {
                      return (
                        <div
                          dangerouslySetInnerHTML={{ __html: docContent }}
                          style={{ fontFamily: "Times New Roman", fontSize: "12pt" }}
                        />
                      );
                    } else {
                      return <p>Đang tải nội dung tài liệu...</p>;
                    }
                  })()
                ) : (
                  <p>Không có tệp để hiển thị.</p>
                )}
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={closeViewer}>
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default DocumentPage;
