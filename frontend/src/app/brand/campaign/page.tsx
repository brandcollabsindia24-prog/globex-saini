// import Link from 'next/link'
// import React from 'react'

// export default function Page() {
//   const campaigns = [
//     { id: '1', title: 'Spring Sale' },
//     { id: '2', title: 'Summer Launch' },
//   ]

//   return (
//     <div>
//       <div className="flex items-center justify-between mb-4">
//         <h1 className="text-2xl font-bold">Campaigns</h1>
//         <Link href="/brand/campaign/create" className="bg-blue-600 text-white px-3 py-1 rounded">
//           Create
//         </Link>
//       </div>
//       <ul className="space-y-3">
//         {campaigns.map((c) => (
//           <li key={c.id} className="p-4 bg-white rounded shadow">{c.title}</li>
//         ))}
//       </ul>
//     </div>
//   )
// }










export default function CampaignsPage() {

  const campaigns = [
    {
      id: 1,
      title: "Fitness Product",
      budget: 50000,
      status: "Active"
    },
    {
      id: 2,
      title: "Mobile App Promotion",
      budget: 100000,
      status: "Completed"
    }
  ]

  return (
    <div>

      <h1 className="text-3xl font-bold mb-6">
        My Campaigns
      </h1>

      <table className="w-full bg-white shadow rounded">

        <thead className="bg-gray-200">
          <tr>
            <th className="p-3">Title</th>
            <th className="p-3">Budget</th>
            <th className="p-3">Status</th>
          </tr>
        </thead>

        <tbody>

          {campaigns.map((c) => (
            <tr key={c.id}>

              <td className="p-3">
                {c.title}
              </td>

              <td className="p-3">
                ₹{c.budget}
              </td>

              <td className="p-3">
                {c.status}
              </td>

            </tr>
          ))}

        </tbody>

      </table>

    </div>
  )
}