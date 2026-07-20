"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface LoadingButtonProps {
  children: React.ReactNode;
  onClick?: () => Promise<void> | void;
  className?: string;
}

export default function LoadingButton({ children, onClick, className }: LoadingButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    if (!onClick) return;
    setLoading(true);
    await Promise.resolve(onClick());
    setLoading(false);
  }

  return (
    <Button className={className} disabled={loading} onClick={handleClick}>
      {loading ? "Loading..." : children}
    </Button>
  );
}
