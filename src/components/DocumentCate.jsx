import React, { useState, useEffect } from "react";
import Nav from "../components/Navbar";
import Footer from "../components/Footer";

const categories = [
  "Toán học", "Ngữ văn", "Tiếng Anh", "Lịch sử", "Địa lý",
  "Vật lý", "Hóa học", "Sinh học", "Tin học", "GDCD",
  "Công nghệ", "Thể dục", "Âm nhạc", "Mỹ thuật", "Ngoại ngữ khác"
];

function CategoryGrid() {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [documents, setDocuments] = useState([]);

  // Giả lập fetch tài liệu theo hạng mục đã chọn
  useEffect(() => {
    if (selectedCategory) {
      // Giả sử bạn có một API hoặc dữ liệu mẫu lấy tài liệu cho hạng mục
      const fetchDocuments = async () => {
        // Ở đây, bạn có thể thay thế bằng API thực tế
        const data = [
          { id: 1, title: `${selectedCategory} - Tài liệu 1`, description: 'Mô tả tài liệu 1', uploadDate: '2025-04-01' },
          { id: 2, title: `${selectedCategory} - Tài liệu 2`, description: 'Mô tả tài liệu 2', uploadDate: '2025-04-02' }
        ];
        setDocuments(data);
      };
      fetchDocuments();
    }
  }, [selectedCategory]);

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
  };

  return (
    <>
      <Nav />
      <div className="container mt-4">
        <h4 className="mb-4">Danh mục tài liệu</h4>
        <div className="row">
          {categories.map((category, index) => (
            <div
              className="col-6 col-md-4 col-lg-2 mb-3"
              key={index}
              onClick={() => handleCategoryClick(category)}
              style={{ cursor: "pointer" }}
            >
              <div className="card h-100 shadow-sm text-center">
                <div className="card-body d-flex align-items-center justify-content-center">
                  <span>{category}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {selectedCategory && (
          <div className="mt-4">
            <h5>Tài liệu thuộc hạng mục "{selectedCategory}"</h5>
            <div className="row mt-3">
              {documents.length > 0 ? (
                documents.map((doc) => (
                  <div key={doc.id} className="col-md-4 mb-4">
                    <div className="card shadow-sm">
                      <div className="card-body">
                        <h5 className="card-title">{doc.title}</h5>
                        <p className="card-text">{doc.description}</p>
                        <p><strong>Ngày tải lên:</strong> {new Date(doc.uploadDate).toLocaleDateString()}</p>
                        <div className="d-flex justify-content-start">
                          <button className="btn btn-info btn-sm me-2">Xem</button>
                          <button className="btn btn-warning btn-sm me-2">Chia sẻ</button>
                          <button className="btn btn-danger btn-sm">Tách riêng</button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p>Chưa có tài liệu nào trong hạng mục này.</p>
              )}
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}

export default CategoryGrid;
