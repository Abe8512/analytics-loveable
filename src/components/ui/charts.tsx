
import React from 'react';
import {
  LineChart as RechartsLineChart,
  BarChart as RechartsBarChart,
  AreaChart as RechartsAreaChart,
  PieChart as RechartsPieChart,
  Line,
  Bar,
  Area,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
  ResponsiveContainer
} from 'recharts';

// Common chart colors
const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

interface ChartProps {
  data: any[];
  height?: number;
}

// Bar Chart
interface BarChartProps extends ChartProps {
  xField: string;
  yField: string;
  barColor?: string;
}

export const BarChart: React.FC<BarChartProps> = ({
  data,
  xField,
  yField,
  barColor = '#4f46e5',
  height = 300
}) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsBarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={xField} />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey={yField} fill={barColor} />
      </RechartsBarChart>
    </ResponsiveContainer>
  );
};

// Line Chart
interface LineChartProps extends ChartProps {
  xField: string;
  yField: string;
  lineColor?: string;
}

export const LineChart: React.FC<LineChartProps> = ({
  data,
  xField,
  yField,
  lineColor = '#10b981',
  height = 300
}) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsLineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={xField} />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey={yField} stroke={lineColor} activeDot={{ r: 8 }} />
      </RechartsLineChart>
    </ResponsiveContainer>
  );
};

// Area Chart
interface AreaChartProps extends ChartProps {
  xField: string;
  yField: string;
  areaColor?: string;
  lineColor?: string;
}

export const AreaChart: React.FC<AreaChartProps> = ({
  data,
  xField,
  yField,
  areaColor = 'rgba(79, 70, 229, 0.2)',
  lineColor = '#4f46e5',
  height = 300
}) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsAreaChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={xField} />
        <YAxis />
        <Tooltip />
        <Legend />
        <Area type="monotone" dataKey={yField} stroke={lineColor} fill={areaColor} />
      </RechartsAreaChart>
    </ResponsiveContainer>
  );
};

// Pie Chart
interface PieChartProps extends ChartProps {
  nameField: string;
  valueField: string;
  colors?: string[];
}

export const PieChart: React.FC<PieChartProps> = ({
  data,
  nameField,
  valueField,
  colors = COLORS,
  height = 300
}) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsPieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          dataKey={valueField}
          nameKey={nameField}
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </RechartsPieChart>
    </ResponsiveContainer>
  );
};
