'use client'
import OnlyNumber from "@/Converter/onlyNumber";
import { useState } from "react";

export default function Home() {
  const [isDarkMode, setIsDarkMode] = useState(false)
  return (
    <div className="flex justify-center items-center h-screen">
        <OnlyNumber isDarkMode={false} />
    </div>
  );
}
