import Navbar from "@/components/Navbar";
import LoginCard from "@/components/LoginCard";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <LoginCard />
      <Footer />
    </div>
  );
};

export default Index;
