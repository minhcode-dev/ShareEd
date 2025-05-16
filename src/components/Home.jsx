import React from "react";
import Navbar from "../components/Navbar";
import Shared from "../components/SharedDocument";
import Footer from "../components/Footer";

function Home() {
  return (
    <div className="d-flex flex-column" style={{ minHeight: "100vh" }}>
      {/* Content Area */}
      <div className="flex-grow-1">
        <Navbar />
        <Shared />
      </div>
      {/* Footer */}
      <Footer />
    </div>
  );
}

export default Home;
