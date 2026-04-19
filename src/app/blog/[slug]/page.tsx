"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen, Loader2, Home } from "lucide-react";

interface Article {
  slug: string;
  title: string;
  content: string;
  publishedAt: string;
}

export default function ArticlePage() {
  const params = useParams();
  const slug = params.slug as string;
  const [article, setArticle] = useState<Article | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (slug) {
      fetchArticle();
    }
  }, [slug]);

  const fetchArticle = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch("/api/blog", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ slug })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setArticle(data.data);
      } else {
        setError(data.error || "文章不存在");
      }
    } catch (err) {
      setError("加载文章失败，请重试");
      console.error("获取文章失败:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      {/* 顶部导航 */}
      <header className="bg-white border-b border-gray-200 p-4 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/blog">
              <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-pink-500" />
              <span className="text-sm text-gray-600">恋爱攻略</span>
            </div>
          </div>
          <Link href="/">
            <Button variant="ghost" size="icon" className="rounded-full">
              <Home className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </header>

      {/* 文章内容 */}
      <main className="max-w-2xl mx-auto p-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin"></div>
              <div className="absolute inset-2 border-4 border-rose-200 border-b-rose-400 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.2s' }}></div>
            </div>
            <p className="mt-4 text-sm text-gray-500">正在生成文章...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20">
            <p className="text-gray-500 mb-4">{error}</p>
            <Button onClick={fetchArticle} variant="outline">
              重试
            </Button>
          </div>
        ) : article ? (
          <article className="bg-white rounded-2xl p-6 shadow-sm">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">
              {article.title}
            </h1>
            <div className="prose prose-gray max-w-none">
              {article.content.split("\n\n").map((paragraph, index) => (
                <p key={index} className="text-gray-700 leading-relaxed mb-4">
                  {paragraph}
                </p>
              ))}
            </div>
            <div className="mt-8 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-400 text-center">
                来自哄哄模拟器 · 恋爱攻略
              </p>
            </div>
          </article>
        ) : null}
      </main>

      {/* 底部推荐 */}
      {!isLoading && !error && (
        <div className="max-w-2xl mx-auto p-4 pb-8">
          <div className="bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl p-4 text-white text-center">
            <p className="text-sm font-medium mb-2">想学习更多沟通技巧？</p>
            <Link href="/">
              <Button variant="secondary" size="sm" className="bg-white text-pink-600 hover:bg-pink-50">
                去游戏中练习
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
