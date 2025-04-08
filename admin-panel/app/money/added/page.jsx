import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

export default function AddedMoneyPage() {
  // Mock data for added money transactions
  const transactions = [
    {
      id: 1,
      userId: 1,
      userName: "John Doe",
      amount: 500,
      method: "Bank Transfer",
      reference: "REF123456",
      date: "2025-04-08",
      status: "completed",
    },
    {
      id: 2,
      userId: 2,
      userName: "Jane Smith",
      amount: 1000,
      method: "Credit Card",
      reference: "REF789012",
      date: "2025-04-07",
      status: "completed",
    },
    {
      id: 3,
      userId: 3,
      userName: "Mike Johnson",
      amount: 250,
      method: "PayPal",
      reference: "REF345678",
      date: "2025-04-06",
      status: "completed",
    },
    {
      id: 4,
      userId: 4,
      userName: "Sarah Williams",
      amount: 750,
      method: "Bank Transfer",
      reference: "REF901234",
      date: "2025-04-05",
      status: "completed",
    },
    {
      id: 5,
      userId: 5,
      userName: "David Brown",
      amount: 300,
      method: "Credit Card",
      reference: "REF567890",
      date: "2025-04-04",
      status: "completed",
    },
    {
      id: 6,
      userId: 6,
      userName: "Emily Davis",
      amount: 1500,
      method: "Bank Transfer",
      reference: "REF123789",
      date: "2025-04-03",
      status: "completed",
    },
    {
      id: 7,
      userId: 7,
      userName: "Robert Wilson",
      amount: 200,
      method: "PayPal",
      reference: "REF456012",
      date: "2025-04-02",
      status: "completed",
    },
    {
      id: 8,
      userId: 8,
      userName: "Lisa Taylor",
      amount: 650,
      method: "Credit Card",
      reference: "REF890345",
      date: "2025-04-01",
      status: "completed",
    },
  ]

  const getStatusBadge = (status) => {
    switch (status) {
      case "completed":
        return <Badge className="w-fit bg-green-500 px-3 py-1 text-white">Completed</Badge>
      case "pending":
        return (
          <Badge variant="outline" className="text-yellow-500 border-yellow-500">
            Pending
          </Badge>
        )
      case "failed":
        return <Badge variant="destructive">Failed</Badge>
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Added Money List</h1>
          <p className="text-muted-foreground">View all money added to the system</p>
        </div>
        <Button>Export Data</Button>
      </div>

      <div className="flex items-center gap-2 max-w-sm">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input type="search" placeholder="Search transactions..." className="pl-8" />
        </div>
        <Button variant="outline">Filter</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">ID</th>
                  <th className="text-left py-3 px-4 font-medium">User</th>
                  <th className="text-left py-3 px-4 font-medium">Amount</th>
                  <th className="text-left py-3 px-4 font-medium">Method</th>
                  <th className="text-left py-3 px-4 font-medium">Reference</th>
                  <th className="text-left py-3 px-4 font-medium">Date</th>
                  <th className="text-left py-3 px-4 font-medium">Status</th>
                  <th className="text-left py-3 px-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction.id} className="border-b last:border-0 hover:bg-muted/50">
                    <td className="py-3 px-4">#{transaction.id}</td>
                    <td className="py-3 px-4 font-medium">{transaction.userName}</td>
                    <td className="py-3 px-4">${transaction.amount.toFixed(2)}</td>
                    <td className="py-3 px-4">{transaction.method}</td>
                    <td className="py-3 px-4">{transaction.reference}</td>
                    <td className="py-3 px-4">{transaction.date}</td>
                    <td className="py-3 px-4">{getStatusBadge(transaction.status)}</td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
