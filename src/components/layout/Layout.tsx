import { ReactNode, useState, useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { motion } from "framer-motion";

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const [sidebarWidth, setSidebarWidth] = useState(240);

  useEffect(() => {
    const sidebar = document.querySelector('aside');

    if (sidebar) {
      // Dùng ResizeObserver là chuẩn nhất để theo dõi kích thước element
      const observer = new ResizeObserver((entries) => {
        for (const entry of entries) {
          // Bọc trong requestAnimationFrame để tránh lỗi "setState synchronously"
          // và lỗi "ResizeObserver loop limit exceeded"
          window.requestAnimationFrame(() => {
            setSidebarWidth(entry.contentRect.width);
          });
        }
      });

      observer.observe(sidebar);

      // Cập nhật giá trị ban đầu (cũng bọc để tránh warning ESLint)
      window.requestAnimationFrame(() => {
        setSidebarWidth(sidebar.offsetWidth);
      });

      return () => observer.disconnect();
    }
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: 'linear-gradient(hsl(var(--border)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px)',
            backgroundSize: '50px 50px'
          }}
        />
        {/* Gradient orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-[100px]" />
      </div>

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <motion.div
        initial={false}
        animate={{ marginLeft: sidebarWidth }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="min-h-screen"
      >
        <Header />
        <main className="p-6">
          {children}
        </main>
      </motion.div>
    </div>
  );
};