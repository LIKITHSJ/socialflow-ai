import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Dashboard Title */}
      <h2 className="text-2xl font-semibold">Dashboard</h2>

      {/* Metrics Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Total Followers</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">12,450</CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Engagement Rate</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">4.8%</CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Posts Scheduled</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">8</CardContent>
        </Card>
      </div>

      {/* Chart Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Engagement Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full h-64 bg-gray-200 rounded-md flex items-center justify-center text-gray-500">
            Chart Placeholder
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Scheduled Posts */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Scheduled Posts</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            <li className="p-3 bg-gray-100 rounded">Instagram Reel — Tomorrow 9:00 AM</li>
            <li className="p-3 bg-gray-100 rounded">YouTube Video — Friday 6:00 PM</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
