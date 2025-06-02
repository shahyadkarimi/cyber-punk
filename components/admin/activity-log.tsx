import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ActivityItem {
  id: number
  action: string
  user: string
  time: string
  status: "success" | "warning" | "error"
}

const activityData: ActivityItem[] = [
  {
    id: 1,
    action: "New backlink created",
    user: "admin",
    time: "2 minutes ago",
    status: "success",
  },
  {
    id: 2,
    action: "User login",
    user: "admin",
    time: "15 minutes ago",
    status: "success",
  },
  {
    id: 3,
    action: "Failed login attempt",
    user: "unknown",
    time: "1 hour ago",
    status: "error",
  },
  {
    id: 4,
    action: "Settings updated",
    user: "admin",
    time: "3 hours ago",
    status: "success",
  },
  {
    id: 5,
    action: "Database backup",
    user: "system",
    time: "6 hours ago",
    status: "warning",
  },
]

export function ActivityLog() {
  return (
    <Card className="border-gray-800 bg-gray-900/50 text-white">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activityData.map((item) => (
            <div key={item.id} className="flex items-start gap-4 rounded-lg border border-gray-800 bg-black p-3">
              <div
                className={`mt-0.5 h-2 w-2 rounded-full ${
                  item.status === "success"
                    ? "bg-green-500"
                    : item.status === "warning"
                      ? "bg-yellow-500"
                      : "bg-red-500"
                }`}
              />
              <div className="flex-1">
                <p className="font-medium text-white">{item.action}</p>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <span>{item.user}</span>
                  <span>•</span>
                  <span>{item.time}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
