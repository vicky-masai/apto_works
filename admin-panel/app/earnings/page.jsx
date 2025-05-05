"use client";

import { currencyTypes } from "@/utils/currencyTypes"
import { useState, useEffect } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { fetchEarningsData } from "@/API/api";

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
  const [earnings, setEarnings] = useState([]);
  const [summary, setSummary] = useState({
    today: 0,
    yesterday: 0,
    total: 0,
    profitPercent: 0,
    todayChange: 0,
    yesterdayChange: 0,
  });
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    from: new Date(),
    to: new Date(),
  });
  const [selectedEarning, setSelectedEarning] = useState(null);

  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        const data = await fetchEarningsData();
        setEarnings(data.earnings);
        setSummary({
          today: typeof data.summary.todayEarnings === 'string' 
            ? parseFloat(data.summary.todayEarnings.replace('{currencyTypes[0]?.symbol}', '').replace(',', '')) 
            : data.summary.todayEarnings || 0,
          yesterday: typeof data.summary.yesterdayEarnings === 'string' 
            ? parseFloat(data.summary.yesterdayEarnings.replace('{currencyTypes[0]?.symbol}', '').replace(',', '')) 
            : data.summary.yesterdayEarnings || 0,
          todayChange: data.summary.todayChange || 0,
          yesterdayChange: data.summary.yesterdayChange || 0,
          total: data.summary.total,
          profitPercent: data.summary.profitPercent,
        });
      } catch (error) {
        console.error("Error fetching earnings data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEarnings();
  }, []);

  const handleViewDetails = (earning) => {
    setSelectedEarning(earning);
  };

  const closeModal = () => {
    setSelectedEarning(null);
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
            <div className="text-2xl font-bold">{currencyTypes[0]?.symbol}{summary.today.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+{summary.todayChange}% from yesterday</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Yesterday&apos;s Earnings</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currencyTypes[0]?.symbol}{summary.yesterday.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+{summary.yesterdayChange}% from previous day</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currencyTypes[0]?.symbol}{summary.total.toLocaleString()}</div>
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
                      <TableCell>{earning.acceptedBy}</TableCell>
                      <TableCell className="text-right">{currencyTypes[0]?.symbol}{earning.taskAmount.toLocaleString()}</TableCell>
                      <TableCell className="text-right font-medium text-green-600">
                        {currencyTypes[0]?.symbol}{earning.adminProfit.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${earning.status==="Completed"?"bg-green-100 text-green-800":"bg-red-100 text-red-800"}`}>
                          {earning.status==="Completed"?"Completed":"Pending"}
                        </span>
                      </TableCell>
                      <TableCell>{format(new Date(earning.createdAt), "PPP")}</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm" onClick={() => handleViewDetails(earning)}>
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

      {/* Details Modal */}
      {console.log("sdfsdfs",selectedEarning)}

      {console.log(selectedEarning)}
      {selectedEarning && ( 
        <div className="fixed inset-0 m-auto my-auto bg-black bg-opacity-50 flex justify-center items-center">
          <div className="max-w-sm bg-white rounded-lg shadow-lg p-4 relative">
            <button onClick={closeModal} className="absolute top-0 right-0 m-4 text-gray-500 hover:text-gray-700 text-sm font-bold py-2 px-4 rounded">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h2 className="text-xl font-semibold mb-4">Task Details</h2>
            <div className="mb-4">
              <strong>Task ID:</strong> {selectedEarning?.taskId}
            </div>
            <div className="mb-4">
              <strong>Task Name:</strong> {selectedEarning?.taskName}
            </div>
            <div className="mb-4">
              <strong>Posted By:</strong> {selectedEarning?.postedBy}
            </div>
            <div className="mb-4">
              <strong>Completed By:</strong> {selectedEarning?.acceptedBy}
            </div>
            <div className="mb-4">
              <strong>Task Amount:</strong> {currencyTypes[0]?.symbol}{selectedEarning?.taskAmount.toLocaleString()}
            </div>
            <div className="mb-4">
              <strong>Admin Profit:</strong> {currencyTypes[0]?.symbol}{selectedEarning?.adminProfit.toLocaleString()}
            </div>
            <div className="mb-4">
              <strong>Status:</strong> {selectedEarning?.status}
            </div>
              <div className="mb-4">
                <strong>Date:</strong> {new Date(selectedEarning.date).toLocaleDateString()}
              </div>
          </div>
        </div>
      )}
    </div>
  );
} 