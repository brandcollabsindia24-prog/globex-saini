'use client'

import Link from 'next/link'

export default function Sidebar() {
  return (
    <div className="w-64 bg-black text-white p-6">

      <h2 className="text-2xl font-bold mb-8">
        Brand Panel
      </h2>

      <nav className="flex flex-col gap-4">

        <Link href="/brand/dashboard">
          Dashboard
        </Link>

        <Link href="/brand/campaigns">
          Campaigns
        </Link>

        <Link href="/brand/campaigns/create">
          Create Campaign
        </Link>

        <Link href="/brand/influencers">
          Influencers
        </Link>

        <Link href="/brand/applications">
          Applications
        </Link>

        <Link href="/brand/messages">
          Messages
        </Link>

        <Link href="/brand/settings">
          Settings
        </Link>

      </nav>

    </div>
  )
}