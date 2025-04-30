"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Loader2, Percent, Download, Filter } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Dummy data for demonstration
const dummyEarnings = [
  {
    id: "1",
    taskId: "TASK001",
    taskName: "Website Development",
    postedBy: "John Doe",
    completedBy: "Alice Smith",
    taskAmount: 5000,
    adminProfit: 500,
    date: new Date(),
    status: "Completed",
  },
  {
    id: "2",
    taskId: "TASK002",
    taskName: "Logo Design",
    postedBy: "Jane Wilson",
    completedBy: "Bob Johnson",
    taskAmount: 2000,
    adminProfit: 200,
    date: new Date(),
    status: "Pending",
  },
  // Add more dummy data as needed
];

export default function EarningsPage() {
  const [earnings] = useState(dummyEarnings);
  const [loading] = useState(false);
  const [dateRange, setDateRange] = useState({
    from: new Date(),
    to: new Date(),
  });

  const summary = {
    today: 1500,
    yesterday: 2000,
    total: 15000,
    profitPercent: 10,
  };

  return (
    <div className="lg:ml-64 p-4 md:p-8 space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Admin Earnings Dashboard</h1>
          <p className="text-muted-foreground">Current profit rate: {summary.profitPercent}%</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <DatePickerWithRange date={dateRange} setDate={setDateRange} />
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today&apos;s Earnings</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{summary.today.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+20.1% from yesterday</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Yesterday&apos;s Earnings</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{summary.yesterday.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+10.5% from previous day</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{summary.total.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Lifetime earnings</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters Section */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <Select defaultValue="all">
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="all">
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Latest First</SelectItem>
              <SelectItem value="amount-high">Amount (High to Low)</SelectItem>
              <SelectItem value="amount-low">Amount (Low to High)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Earnings Table */}
      <Card>
        <CardHeader>
          <CardTitle>Earnings History</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Task ID</TableHead>
                    <TableHead>Task Name</TableHead>
                    <TableHead>Posted By</TableHead>
                    <TableHead>Completed By</TableHead>
                    <TableHead className="text-right">Task Amount</TableHead>
                    <TableHead className="text-right">Admin Profit</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {earnings.map((earning) => (
                    <TableRow key={earning.id}>
                      <TableCell className="font-medium">{earning.taskId}</TableCell>
                      <TableCell>{earning.taskName}</TableCell>
                      <TableCell>{earning.postedBy}</TableCell>
                      <TableCell>{earning.completedBy}</TableCell>
                      <TableCell className="text-right">₹{earning.taskAmount.toLocaleString()}</TableCell>
                      <TableCell className="text-right font-medium text-green-600">
                        ₹{earning.adminProfit.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          earning.status === "Completed" 
                            ? "bg-green-100 text-green-800" 
                            : "bg-yellow-100 text-yellow-800"
                        }`}>
                          {earning.status}
                        </span>
                      </TableCell>
                      <TableCell>{format(earning.date, "PPP")}</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 