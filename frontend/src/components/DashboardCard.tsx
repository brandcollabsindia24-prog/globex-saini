type Props = {
  title: string
  value: number
}

export default function DashboardCard({ title, value }: Props) {
  return (
    <div className="bg-white p-6 rounded-lg shadow">

      <h3 className="text-gray-500">
        {title}
      </h3>

      <p className="text-3xl font-bold mt-2">
        {value}
      </p>

    </div>
  )
}