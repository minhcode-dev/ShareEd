import React, { useState } from "react";

// Danh sách các danh mục
const categories = [
  "Toán học", "Ngữ văn", "Tiếng Anh", "Lịch sử", "Địa lý",
  "Vật lý", "Hóa học", "Sinh học", "Tin học", "GDCD",
  "Công nghệ", "Thể dục", "Âm nhạc", "Mỹ thuật", "Ngoại ngữ khác"
];

function CategoryGrid() {
  // State để lưu danh mục hiện tại đang được chọn
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Hàm xử lý khi nhấp vào một danh mục
  const handleCategoryClick = (category) => {
    setSelectedCategory(category);  // Lưu danh mục đã chọn vào state
  };

  // Nếu có danh mục được chọn, chỉ lọc các danh mục thuộc nhóm đó
  const filteredCategories = selectedCategory
    ? categories.filter(category => category === selectedCategory)
    : categories; // Nếu không chọn danh mục nào, hiển thị tất cả

  return (
    <div className="container mt-4">
      <h4 className="mb-4">Danh mục tài liệu</h4>

      {/* Hiển thị danh sách danh mục */}
      <div className="row">
        {filteredCategories.map((category, index) => (
          <div className="col-6 col-md-4 col-lg-2 mb-3" key={index}>
            <div
              className="card h-100 shadow-sm text-center"
              onClick={() => handleCategoryClick(category)} // Bắt sự kiện nhấp vào danh mục
              style={{ cursor: 'pointer' }}
            >
              <div className="card-body d-flex align-items-center justify-content-center">
                <span>{category}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Hiển thị danh mục đã chọn */}
      {selectedCategory && (
        <div className="mt-4">
          <h5>Bạn đã chọn danh mục: {selectedCategory}</h5>
        </div>
      )}
    </div>
  );
}

export default CategoryGrid;
