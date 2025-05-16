-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 16, 2025 at 05:03 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `shareed`
--

-- --------------------------------------------------------

--
-- Table structure for table `chats`
--

CREATE TABLE `chats` (
  `id` int(11) NOT NULL,
  `document_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `messages` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`messages`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `chats`
--

INSERT INTO `chats` (`id`, `document_id`, `user_id`, `messages`, `created_at`, `updated_at`) VALUES
(1, 44, 1, '[{\"role\":\"user\",\"content\":\"hi\",\"timestamp\":\"2025-05-13T13:41:01.367Z\"},{\"role\":\"user\",\"content\":\"hi\",\"timestamp\":\"2025-05-13T13:46:48.085Z\"},{\"role\":\"assistant\",\"content\":\"Xin chào!\\n\",\"timestamp\":\"2025-05-13T13:46:48.945Z\"},{\"role\":\"user\",\"content\":\"nội dung của tài liệu này là gì ?\",\"timestamp\":\"2025-05-13T13:47:05.358Z\"},{\"role\":\"assistant\",\"content\":\"Tài liệu mô tả quá trình thiết lập môi trường và thực hiện kiểm thử tự động một trang web thương mại điện tử (Sauce Demo) bằng Python với Selenium trên Visual Studio Code, sử dụng Google Chrome và Edge.  Nội dung tập trung vào việc kiểm tra chức năng đăng nhập/đăng xuất.\\n\",\"timestamp\":\"2025-05-13T13:47:06.693Z\"},{\"role\":\"user\",\"content\":\"tôi thấy nó kiểm tra nhiều cái hơn mà ? \",\"timestamp\":\"2025-05-13T13:47:27.591Z\"},{\"role\":\"assistant\",\"content\":\"Tài liệu chỉ đề cập chi tiết đến một test case (Test ID 1: kiểm tra đăng nhập).  Các chức năng khác (thêm sản phẩm, thanh toán, v.v.) được nhắc đến như là các chức năng *có thể* được kiểm thử trên cùng nền tảng, nhưng không có thông tin cụ thể về các test case khác.\\n\",\"timestamp\":\"2025-05-13T13:47:29.014Z\"},{\"role\":\"user\",\"content\":\"hi\",\"timestamp\":\"2025-05-13T13:55:04.537Z\"},{\"role\":\"assistant\",\"content\":\"Xin chào!\\n\",\"timestamp\":\"2025-05-13T13:55:05.412Z\"},{\"role\":\"user\",\"content\":\"tài liệu này có bao nhiêu chữ\",\"timestamp\":\"2025-05-13T14:38:31.929Z\"},{\"role\":\"assistant\",\"content\":\"Tôi không thể đếm chính xác số chữ trong tài liệu vì không có đủ thông tin.  Tài liệu cung cấp một đoạn văn bản không đầy đủ.\\n\",\"timestamp\":\"2025-05-13T14:38:32.895Z\"}]', '2025-05-13 13:41:01', '2025-05-13 14:38:32'),
(2, 45, 1, '[{\"role\":\"user\",\"content\":\"xin chào\",\"timestamp\":\"2025-05-13T13:48:08.798Z\"},{\"role\":\"assistant\",\"content\":\"Chào bạn!\\n\",\"timestamp\":\"2025-05-13T13:48:09.829Z\"},{\"role\":\"user\",\"content\":\"tài liệu này là gì vậy\",\"timestamp\":\"2025-05-13T13:48:19.347Z\"},{\"role\":\"assistant\",\"content\":\"Đây là báo cáo bài tập thực hành môn Seminar chuyên đề về thuật toán giải bài toán TSP (Traveling Salesperson Problem) và tô màu đồ thị, lập lịch bằng thuật toán tham lam và quy hoạch động/nhánh cận.\\n\",\"timestamp\":\"2025-05-13T13:48:20.545Z\"},{\"role\":\"user\",\"content\":\"trong đó có gì ?\",\"timestamp\":\"2025-05-13T13:48:30.577Z\"},{\"role\":\"assistant\",\"content\":\"Báo cáo bài tập thực hành môn Seminar chuyên đề về các thuật toán giải bài toán TSP (thuật toán chính xác và tham lam), bài toán tô màu đồ thị (thuật toán tham lam), và bài toán lập lịch (thuật toán tham lam).  Bao gồm kết quả từ nhiều file dữ liệu đầu vào khác nhau.\\n\",\"timestamp\":\"2025-05-13T13:48:32.704Z\"},{\"role\":\"user\",\"content\":\"cho tôi kết quả của hàng đầu tiên\",\"timestamp\":\"2025-05-13T13:49:10.937Z\"},{\"role\":\"assistant\",\"content\":\"177\\n\",\"timestamp\":\"2025-05-13T13:49:12.028Z\"},{\"role\":\"user\",\"content\":\"là thuật toán gì vậy \",\"timestamp\":\"2025-05-13T13:49:26.939Z\"},{\"role\":\"assistant\",\"content\":\"Dựa trên tài liệu,  đề cập đến các thuật toán: quy hoạch động, nhánh cận, tham lam, và Welsh & Powell, DSATUR.\\n\",\"timestamp\":\"2025-05-13T13:49:28.006Z\"},{\"role\":\"user\",\"content\":\"177 của thuật toán nào ? \",\"timestamp\":\"2025-05-13T13:49:39.736Z\"},{\"role\":\"assistant\",\"content\":\"177 là kết quả của việc giải bài toán TSP với file tsp_12vertex.txt bằng thuật toán quy hoạch động hoặc nhánh cận.\\n\",\"timestamp\":\"2025-05-13T13:49:40.905Z\"},{\"role\":\"user\",\"content\":\"dòng note có gì ?\",\"timestamp\":\"2025-05-13T13:50:23.563Z\"},{\"role\":\"assistant\",\"content\":\"Không có thông tin về \\\"dòng note\\\" trong tài liệu được cung cấp.\\n\",\"timestamp\":\"2025-05-13T13:50:24.936Z\"},{\"role\":\"user\",\"content\":\"note ở cuối ?\",\"timestamp\":\"2025-05-13T13:50:34.179Z\"},{\"role\":\"assistant\",\"content\":\"Không có note ở cuối tài liệu.\\n\",\"timestamp\":\"2025-05-13T13:50:36.212Z\"},{\"role\":\"user\",\"content\":\"Note thì sao ?\",\"timestamp\":\"2025-05-13T13:50:53.428Z\"},{\"role\":\"assistant\",\"content\":\"Tài liệu không đề cập đến \\\"Note\\\".\\n\",\"timestamp\":\"2025-05-13T13:50:54.267Z\"},{\"role\":\"user\",\"content\":\"vậy dòng cuối của tài liệu này là gì ?\",\"timestamp\":\"2025-05-13T13:51:10.134Z\"},{\"role\":\"assistant\",\"content\":\"johnsonb.txt 5234 john\\n\",\"timestamp\":\"2025-05-13T13:51:11.115Z\"},{\"role\":\"user\",\"content\":\"dòng cuối cùng là gì ?\",\"timestamp\":\"2025-05-13T14:39:21.832Z\"},{\"role\":\"assistant\",\"content\":\"Note: chấm 10 điểm thực hành nếu SV giải đúng từ 75% khối lượng bài tập trên.\\n\",\"timestamp\":\"2025-05-13T14:39:22.676Z\"},{\"role\":\"user\",\"content\":\"vậy nếu tôi làm được 60% bài thì được bao nhiêu điểm ?\",\"timestamp\":\"2025-05-13T14:52:09.616Z\"},{\"role\":\"assistant\",\"content\":\"Dựa trên tiêu chí chấm điểm (75% khối lượng bài tập đạt 10 điểm), 60% khối lượng bài tập sẽ đạt khoảng 8 điểm.\\n\",\"timestamp\":\"2025-05-13T14:52:11.442Z\"}]', '2025-05-13 13:48:08', '2025-05-13 14:52:11'),
(3, 47, 1, '[{\"role\":\"user\",\"content\":\"hi\",\"timestamp\":\"2025-05-14T02:06:42.686Z\"},{\"role\":\"assistant\",\"content\":\"Đây là báo cáo công nghệ phần mềm về đề tài \\\"Quản lý garage ô tô\\\" của nhóm sinh viên trường Đại học Sài Gòn, Khoa Công nghệ Thông tin.\\n\",\"timestamp\":\"2025-05-14T02:06:48.979Z\"},{\"role\":\"user\",\"content\":\"xin chao2\",\"timestamp\":\"2025-05-14T02:06:58.247Z\"},{\"role\":\"assistant\",\"content\":\"Chào bạn!\\n\",\"timestamp\":\"2025-05-14T02:06:59.328Z\"},{\"role\":\"user\",\"content\":\"hi\",\"timestamp\":\"2025-05-14T02:07:06.743Z\"},{\"role\":\"assistant\",\"content\":\"Chào bạn!\\n\",\"timestamp\":\"2025-05-14T02:07:07.413Z\"},{\"role\":\"user\",\"content\":\"tom tat noi dung van ban \",\"timestamp\":\"2025-05-14T02:07:14.499Z\"},{\"role\":\"assistant\",\"content\":\"Tóm tắt nội dung văn bản:  Đây là báo cáo công nghệ phần mềm của nhóm sinh viên Trường Đại học Sài Gòn, Khoa Công nghệ Thông tin, về đề tài \\\"Quản lý garage ô tô\\\".  Báo cáo trình bày tổng quan đề tài, phân tích hệ thống hiện trạng và đề xuất giải pháp phần mềm quản lý garage nhằm khắc phục những khó khăn trong quản lý thủ công truyền thống, nâng cao hiệu quả hoạt động và chất lượng dịch vụ.  Báo cáo bao gồm các phần:  giới thiệu, tổng quan đề tài, phân tích hệ thống (mô hình ngữ cảnh, use-case, user story, thiết kế mức ý niệm, giao diện), phân công công việc, và kết luận.\\n\",\"timestamp\":\"2025-05-14T02:07:24.688Z\"}]', '2025-05-14 02:06:42', '2025-05-14 02:07:24'),
(4, 44, 3, '[{\"role\":\"user\",\"content\":\"xin chao \",\"timestamp\":\"2025-05-15T02:38:30.140Z\"},{\"role\":\"user\",\"content\":\"hi\",\"timestamp\":\"2025-05-15T02:39:06.243Z\"},{\"role\":\"user\",\"content\":\"hi\",\"timestamp\":\"2025-05-15T02:43:35.669Z\"},{\"role\":\"assistant\",\"content\":\"Xin chào!\\n\",\"timestamp\":\"2025-05-15T02:43:36.893Z\"},{\"role\":\"user\",\"content\":\"tom tat cho toi tai lieu nay \",\"timestamp\":\"2025-05-15T02:43:50.761Z\"},{\"role\":\"assistant\",\"content\":\"Tài liệu mô tả quá trình kiểm thử tự động một trang web thương mại điện tử mô phỏng (Sauce Demo) bằng Python với Selenium trên Visual Studio Code và trình duyệt Google Chrome/Edge.  Quá trình kiểm thử bao gồm các test case về đăng nhập (thành công, thất bại do thiếu thông tin, sai thông tin), đăng xuất và thêm sản phẩm vào giỏ hàng. Tất cả các test case đều thành công.  Sử dụng Git để quản lý phiên bản.\\n\",\"timestamp\":\"2025-05-15T02:43:53.513Z\"}]', '2025-05-15 02:38:30', '2025-05-15 02:43:53'),
(5, 45, 3, '[{\"role\":\"user\",\"content\":\"hi\",\"timestamp\":\"2025-05-15T02:46:15.168Z\"},{\"role\":\"assistant\",\"content\":\"Không có thông tin liên quan đến \\\"hi\\\" trong tài liệu.\\n\",\"timestamp\":\"2025-05-15T02:46:17.658Z\"},{\"role\":\"user\",\"content\":\"hello\",\"timestamp\":\"2025-05-15T02:46:27.976Z\"},{\"role\":\"assistant\",\"content\":\"Câu hỏi không liên quan đến nội dung tài liệu.\\n\",\"timestamp\":\"2025-05-15T02:46:28.803Z\"},{\"role\":\"user\",\"content\":\"xin chao\",\"timestamp\":\"2025-05-15T02:50:52.816Z\"},{\"role\":\"assistant\",\"content\":\"Xin chào!\\n\",\"timestamp\":\"2025-05-15T02:50:53.804Z\"},{\"role\":\"user\",\"content\":\"can u speak english ?\",\"timestamp\":\"2025-05-15T02:51:15.200Z\"},{\"role\":\"assistant\",\"content\":\"Yes.\\n\",\"timestamp\":\"2025-05-15T02:51:16.090Z\"},{\"role\":\"user\",\"content\":\"hi\",\"timestamp\":\"2025-05-15T02:51:19.747Z\"},{\"role\":\"assistant\",\"content\":\"Câu hỏi \\\"hi\\\" không liên quan đến nội dung tài liệu.\\n\",\"timestamp\":\"2025-05-15T02:51:20.527Z\"},{\"role\":\"user\",\"content\":\"tai lieu gi day \",\"timestamp\":\"2025-05-15T02:54:41.118Z\"},{\"role\":\"assistant\",\"content\":\"Đây là báo cáo bài tập thực hành môn Seminar chuyên đề về các thuật toán giải quyết bài toán TSP (Traveling Salesperson Problem), tô màu đồ thị, lập lịch và tìm đường đi ngắn nhất.\\n\",\"timestamp\":\"2025-05-15T02:54:42.350Z\"}]', '2025-05-15 02:46:15', '2025-05-15 02:54:42');

-- --------------------------------------------------------

--
-- Table structure for table `documents`
--

CREATE TABLE `documents` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `filename` varchar(255) NOT NULL,
  `visibility` enum('public','private') DEFAULT 'private',
  `upload_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `category` varchar(100) DEFAULT NULL,
  `filehash` varchar(64) DEFAULT NULL,
  `view_count` int(11) DEFAULT 0,
  `download_count` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `documents`
--

INSERT INTO `documents` (`id`, `user_id`, `title`, `description`, `filename`, `visibility`, `upload_date`, `category`, `filehash`, `view_count`, `download_count`) VALUES
(44, 1, 'Báo cáo môn web', 'đây là báo cáo môn web ', '1747141931960-N7_LamKienMinh_Assignment2 (1).docx', 'public', '2025-05-13 13:12:12', 'Khác', '8cf314f5a9e145ebc5cff17f3c725f474e0a87b0129532bb8a65c6d2641edb8d', 30, 0),
(45, 1, 'asd', 'asd', '1747144080504-BÃ¡o cÃ¡o bÃ i táº­p thá»±c hÃ nh mÃ´n Seminar chuyÃªn Äá».docx', 'public', '2025-05-13 13:48:00', 'Cơ học kỹ thuật', '2657dbc648858bd3d5f12a35264b81110492b8061e38b344a0ee1da36208ad14', 22, 0),
(46, 1, 'tài liệu pdf', 'đây là test tài liệu pdf', '1747151661770-Jobber app.pdf', 'public', '2025-05-13 15:54:21', 'Xác suất thống kê', '1876588cbcdbed4ec5fe89a077796af9271c608c5a513595a2b8c5844e8fb526', 6, 0),
(47, 1, 'bao cao giua ki ', 'vd', '1747188387445-BÃO CÃO GIá»®A Ká»² Láº¦N 1 - NHÃM 5.docx', 'public', '2025-05-14 02:06:27', 'Khác', '145e8a580d06fb3b1856c65d3ba14e9f4411ae6f8e2bece5d0dd72cac02c68b3', 6, 0);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `email` varchar(255) NOT NULL,
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `email`, `username`, `password`) VALUES
(1, 'mm395@gmail.com', 'minhminh999', '$2b$10$/wo.NdIOuE2oGgNM51jFUOY.URjQkp.9OJq3TmHc/q/ubyP7lGq0i'),
(2, 'mm3951@gmail.com', 'minhminh9999', '$2b$10$MEnVp25L9Enfst6qF1h5SeMy/mlJ3tWlRPwcd.SjUfXaEP4q8kWJu'),
(3, 'm@gmail.com', 'asd123', '$2b$10$8YXlVqQRk8ylW1RbJ275XeXUCjUA80lFw.6d1uN9zNFXl2bERx87e');

