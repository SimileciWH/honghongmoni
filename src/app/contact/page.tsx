"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, Copy, Mail, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const contactEmail = "feedback@ai-smilion.tech";

export default function ContactPage() {
  const [copied, setCopied] = useState(false);

  const copyEmail = async () => {
    await navigator.clipboard.writeText(contactEmail);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-white to-rose-50">
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link
            href="/"
            className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div className="flex items-center gap-2">
            <MessageCircle className="w-6 h-6 text-pink-500" />
            <h1 className="text-lg font-bold text-gray-800">联系我们</h1>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        <Card className="p-6 bg-white shadow-sm">
          <div className="flex flex-col items-center text-center gap-4">
            <div className="w-14 h-14 rounded-full bg-pink-100 flex items-center justify-center">
              <Mail className="w-7 h-7 text-pink-500" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-gray-800">有问题或建议？</h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                欢迎把使用体验、功能建议或遇到的问题发给我们。
              </p>
            </div>
            <div className="w-full rounded-xl border border-pink-100 bg-pink-50 px-4 py-3 text-sm font-medium text-pink-700">
              {contactEmail}
            </div>
            <Button
              type="button"
              onClick={copyEmail}
              className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
            >
              {copied ? (
                <Check className="w-4 h-4 mr-2" />
              ) : (
                <Copy className="w-4 h-4 mr-2" />
              )}
              {copied ? "已复制邮箱" : "复制邮箱地址"}
            </Button>
          </div>
        </Card>
      </main>
    </div>
  );
}
