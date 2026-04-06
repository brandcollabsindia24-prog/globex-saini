"use client";

import React, { useState } from "react";
import Modal from "./Modal";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

type Props = {
  open: boolean;
  onClose: () => void;
  role: "brand" | "influencer";
};

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export default function AuthModal({ open, onClose, role }: Props) {
  const [mode, setMode] = useState<"register" | "login">("register");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<any>({
    resolver: zodResolver(mode === "register" ? registerSchema : loginSchema),
  });

  const onSubmit = async (data: any) => {
    const path = `/api/${role}/${mode}`;
    try {
      const res = await fetch(path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Error");
      alert(`${mode} success`);
      onClose();
    } catch (err: any) {
      alert(err.message || "Request failed");
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={role === "brand" ? "Brand Auth" : "Influencer Auth"}>
      <div>
        <div className="flex gap-2 mb-4">
          <button
            className={`px-3 py-1 rounded ${mode === "register" ? "bg-indigo-600 text-white" : "bg-gray-100"}`}
            onClick={() => setMode("register")}
          >
            Register
          </button>
          <button
            className={`px-3 py-1 rounded ${mode === "login" ? "bg-indigo-600 text-white" : "bg-gray-100"}`}
            onClick={() => setMode("login")}
          >
            Login
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          {mode === "register" && (
            <div>
              <label className="block text-sm">Name</label>
              <input className="w-full border p-2 rounded" {...register("name")} />
              <p className="text-red-500 text-sm">{errors?.name?.message as any}</p>
            </div>
          )}

          <div>
            <label className="block text-sm">Email</label>
            <input className="w-full border p-2 rounded" {...register("email")} />
            <p className="text-red-500 text-sm">{errors?.email?.message as any}</p>
          </div>

          <div>
            <label className="block text-sm">Password</label>
            <input type="password" className="w-full border p-2 rounded" {...register("password")} />
            <p className="text-red-500 text-sm">{errors?.password?.message as any}</p>
          </div>

          <div className="flex justify-end">
            <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded">
              {mode === "register" ? "Register" : "Login"}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
