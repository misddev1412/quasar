import React from 'react';
import withSeo from '@admin/components/SEO/withSeo';
import { SeoData } from '@admin/hooks/useSeo';
import { Card, Typography, Avatar } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import PeopleIcon from '@mui/icons-material/People';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DescriptionIcon from '@mui/icons-material/Description';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

// Define the static SEO data for the home page
const homeSeoData: SeoData = {
  path: '/',
  title: 'Dashboard | Quasar Admin',
  description: 'Welcome to Quasar Admin Dashboard - Manage your application with ease',
  keywords: 'dashboard, admin, quasar, management',
  ogTitle: 'Quasar Admin Dashboard',
  ogDescription: 'Powerful admin dashboard for managing your application',
  ogType: 'website'
};

export const HomePage: React.FC = () => {
  // 统计卡片数据
  const stats = [
    {
      title: '总用户数',
      value: '14,231',
      change: '+12.5%',
      positive: true,
      icon: <PeopleIcon />,
      bgColor: 'bg-blue-500/90'
    },
    {
      title: '页面访问',
      value: '45,454',
      change: '+32.7%',
      positive: true,
      icon: <VisibilityIcon />,
      bgColor: 'bg-cyan-500/90'
    },
    {
      title: '内容条目',
      value: '2,540',
      change: '-4.3%',
      positive: false,
      icon: <DescriptionIcon />,
      bgColor: 'bg-amber-500/90'
    },
    {
      title: '订单数量',
      value: '1,570',
      change: '+10.2%',
      positive: true,
      icon: <ShoppingCartIcon />,
      bgColor: 'bg-emerald-500/90'
    }
  ];

  // 活跃用户数据
  const activeUsers = [
    { name: '张三', role: '管理员', status: '在线', time: '今天 09:45' },
    { name: '李四', role: '编辑', status: '在线', time: '今天 10:30' },
    { name: '王五', role: '访客', status: '离线', time: '昨天 18:20' },
    { name: '赵六', role: '用户', status: '在线', time: '今天 11:15' },
    { name: '钱七', role: '编辑', status: '离线', time: '3天前 14:30' },
  ];

  return (
    <div className="w-full p-4 sm:p-6">
      {/* 页面标题 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">仪表盘</h1>
        <p className="text-gray-500">欢迎回来！以下是您的数据概览</p>
      </div>

      {/* 统计卡片 - 使用tailwind网格布局 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-gray-100">
            <div className="p-4 flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-sm mb-1">{stat.title}</p>
                <h3 className="text-2xl font-bold mb-1">{stat.value}</h3>
                <div className={`flex items-center ${stat.positive ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {stat.positive ? (
                    <TrendingUpIcon fontSize="small" className="mr-1" />
                  ) : (
                    <TrendingDownIcon fontSize="small" className="mr-1" />
                  )}
                  <span className="text-sm">{stat.change}</span>
                </div>
              </div>
              <div className={`${stat.bgColor} w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 图表和活跃用户 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* 图表区域 */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-4 border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium">数据统计图表</h2>
            <div className="flex space-x-2">
              <span className="px-3 py-1 bg-blue-500 text-white text-sm rounded cursor-pointer shadow-sm">每日</span>
              <span className="px-3 py-1 text-sm rounded cursor-pointer hover:bg-gray-100">每周</span>
              <span className="px-3 py-1 text-sm rounded cursor-pointer hover:bg-gray-100">每月</span>
            </div>
          </div>
          <div className="bg-gray-100 rounded-lg h-[300px] flex items-center justify-center">
            <p className="text-gray-500">图表区域</p>
          </div>
        </div>

        {/* 活跃用户 */}
        <div className="bg-white rounded-lg shadow-md p-4 border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium">活跃用户</h2>
            <span className="text-blue-500 text-sm cursor-pointer hover:underline">查看全部</span>
          </div>
          <div className="space-y-3">
            {activeUsers.map((user, index) => (
              <div key={index} className="flex items-center p-2 hover:bg-gray-50 rounded-lg">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 
                  ${user.status === '在线' ? 'bg-blue-500' : 'bg-gray-400'} text-white shadow-sm`}>
                  {user.name.substring(0, 1)}
                </div>
                <div className="flex-grow">
                  <p className="font-medium">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.role} • {user.time}</p>
                </div>
                <span className={`text-xs ${user.status === '在线' ? 'text-emerald-500' : 'text-gray-500'} font-medium`}>
                  {user.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Wrap the HomePage component with SEO
export default withSeo(HomePage, homeSeoData); 