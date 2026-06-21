"use client";

import { useEffect } from "react";

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // オフライン対応ができない環境でもアプリ自体は通常通り動作させる
      });
    }
  }, []);

  return null;
}
