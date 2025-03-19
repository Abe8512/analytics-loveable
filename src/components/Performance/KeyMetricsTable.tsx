
import React, { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DateRange } from "react-day-picker";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  TrendingUp, 
  TrendingDown,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Download,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Mock data
const metrics = [
  { 
    id: 1, 
    metric: "Total Calls", 
    daily: 15, 
    weekly: 76, 
    monthly: 315, 
    trend: 8,
    benchmark: 300,
    status: "above"
  },
  { 
    id: 2, 
    metric: "Avg Call Duration", 
    daily: "8.2 min", 
    weekly: "7.5 min", 
    monthly: "7.8 min", 
    trend: 2,
    benchmark: "8.0 min",
    status: "on-track"
  },
  { 
    id: 3, 
    metric: "Success Rate", 
    daily: "65%", 
    weekly: "72%", 
    monthly: "68%", 
    trend: 5,
    benchmark: "70%",
    status: "on-track"
  },
  { 
    id: 4, 
    metric: "Conversion Rate", 
    daily: "22%", 
    weekly: "34%", 
    monthly: "32%", 
    trend: 12,
    benchmark: "40%",
    status: "below"
  },
  { 
    id: 5, 
    metric: "Talk-to-Listen Ratio", 
    daily: "45:55", 
    weekly: "42:58", 
    monthly: "44:56", 
    trend: -3,
    benchmark: "40:60",
    status: "below"
  },
];

type SortKey = "metric" | "daily" | "weekly" | "monthly" | "trend" | "benchmark" | "status";
type SortDirection = "asc" | "desc";

interface KeyMetricsTableProps {
  dateRange: DateRange | undefined;
}

const KeyMetricsTable = ({ dateRange }: KeyMetricsTableProps) => {
  const [sortKey, setSortKey] = useState<SortKey>("metric");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [searchTerm, setSearchTerm] = useState("");
  
  const handleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };
  
  const sortedMetrics = useMemo(() => 
    [...metrics]
      .filter(metric => metric.metric.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => {
        if (sortDirection === "asc") {
          return a[sortKey] > b[sortKey] ? 1 : -1;
        } else {
          return a[sortKey] < b[sortKey] ? 1 : -1;
        }
      }),
    [searchTerm, sortKey, sortDirection]
  );
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case "above":
        return "text-green-500";
      case "on-track":
        return "text-amber-500";
      case "below":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3">
          <div>
            <CardTitle>Key Metrics</CardTitle>
            <CardDescription className="mt-1">
              Key performance indicators
            </CardDescription>
          </div>
          
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search metrics..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 h-9 w-[180px]"
              />
            </div>
            <Button variant="outline" size="icon" className="h-9 w-9">
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="rounded-md border max-h-[300px] overflow-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-background z-10">
              <TableRow>
                <TableHead 
                  className="cursor-pointer"
                  onClick={() => handleSort("metric")}
                >
                  <div className="flex items-center">
                    Metric
                    {sortKey === "metric" ? (
                      sortDirection === "asc" ? (
                        <ArrowUp className="ml-1 h-3 w-3" />
                      ) : (
                        <ArrowDown className="ml-1 h-3 w-3" />
                      )
                    ) : (
                      <ArrowUpDown className="ml-1 h-3 w-3 opacity-50" />
                    )}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer text-right"
                  onClick={() => handleSort("daily")}
                >
                  <div className="flex items-center justify-end">
                    Daily
                    {sortKey === "daily" ? (
                      sortDirection === "asc" ? (
                        <ArrowUp className="ml-1 h-3 w-3" />
                      ) : (
                        <ArrowDown className="ml-1 h-3 w-3" />
                      )
                    ) : (
                      <ArrowUpDown className="ml-1 h-3 w-3 opacity-50" />
                    )}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer text-right"
                  onClick={() => handleSort("weekly")}
                >
                  <div className="flex items-center justify-end">
                    Weekly
                    {sortKey === "weekly" ? (
                      sortDirection === "asc" ? (
                        <ArrowUp className="ml-1 h-3 w-3" />
                      ) : (
                        <ArrowDown className="ml-1 h-3 w-3" />
                      )
                    ) : (
                      <ArrowUpDown className="ml-1 h-3 w-3 opacity-50" />
                    )}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer text-right"
                  onClick={() => handleSort("trend")}
                >
                  <div className="flex items-center justify-end">
                    Trend
                    {sortKey === "trend" ? (
                      sortDirection === "asc" ? (
                        <ArrowUp className="ml-1 h-3 w-3" />
                      ) : (
                        <ArrowDown className="ml-1 h-3 w-3" />
                      )
                    ) : (
                      <ArrowUpDown className="ml-1 h-3 w-3 opacity-50" />
                    )}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer"
                  onClick={() => handleSort("status")}
                >
                  <div className="flex items-center">
                    Status
                    {sortKey === "status" ? (
                      sortDirection === "asc" ? (
                        <ArrowUp className="ml-1 h-3 w-3" />
                      ) : (
                        <ArrowDown className="ml-1 h-3 w-3" />
                      )
                    ) : (
                      <ArrowUpDown className="ml-1 h-3 w-3 opacity-50" />
                    )}
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedMetrics.map((item) => (
                <TableRow key={item.id} className="h-12">
                  <TableCell><strong>{item.metric}</strong></TableCell>
                  <TableCell className="text-right">{item.daily}</TableCell>
                  <TableCell className="text-right">{item.weekly}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end">
                      {item.trend >= 0 ? (
                        <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                      ) : (
                        <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
                      )}
                      <span className={item.trend >= 0 ? "text-green-500" : "text-red-500"}>
                        {item.trend >= 0 ? "+" : ""}{item.trend}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      item.status === "above" 
                        ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" 
                        : item.status === "on-track" 
                          ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400" 
                          : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                    }`}>
                      {item.status === "above" && "Above Target"}
                      {item.status === "on-track" && "On Track"}
                      {item.status === "below" && "Below Target"}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
              {sortedMetrics.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                    No metrics match your search
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default React.memo(KeyMetricsTable);
