
// "use client";

// import React from "react";
// import { useForm } from "react-hook-form";
// import { useRouter } from "next/navigation";

// type CampaignForm = {
//   title: string;
//   niche: string;
//   budget: string;
//   location: string;
//   timeline: string;
//   description: string;
// };

// export default function CreateCampaign() {
//   const router = useRouter();

//   const {
//     register,
//     handleSubmit,
//     formState: { errors },
//   } = useForm<CampaignForm>();

//   const onSubmit = (data: CampaignForm) => {
//     console.log("Campaign Created:", data);

//     alert("Campaign Created Successfully");

//     router.push("/brand/campaign/my-campaigns");
//   };

//   return (
//     <div className="max-w-2xl mx-auto mt-16 bg-white p-6 rounded shadow">
//       <h1 className="text-2xl font-semibold mb-6">Create Campaign</h1>

//       <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

//         <div>
//           <label className="block text-sm font-medium">Campaign Title</label>
//           <input
//             {...register("title", { required: "Title required" })}
//             className="w-full border p-2 rounded"
//           />
//           {errors.title && (
//             <p className="text-red-500 text-sm">{errors.title.message}</p>
//           )}
//         </div>

//         <div>
//           <label className="block text-sm font-medium">Niche</label>
//           <input
//             {...register("niche", { required: "Niche required" })}
//             className="w-full border p-2 rounded"
//           />
//         </div>

//         <div>
//           <label className="block text-sm font-medium">Budget</label>
//           <input
//             {...register("budget", { required: "Budget required" })}
//             className="w-full border p-2 rounded"
//           />
//         </div>

//         <div>
//           <label className="block text-sm font-medium">Location</label>
//           <input
//             {...register("location")}
//             className="w-full border p-2 rounded"
//           />
//         </div>

//         <div>
//           <label className="block text-sm font-medium">Timeline</label>
//           <input
//             {...register("timeline")}
//             className="w-full border p-2 rounded"
//           />
//         </div>

//         <div>
//           <label className="block text-sm font-medium">Description</label>
//           <textarea
//             {...register("description")}
//             className="w-full border p-2 rounded"
//           />
//         </div>

//         <button
//           type="submit"
//           className="w-full bg-green-600 text-white py-2 rounded"
//         >
//           Create Campaign
//         </button>

//       </form>
//     </div>
//   );
// }















'use client'

import { useState } from 'react'

export default function CreateCampaignPage() {

  const [title, setTitle] = useState('')
  const [budget, setBudget] = useState('')
  const [description, setDescription] = useState('')

  const handleSubmit = (e: any) => {
    e.preventDefault()

    console.log({
      title,
      budget,
      description
    })
  }

  return (
    <div>

      <h1 className="text-3xl font-bold mb-6">
        Create Campaign
      </h1>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 max-w-lg"
      >

        <input
          type="text"
          placeholder="Campaign Title"
          className="border p-3 rounded"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <input
          type="number"
          placeholder="Budget"
          className="border p-3 rounded"
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
        />

        <textarea
          placeholder="Description"
          className="border p-3 rounded"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <button
          className="bg-black text-white p-3 rounded"
        >
          Create Campaign
        </button>

      </form>

    </div>
  )
}