-- --------------------------------------------------------

--
-- Table structure for table `user_favorites`
--

CREATE TABLE `user_favorites` (
  `user_id` int(11) NOT NULL,
  `document_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user_favorites`
--

INSERT INTO `user_favorites` (`user_id`, `document_id`, `created_at`) VALUES
(1, 47, '2025-05-14 03:01:38');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `chats`
--
ALTER TABLE `chats`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `document_id` (`document_id`,`user_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `documents`
--
ALTER TABLE `documents`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `filehash` (`filehash`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `username` (`username`);

--
-- Indexes for table `user_favorites`
--
ALTER TABLE `user_favorites`
  ADD PRIMARY KEY (`user_id`,`document_id`),
  ADD KEY `document_id` (`document_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `chats`
--
ALTER TABLE `chats`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `documents`
--
ALTER TABLE `documents`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=48;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `chats`
--
ALTER TABLE `chats`
  ADD CONSTRAINT `chats_ibfk_1` FOREIGN KEY (`document_id`) REFERENCES `documents` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `chats_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `documents`
--
ALTER TABLE `documents`
  ADD CONSTRAINT `documents_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `user_favorites`
--
ALTER TABLE `user_favorites`
  ADD CONSTRAINT `user_favorites_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `user_favorites_ibfk_2` FOREIGN KEY (`document_id`) REFERENCES `documents` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
