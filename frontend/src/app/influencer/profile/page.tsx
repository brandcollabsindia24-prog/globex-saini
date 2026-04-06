"use client";

import { useForm } from "react-hook-form";

export default function ProfilePage() {
  const { register, handleSubmit } = useForm();

  const onSubmit = (data: any) => {
    console.log(data);
    alert("Profile updated");
  };

  return (
    <div className="max-w-lg mx-auto mt-10">

      <h1 className="text-3xl font-bold mb-6">
        Influencer Profile
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

        <input
          {...register("instagram")}
          placeholder="Instagram Link"
          className="w-full border p-2 rounded"
        />

        <input
          {...register("youtube")}
          placeholder="YouTube Channel"
          className="w-full border p-2 rounded"
        />

        <input
          {...register("followers")}
          placeholder="Followers Count"
          className="w-full border p-2 rounded"
        />

        <input
          {...register("niche")}
          placeholder="Niche (Fashion, Tech etc)"
          className="w-full border p-2 rounded"
        />

        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-2 rounded"
        >
          Save Profile
        </button>

      </form>
    </div>
  );
}