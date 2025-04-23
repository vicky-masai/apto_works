"use client"

import Layout from "@/components/Layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, DollarSign, CheckCircle, AlertCircle } from "lucide-react"

export default function DashboardPage() {
  const stats = [
    {
      title: "Total Users",
      value: "1,234",
      change: "+12%",
      icon: Users,
      trend: "up",
    },
    {
      title: "Total Deposits",
      value: "₹45,678",
      change: "+23%",
      icon: DollarSign,
      trend: "up",
    },
    {
      title: "Completed Tasks",
      value: "890",
      change: "+8%",
      icon: CheckCircle,
      trend: "up",
    },
    {
      title: "Pending Approvals",
      value: "23",
      change: "-5%",
      icon: AlertCircle,
      trend: "down",
    },
  ]

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.title}
                  </CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className={`text-xs ${
                    stat.trend === "up" ? "text-green-600" : "text-red-600"
                  }`}>
                    {stat.change} from last month
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Deposits</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3].map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">User{i + 1}</p>
                      <p className="text-sm text-gray-500">2 hours ago</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-green-600">+₹1,000</p>
                      <p className="text-sm text-gray-500">UPI Payment</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3].map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">Task{i + 1}</p>
                      <p className="text-sm text-gray-500">Completed by User{i + 1}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">₹500</p>
                      <p className="text-sm text-gray-500">1 hour ago</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  )
} 