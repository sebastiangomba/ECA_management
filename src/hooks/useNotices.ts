import { useState } from "react";

import type { Notice } from "../types/app";

export function useNotices() {
  const [notices, setNotices] = useState<Notice[]>([]);

  const pushNotice = (type: Notice["type"], message: string) => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setNotices((current) => [...current, { id, type, message }]);

    window.setTimeout(() => {
      setNotices((current) => current.filter((notice) => notice.id !== id));
    }, 3200);
  };

  return { notices, pushNotice };
}
