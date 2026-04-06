"use client";

import { useRouter } from "next/navigation";

export default function CampaignsPage() {
  const router = useRouter();

  const campaigns = [
    { id: 1, title: "Fashion Campaign", budget: "₹10,000" },
    { id: 2, title: "Tech Product Promotion", budget: "₹15,000" },
  ];

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold mb-6">Available Campaigns</h1>

      <div className="grid gap-6">

        {campaigns.map((campaign) => (
          <div key={campaign.id} className="border p-6 rounded shadow">

            <h2 className="text-xl font-semibold">
              {campaign.title}
            </h2>

            <p className="text-gray-600 mb-3">
              Budget: {campaign.budget}
            </p>

            <button
              onClick={() =>
                router.push(`/influencer/campaigns/${campaign.id}`)
              }
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              View Details
            </button>

          </div>
        ))}

      </div>
    </div>
  );
}