import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Button,
  Alert,
  Chip,
} from '@mui/material';
import {
  People,
  Warning,
  CheckCircle,
  Block,
  TrendingUp,
  PlayArrow,
} from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { customerService } from "../services/customerService";
import { dunningService } from "../services/dunningService";
import NotifyCustomerJSON from './NotifyCustomerJSON';

import { getStatusColor } from '../utils/constants';

const StatCard = ({ title, value, icon, color, subtitle }) => (
  <Card elevation={3} sx={{ height: '100%', borderLeft: `4px solid ${color}` }}>
    <CardContent>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {title}
          </Typography>
          <Typography variant="h4" fontWeight="bold">
            {value}
          </Typography>
          {subtitle && (
            <Typography variant="caption" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
        <Box
          sx={{
            backgroundColor: `${color}20`,
            borderRadius: '50%',
            p: 2,
            display: 'flex',
          }}
        >
          {icon}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const DunningDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCustomers: 0,
    overdueCustomers: 0,
    activeCustomers: 0,
    barredCustomers: 0,
  });
  const [statusData, setStatusData] = useState([]);
  const [overdueData, setOverdueData] = useState([]);
  const [executing, setExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [customers, overdueCustomers] = await Promise.all([
        customerService.getAllCustomers({ limit: 1000 }),
        dunningService.getOverdueCustomers(),
      ]);

      // Calculate statistics
      const statusCounts = customers.reduce((acc, customer) => {
        acc[customer.dunning_status] = (acc[customer.dunning_status] || 0) + 1;
        return acc;
      }, {});

      setStats({
        totalCustomers: customers.length,
        overdueCustomers: overdueCustomers.length,
        activeCustomers: statusCounts.ACTIVE || 0,
        barredCustomers: statusCounts.BARRED || 0,
      });

      // Prepare chart data
      const statusChartData = Object.keys(statusCounts).map((status) => ({
        name: status,
        value: statusCounts[status],
        color: getStatusColor(status),
      }));

      setStatusData(statusChartData);

      // Overdue days distribution
      const overdueBuckets = {
        '0-5 days': 0,
        '6-10 days': 0,
        '11-15 days': 0,
        '16-20 days': 0,
        '20+ days': 0,
      };

      overdueCustomers.forEach((customer) => {
        const days = customer.overdue_days;
        if (days <= 5) overdueBuckets['0-5 days']++;
        else if (days <= 10) overdueBuckets['6-10 days']++;
        else if (days <= 15) overdueBuckets['11-15 days']++;
        else if (days <= 20) overdueBuckets['16-20 days']++;
        else overdueBuckets['20+ days']++;
      });

      const overdueChartData = Object.keys(overdueBuckets).map((bucket) => ({
        name: bucket,
        count: overdueBuckets[bucket],
      }));

      setOverdueData(overdueChartData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTriggerDunning = async () => {
    setExecuting(true);
    setExecutionResult(null);
    try {
      const result = await dunningService.triggerDunningAll();
      setExecutionResult(result);
      fetchDashboardData(); // Refresh data
    } catch (error) {
      console.error('Error triggering dunning:', error);
      setExecutionResult({ error: 'Failed to execute dunning process' });
    } finally {
      setExecuting(false);
    }
  };

  if (loading) {
    return (
      <Box className="loading-container">
        <CircularProgress size={60} />
      </Box>
    );
  }

  const COLORS = ['#4caf50', '#ff9800', '#ff5722', '#f44336', '#2196f3'];

  return (
    <Box className="fade-in">
      <Box mb={3} display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h4" fontWeight="bold">
          Dashboard Overview
        </Typography>
        <Button
          variant="contained"
          size="large"
          startIcon={executing ? <CircularProgress size={20} color="inherit" /> : <PlayArrow />}
          onClick={handleTriggerDunning}
          disabled={executing}
        >
          {executing ? 'Executing...' : 'Trigger Dunning'}
        </Button>
      </Box>

      {executionResult && (
        <Alert
          severity={executionResult.error ? 'error' : 'success'}
          sx={{ mb: 3 }}
          onClose={() => setExecutionResult(null)}
        >
          {executionResult.error ? (
            executionResult.error
          ) : (
            <Box>
              <Typography variant="body2" fontWeight="bold">
                Dunning executed successfully!
              </Typography>
              <Typography variant="caption">
                Processed: {executionResult.total_customers} | Success: {executionResult.successful} | 
                Failed: {executionResult.failed} | Skipped: {executionResult.skipped}
              </Typography>
            </Box>
          )}
        </Alert>
      )}

      {/* Statistics Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Customers"
            value={stats.totalCustomers}
            icon={<People sx={{ fontSize: 40, color: '#2196f3' }} />}
            color="#2196f3"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Overdue Customers"
            value={stats.overdueCustomers}
            icon={<Warning sx={{ fontSize: 40, color: '#ff9800' }} />}
            color="#ff9800"
            subtitle="Requires attention"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Customers"
            value={stats.activeCustomers}
            icon={<CheckCircle sx={{ fontSize: 40, color: '#4caf50' }} />}
            color="#4caf50"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Barred Customers"
            value={stats.barredCustomers}
            icon={<Block sx={{ fontSize: 40, color: '#f44336' }} />}
            color="#f44336"
          />
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Customer Status Distribution
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Overdue Days Distribution
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={overdueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#ff9800" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <NotifyCustomerJSON />
    </Box>
  );
};

export default DunningDashboard;
