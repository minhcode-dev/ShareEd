import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

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

const ITEMS_PER_PAGE = 9;

function SharedDocuments() {
  const [documents, setDocuments] = useState([]);
  const [filteredDocs, setFilteredDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchDocuments = async () => {
      setLoading(true);
      try {
        const res = await fetch("http://localhost:5000/public-documents");
        const contentType = res.headers.get("content-type");

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || "Có lỗi khi tải tài liệu.");
        }

        if (contentType && contentType.includes("application/json")) {
          const data = await res.json();
          setDocuments(data.documents);
        } else {
          throw new Error("Dữ liệu không phải định dạng JSON");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, []);

  useEffect(() => {
    let filtered = documents;

    if (selectedCategory) {
      filtered = filtered.filter(doc => doc.documentCategory === selectedCategory);
    }

    if (searchQuery) {
      filtered = filtered.filter(doc =>
        doc.documentTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.documentDescription.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredDocs(filtered);
    setCurrentPage(1);
  }, [documents, selectedCategory, searchQuery]);

  const handleCategoryClick = (category) => {
    setSelectedCategory(prev => (prev === category ? null : category));
  };

  const totalPages = Math.ceil(filteredDocs.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedDocs = filteredDocs.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const changePage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="container mt-4">
      <h4 className="mb-4">📁 Danh mục tài liệu</h4>

      <div className="row mb-4">
        {categories.map((category, index) => (
          <div className="col-6 col-md-4 col-lg-2 mb-3" key={index}>
            <div
              className={`card h-100 text-center shadow-sm ${selectedCategory === category ? "border-primary border-2" : ""}`}
              onClick={() => handleCategoryClick(category)}
              style={{ cursor: "pointer" }}
            >
              <div
                className={`card-body d-flex align-items-center justify-content-center ${selectedCategory === category ? "text-primary fw-bold" : ""}`}
              >
                {category}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mb-4">
        <input
          type="text"
          className="form-control"
          placeholder="Tìm kiếm tài liệu..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <h5 className="mb-3">
        {selectedCategory ? `📚 Tài liệu thuộc: ${selectedCategory}` : "📚 Tất cả tài liệu"}
      </h5>

      {loading ? (
        <p>Đang tải tài liệu...</p>
      ) : error ? (
        <p className="text-danger">{error}</p>
      ) : filteredDocs.length === 0 ? (
        <p>Không có tài liệu nào.</p>
      ) : (
        <>
          <div className="row">
            {paginatedDocs.map((doc, index) => (
              <div className="col-md-6 col-lg-4 mb-4" key={index}>
                <div className="card h-100 shadow-sm">
                  <div className="card-body">
                    <h5 className="card-title">{doc.documentTitle}</h5>
                    <p className="card-text text-muted mb-2">
                      <i className="bi bi-journal-text me-1"></i> {doc.documentCategory}
                    </p>
                    <p className="card-text">{doc.documentDescription}</p>
                  </div>
                  <div className="card-footer small text-muted">
                    <i className="bi bi-person-circle me-1"></i> {doc.userName}
                    <i className="bi bi-calendar-event me-1"></i>{" "}
                    {new Date(doc.documentUploadDate).toLocaleDateString()}
                    <i className="bi bi-eye me-1"></i> {doc.viewCount || 0} lượt xem
                    <i className="bi bi-download me-1"></i> {doc.downloadCount || 0} lượt tải
                  </div>
                  <Link to={`/document/${doc.documentId}`} className="btn btn-primary mt-2">
                    Xem chi tiết
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <nav style={{ marginTop: "10vh" }}>
            <ul className="pagination justify-content-center">
              <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                <button
                  className="page-link"
                  onClick={() => changePage(currentPage - 1)}
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
                  onClick={() => changePage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Trang sau
                </button>
              </li>
            </ul>
          </nav>
        </>
      )}
    </div>
  );
}

export default SharedDocuments;