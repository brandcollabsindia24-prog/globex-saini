"use client";

import React from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
};

export default function Modal({ open, onClose, children, title }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-lg max-w-md w-full p-6 z-10">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">{title || "Auth"}</h3>
          <button onClick={onClose} className="text-gray-600">Close</button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
}
