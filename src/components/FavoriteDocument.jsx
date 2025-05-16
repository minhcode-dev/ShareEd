import React, { useEffect, useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import mammoth from "mammoth";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function FavoriteDocuments() {
  const { user } = useContext(AuthContext);
  const [favoriteDocs, setFavoriteDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [docPreviews, setDocPreviews] = useState({});
  const [previewErrors, setPreviewErrors] = useState({});
  const [previewVisibility, setPreviewVisibility] = useState({});
  const navigate = useNavigate();

  // Gọi API lấy danh sách tài liệu yêu thích
  useEffect(() => {
    console.log("useEffect run, user:", user, "type:", typeof user);
    if (user === null) {
      console.log("User is null, waiting for AuthContext");
      setLoading(false);
      return;
    }
    if (!user) {
      console.log("No user, skipping fetchFavorites");
      setLoading(false);
      return;
    }

    const fetchFavorites = async () => {
      setLoading(true);
      try {
        console.log("Fetching favorites for user:", user?.id);
        const response = await fetch("http://localhost:5000/documents/favorites", {
          credentials: "include",
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `Không thể lấy tài liệu yêu thích (Mã: ${response.status})`);
        }

        const data = await response.json();
        console.log("Fetched favorites:", data);
        setFavoriteDocs(Array.isArray(data.documents) ? data.documents : []);
        setError("");
      } catch (err) {
        console.error("Lỗi khi lấy danh sách tài liệu yêu thích:", err);
        setError(err.message || "Không thể tải tài liệu yêu thích.");
        toast.error(err.message || "Không thể tải tài liệu yêu thích.");
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [user]);

  const toggleFavorite = async (doc) => {
    if (!user) {
      toast.error("Bạn cần đăng nhập để bỏ yêu thích tài liệu!");
      navigate("/login");
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/documents/${doc.id}/favorite`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ favorite: 0 }), // Bỏ yêu thích
      });

      if (res.ok) {
        setFavoriteDocs((prev) => prev.filter((d) => d.id !== doc.id));
        toast.success("Đã bỏ yêu thích.");
        setError("");
      } else {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error || "Không thể bỏ yêu thích.");
        setError(data.error || "Không thể bỏ yêu thích.");
      }
    } catch (err) {
      toast.error("Không thể kết nối đến máy chủ.");
      setError("Không thể kết nối đến máy chủ.");
    }
  };

  const toggleDocPreview = async (doc) => {
    if (!user) {
      toast.error("Bạn cần đăng nhập để xem trước tài liệu!");
      navigate("/login");
      return;
    }

    const docId = doc.id;
    const fileExtension = doc.filename.split(".").pop().toLowerCase();

    if (fileExtension !== "docx") {
      return;
    }

    setPreviewVisibility((prev) => ({
      ...prev,
      [docId]: !prev[docId],
    }));

    if (docPreviews[docId] || previewErrors[docId]) {
      return;
    }

    const fileUrl = `http://localhost:5000/uploads/${doc.filename}`;
    try {
      const response = await fetch(fileUrl, { credentials: "include" });
      if (!response.ok) {
        throw new Error("Không thể tải tài liệu!");
      }

      const arrayBuffer = await response.arrayBuffer();
      const result = await mammoth.convertToHtml({ arrayBuffer });
      setDocPreviews((prev) => ({
        ...prev,
        [docId]: result.value,
      }));
      setPreviewErrors((prev) => ({
        ...prev,
        [docId]: "",
      }));
    } catch (err) {
      setPreviewErrors((prev) => ({
        ...prev,
        [docId]: "Lỗi khi hiển thị tài liệu: " + err.message,
      }));
      toast.error("Lỗi khi hiển thị tài liệu: " + err.message);
    }
  };

  console.log("Rendering FavoriteDocuments, user:", user);

  if (!user) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Navbar />
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
    <div className="flex flex-col min-h-screen bg-gray-50">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} closeOnClick pauseOnHover />
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="mt-3 text-3xl font-bold text-gray-900 mb-8 text-center">
          <span className="inline-flex items-center">Tài Liệu Yêu Thích</span>
        </h1>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md mb-6 max-w-lg mx-auto">
            <p>{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-blue-500 border-solid"></div>
          </div>
        ) : favoriteDocs.length === 0 ? (
          <div className="text-center py-12">
            <p className="mt-5 text-lg text-gray-600">
              Bạn chưa có tài liệu nào được đánh dấu yêu thích.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {favoriteDocs.map((doc) => {
              const fileExtension = doc.filename.split(".").pop().toLowerCase();
              const isDocx = fileExtension === "docx";
              const isPreviewVisible = previewVisibility[doc.id];

              return (
                <div
                  key={doc.id}
                  className="bg-white border border-gray-300 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-300"
                >
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">
                    <Link to={`/document/${doc.id}`} className="hover:underline">
                      {doc.title || "Không có tiêu đề"}
                    </Link>
                  </h3>
                  <p className="text-gray-600 mb-1">Mô tả: {doc.description || "Không có mô tả"}</p>
                  <p className="text-sm text-gray-500 mb-1">
                    Ngày tải lên:{" "}
                    {doc.uploadDate
                      ? new Date(doc.uploadDate).toLocaleString("vi-VN", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })
                      : "Không xác định"}
                  </p>
                  <div className="flex space-x-3">
                    {doc.filename ? (
                      <>
                        <button
                          onClick={() =>
                            window.open(`http://localhost:5000/uploads/${doc.filename}`, "_blank")
                          }
                          className="bg-yellow-400 hover:bg-yellow-500 text-black px-3 py-1 rounded-md transition-colors text-sm"
                        >
                          Tải xuống
                        </button>
                        {isDocx && (
                          <button
                            onClick={() => toggleDocPreview(doc)}
                            className="bg-purple-500 hover:bg-purple-600 text-black px-3 py-1 rounded-md transition-colors text-sm"
                          >
                            {isPreviewVisible ? "Ẩn nội dung" : "Xem trước"}
                          </button>
                        )}
                        <button
                          onClick={() => toggleFavorite(doc)}
                          className="bg-yellow-500 hover:bg-yellow-600 text-black px-3 py-1 rounded-md transition-colors text-sm"
                        >
                          Bỏ yêu thích
                        </button>
                      </>
                    ) : (
                      <span className="text-gray-500 text-sm">
                        Không có tệp để hiển thị
                      </span>
                    )}
                  </div>
                  {isDocx && isPreviewVisible && (
                    <div className="mt-4 p-4 bg-gray-100 rounded-md">
                      {previewErrors[doc.id] ? (
                        <p className="text-red-700">{previewErrors[doc.id]}</p>
                      ) : docPreviews[doc.id] ? (
                        <div
                          style={{
                            maxWidth: "100%",
                            overflowWrap: "break-word",
                            fontFamily: "Times New Roman",
                            fontSize: "12pt",
                          }}
                          dangerouslySetInnerHTML={{ __html: docPreviews[doc.id] }}
                        />
                      ) : (
                        <p className="text-gray-600">Đang tải nội dung tài liệu...</p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
      <div style={{ marginTop: "100vh" }}></div>
      <Footer />
    </div>
  );
}

export default FavoriteDocuments;
