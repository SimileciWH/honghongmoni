"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen, Loader2, Plus } from "lucide-react";

interface Article {
  slug: string;
  title: string;
  summary: string;
}

export default function BlogPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const response = await fetch("/api/blog");
      const data = await response.json();
      if (data.success) {
        setArticles(data.data);
      }
    } catch (error) {
      console.error("获取文章列表失败:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateArticle = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch("/api/blog", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ action: "generate" })
      });
      const data = await response.json();
      
      if (data.success) {
        // 刷新文章列表
        await fetchArticles();
      } else {
        console.error("生成文章失败:", data.error);
      }
    } catch (error) {
      console.error("生成文章失败:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      {/* 顶部导航 */}
      <header className="bg-white border-b border-gray-200 p-4 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-pink-500" />
              <h1 className="text-lg font-bold text-gray-800">恋爱攻略</h1>
            </div>
          </div>
          <Button
            onClick={handleGenerateArticle}
            disabled={isGenerating}
            size="sm"
            className="bg-pink-500 hover:bg-pink-600 text-white"
          >
            {isGenerating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            <span className="ml-1">AI生成</span>
          </Button>
        </div>
      </header>

      {/* 文章列表 */}
      <main className="max-w-2xl mx-auto p-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-pink-500 animate-spin" />
            <p className="mt-3 text-sm text-gray-500">加载中...</p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-500 text-center mb-6">
              学会这些沟通技巧，让你们的感情更甜蜜
            </p>
            
            {articles.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-gray-500 mb-4">暂无文章</p>
                <Button onClick={handleGenerateArticle} className="bg-pink-500">
                  生成第一篇文章
                </Button>
              </div>
            ) : (
              articles.map((article) => (
                <Link key={article.slug} href={`/blog/${article.slug}`}>
                  <Card className="p-4 bg-white hover:shadow-md transition-all cursor-pointer active:scale-[0.98]">
                    <h2 className="text-base font-semibold text-gray-800 mb-2">
                      {article.title}
                    </h2>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {article.summary}
                    </p>
                    <div className="mt-3 text-xs text-pink-500">
                      点击阅读全文 →
                    </div>
                  </Card>
                </Link>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
}
