"use client";

import { useParams } from "next/navigation";

export default function CampaignDetails() {
  const params = useParams();

  const applyCampaign = () => {
    alert("Application submitted!");
  };

  return (
    <div className="p-10">

      <h1 className="text-3xl font-bold mb-4">
        Campaign Details
      </h1>

      <p className="mb-2">
        Campaign ID: {params.id}
      </p>

      <p className="mb-4 text-gray-600">
        This campaign is for promoting a brand product on Instagram.
      </p>

      <p className="mb-6">
        Budget: ₹10,000
      </p>

      <button
        onClick={applyCampaign}
        className="bg-green-600 text-white px-6 py-2 rounded"
      >
        Apply for Campaign
      </button>

    </div>
  );
}