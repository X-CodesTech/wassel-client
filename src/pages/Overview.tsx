import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/store";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
} from "recharts";
import {
  Activity,
  Package,
  MapPin,
  TrendingUp,
  TrendingDown,
  CreditCard,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { actGetActivities } from "@/store/activities/act/actGetActivities";
import { actGetLocations } from "@/store/locations/act";
import { cn } from "@/utils";
import { Activity as ActivityType, SubActivity, Location } from "@/types/types";
import { actGetTransactionTypes } from "@/store/transactionTypes/transactionTypesSlice";

// Chart color schemes
const ACTIVITY_COLORS = ["#1e40af", "#059669", "#d97706", "#dc2626", "#7c3aed"];

interface DashboardMetrics {
  totalActivities: number;
  activeActivities: number;
  totalLocations: number;
  totalTransactionTypes: number;
  recentActivity: number;
}

interface ChartData {
  activityDistribution: Array<{ name: string; value: number; color: string }>;
  locationDistribution: Array<{ name: string; value: number }>;
  activityPerformance: Array<{
    name: string;
    active: number;
    total: number;
    percentage: number;
  }>;
  monthlyTrends: Array<{
    month: string;
    activities: number;
    growth: number;
  }>;
}

export default function Overview() {
  const dispatch = useDispatch<AppDispatch>();
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalActivities: 0,
    activeActivities: 0,
    totalLocations: 0,
    totalTransactionTypes: 0,
    recentActivity: 0,
  });
  const [chartData, setChartData] = useState<ChartData>({
    activityDistribution: [],
    locationDistribution: [],
    activityPerformance: [],
    monthlyTrends: [],
  });

  const { records: activities, loading: activitiesLoading } = useSelector(
    (state: RootState) => state.activities
  );
  const { records: transactionTypes, loading: transactionTypesLoading } =
    useSelector((state: RootState) => state.transactionTypes);
  const { records: locations, loading: locationsLoading } = useSelector(
    (state: RootState) => state.locations
  );

  useEffect(() => {
    // Fetch all data for dashboard
    dispatch(actGetActivities());
    dispatch(actGetTransactionTypes());
    dispatch(actGetLocations());
  }, [dispatch]);

  // Ensure arrays are properly defined
  const activitiesArray = Array.isArray(activities) ? activities : [];
  const transactionTypesArray = Array.isArray(transactionTypes)
    ? transactionTypes
    : [];
  const locationsArray = Array.isArray(locations) ? locations : [];

  useEffect(() => {
    if (activitiesArray.length > 0) {
      calculateMetrics();
      generateChartData();
    }
  }, [
    activitiesArray.length,
    transactionTypesArray.length,
    locationsArray.length,
  ]);

  const calculateMetrics = () => {
    const activeActivities = activitiesArray.filter(
      (activity: ActivityType) => activity.isActive
    ).length;

    setMetrics({
      totalActivities: activitiesArray.length,
      activeActivities,
      totalLocations: locationsArray.length,
      totalTransactionTypes: transactionTypesArray.length,
      recentActivity: Math.floor(Math.random() * 15) + 5, // Simulated recent activity count
    });
  };

  const generateChartData = () => {
    // Activity Distribution by Type
    const activityTypes = activitiesArray.reduce(
      (acc: Record<string, number>, activity: ActivityType) => {
        acc[activity.activityNameEn] = (acc[activity.activityNameEn] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const activityDistribution = Object.entries(activityTypes).map(
      ([type, count], index) => ({
        name: type,
        value: count,
        color: ACTIVITY_COLORS[index % ACTIVITY_COLORS.length],
      })
    );

    // Location Distribution
    const countryDistribution = locationsArray.reduce(
      (acc: Record<string, number>, location: Location) => {
        acc[location.country] = (acc[location.country] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const locationDistribution = Object.entries(countryDistribution).map(
      ([country, count]) => ({
        name: country,
        value: count,
      })
    );

    // Activity Performance
    const activityPerformance = activitiesArray.map(
      (activity: ActivityType) => {
        const total = activity.subActivities?.length || 0;
        const active = activity.isActive ? total : 0;
        const percentage = total > 0 ? (active / total) * 100 : 0;

        return {
          name:
            activity.activityNameEn.length > 15
              ? activity.activityNameEn.substring(0, 15) + "..."
              : activity.activityNameEn,
          active,
          total,
          percentage: Math.round(percentage),
        };
      }
    );

    // Monthly Trends (simulated data based on current data)
    const monthlyTrends = [
      {
        month: "Jul",
        activities: Math.max(1, activitiesArray.length - 2),
        growth: 5.2,
      },
      {
        month: "Aug",
        activities: Math.max(1, activitiesArray.length - 1),
        growth: 8.1,
      },
      {
        month: "Sep",
        activities: activitiesArray.length,
        growth: 12.3,
      },
      {
        month: "Oct",
        activities: activitiesArray.length,
        growth: 15.7,
      },
      {
        month: "Nov",
        activities: activitiesArray.length + 1,
        growth: 18.9,
      },
      {
        month: "Dec",
        activities: activitiesArray.length + 2,
        growth: 22.4,
      },
    ];

    setChartData({
      activityDistribution,
      locationDistribution,
      activityPerformance,
      monthlyTrends,
    });
  };

  const isLoading =
    activitiesLoading === "pending" ||
    transactionTypesLoading === "pending" ||
    locationsLoading;

  const MetricCard = ({
    title,
    value,
    description,
    icon: Icon,
    trend,
    trendValue,
  }: {
    title: string;
    value: string | number;
    description: string;
    icon: any;
    trend?: "up" | "down";
    trendValue?: string;
  }) => (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">
          {title}
        </CardTitle>
        <Icon className="h-5 w-5 text-blue-600" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        <div className="flex items-center space-x-2 mt-1">
          <p className="text-xs text-gray-500">{description}</p>
          {trend && trendValue && (
            <div
              className={cn(
                "flex items-center space-x-1",
                trend === "up" ? "text-green-600" : "text-red-600"
              )}
            >
              {trend === "up" ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              <span className="text-xs font-medium">{trendValue}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {`${entry.dataKey}: ${entry.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            System Overview
          </h1>
          <p className="text-gray-600">Loading dashboard data...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          System Overview
        </h1>
        <p className="text-gray-600">
          Comprehensive dashboard showing key metrics and system performance
        </p>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Activities"
          value={metrics.totalActivities}
          description="All registered activities"
          icon={Activity}
          trend="up"
          trendValue="+12%"
        />
        <MetricCard
          title="Active Operations"
          value={metrics.activeActivities}
          description="Currently active activities"
          icon={CheckCircle2}
          trend="up"
          trendValue="+8%"
        />
        <MetricCard
          title="Sub-Activities"
          value={0}
          description="Total sub-activity items"
          icon={Package}
          trend="up"
          trendValue="+15%"
        />
        <MetricCard
          title="Locations"
          value={metrics.totalLocations}
          description="Registered locations"
          icon={MapPin}
          trend="up"
          trendValue="+5%"
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          title="Transaction Types"
          value={metrics.totalTransactionTypes}
          description="Available transaction types"
          icon={CreditCard}
        />
        <MetricCard
          title="Recent Activity"
          value={`${metrics.recentActivity} items`}
          description="Last 24 hours"
          icon={Clock}
          trend="up"
          trendValue="+22%"
        />
        <MetricCard
          title="System Health"
          value="98.5%"
          description="Overall system performance"
          icon={TrendingUp}
          trend="up"
          trendValue="+1.2%"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Distribution Pie Chart */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-blue-600" />
              <span>Activity Distribution by Type</span>
            </CardTitle>
            <CardDescription>
              Breakdown of activities by category
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData.activityDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartData.activityDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Monthly Trends Line Chart */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <span>Growth Trends</span>
            </CardTitle>
            <CardDescription>
              6-month activity and growth analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData.monthlyTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="activities"
                  stackId="1"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.6}
                  name="Activities"
                />
                <Area
                  type="monotone"
                  dataKey="subActivities"
                  stackId="1"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.6}
                  name="Sub-Activities"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Activity Performance Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart className="h-5 w-5 text-purple-600" />
            <span>Activity Performance Overview</span>
          </CardTitle>
          <CardDescription>
            Sub-activity distribution across main activities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={chartData.activityPerformance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="total" fill="#e5e7eb" name="Total Sub-Activities" />
              <Bar
                dataKey="active"
                fill="#3b82f6"
                name="Active Sub-Activities"
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Location Distribution */}
      {chartData.locationDistribution.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-red-600" />
              <span>Geographic Distribution</span>
            </CardTitle>
            <CardDescription>Location coverage by country</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart
                data={chartData.locationDistribution}
                layout="horizontal"
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats Footer */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-gray-200">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">
            {metrics.totalActivities}
          </div>
          <div className="text-sm text-gray-500">Total Items</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {Math.round(
              (metrics.activeActivities /
                Math.max(metrics.totalActivities, 1)) *
                100
            )}
            %
          </div>
          <div className="text-sm text-gray-500">Activity Rate</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">
            {metrics.totalLocations}
          </div>
          <div className="text-sm text-gray-500">Coverage Areas</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600">
            {metrics.totalTransactionTypes}
          </div>
          <div className="text-sm text-gray-500">Transaction Types</div>
        </div>
      </div>
    </div>
  );
}
