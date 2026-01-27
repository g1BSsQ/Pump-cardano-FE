"use client";

import { ReactNode, useState, useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { motion } from "framer-motion";

interface AppShellProps {
  children: ReactNode;
}

export const AppShell = ({ children }: AppShellProps) => {
  const [sidebarWidth, setSidebarWidth] = useState(240); // Giá trị mặc định an toàn

  useEffect(() => {
    const sidebar = document.querySelector('aside');
    
    if (!sidebar) return;

    // CÁCH SỬA 1: Sử dụng ResizeObserver (Tối ưu hơn MutationObserver cho việc theo dõi kích thước)
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        // requestAnimationFrame giúp tránh lỗi "ResizeObserver loop limit exceeded" 
        // và đảm bảo cập nhật state mượt mà, không gây cascading render
        window.requestAnimationFrame(() => {
          setSidebarWidth(entry.contentRect.width);
        });
      }
    });

    observer.observe(sidebar);

    // CÁCH SỬA 2: Xử lý giá trị khởi tạo
    // Bọc trong setTimeout hoặc requestAnimationFrame để phá vỡ chuỗi render đồng bộ
    // Giúp React hoàn tất render lần đầu trước khi set state lần 2
    const initialUpdate = window.requestAnimationFrame(() => {
        if (sidebar) {
            setSidebarWidth(sidebar.offsetWidth);
        }
    });

    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(initialUpdate);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: 'linear-gradient(hsl(var(--border)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px)',
            backgroundSize: '50px 50px'
          }}
        />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-[100px]" />
      </div>

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content với Animation */}
      <motion.div
        initial={false} // Tắt animation lúc mới load trang để tránh giật layout
        animate={{ marginLeft: sidebarWidth }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="min-h-screen relative z-10"
      >
        <Header />
        <main className="p-6">
          {children}
        </main>
      </motion.div>
    </div>
  );
};