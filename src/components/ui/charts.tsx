
// Create missing charts components referenced in Analytics.tsx
import React from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

interface LineChartProps {
  data: any[];
  xKey: string;
  lines: {
    key: string;
    color: string;
    name?: string;
  }[];
  height?: number;
}

export const LineChartComponent: React.FC<LineChartProps> = ({ data, xKey, lines, height = 300 }) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={xKey} />
        <YAxis />
        <Tooltip />
        <Legend />
        {lines.map((line, index) => (
          <Line 
            key={index}
            type="monotone" 
            dataKey={line.key} 
            stroke={line.color} 
            name={line.name || line.key} 
            activeDot={{ r: 8 }} 
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
};

interface BarChartProps {
  data: any[];
  xKey: string;
  bars: {
    key: string;
    color: string;
    name?: string;
  }[];
  height?: number;
}

export const BarChartComponent: React.FC<BarChartProps> = ({ data, xKey, bars, height = 300 }) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={xKey} />
        <YAxis />
        <Tooltip />
        <Legend />
        {bars.map((bar, index) => (
          <Bar 
            key={index} 
            dataKey={bar.key} 
            fill={bar.color} 
            name={bar.name || bar.key} 
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
};

interface PieChartProps {
  data: {
    name: string;
    value: number;
    color: string;
  }[];
  height?: number;
}

export const PieChartComponent: React.FC<PieChartProps> = ({ data, height = 300 }) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => `${value}`} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

interface AreaChartProps {
  data: any[];
  xKey: string;
  areas: {
    key: string;
    color: string;
    name?: string;
  }[];
  height?: number;
}

export const AreaChartComponent: React.FC<AreaChartProps> = ({ data, xKey, areas, height = 300 }) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={xKey} />
        <YAxis />
        <Tooltip />
        <Legend />
        {areas.map((area, index) => (
          <Area 
            key={index} 
            type="monotone" 
            dataKey={area.key} 
            fill={area.color} 
            stroke={area.color}
            name={area.name || area.key} 
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
};
