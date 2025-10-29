import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FiPlus, FiMoreVertical, FiAward, FiStar, FiGift, FiCalendar, FiDownload, FiFilter, FiRefreshCw, FiTrash2, FiEye, FiHome, FiEdit2, FiSettings, FiTrendingUp, FiUsers } from 'react-icons/fi';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Dropdown } from '../../components/common/Dropdown';
import { StatisticsGrid, StatisticData } from '../../components/common/StatisticsGrid';
import { Table, Column, SortDescriptor } from '../../components/common/Table';
import BaseLayout from '../../components/layout/BaseLayout';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';
import { useToast } from '../../context/ToastContext';
import { trpc } from '../../utils/trpc';
import { Loading } from '../../components/common/Loading';
import { Alert, AlertDescription, AlertTitle } from '../../components/common/Alert';
import { useTablePreferences } from '../../hooks/useTablePreferences';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/common/Tabs';

interface LoyaltyTier {
  id: string;
  name: string;
  description: string;
  minPoints: number;
  maxPoints?: number;
  color: string;
  icon?: string;
  benefits: string[];
  isActive: boolean;
  sortOrder: number;
  customerCount?: number;
  createdAt: string;
}

interface LoyaltyReward {
  id: string;
  name: string;
  description: string;
  type: 'discount' | 'free_shipping' | 'free_product' | 'cashback' | 'gift_card' | 'exclusive_access';
  pointsRequired: number;
  value?: number;
  discountType?: 'percentage' | 'fixed';
  conditions?: string;
  isActive: boolean;
  isLimited: boolean;
  totalQuantity?: number;
  remainingQuantity?: number;
  startsAt?: string;
  endsAt?: string;
  imageUrl?: string;
  redemptionCount?: number;
  createdAt: string;
}

interface LoyaltyTransaction {
  id: string;
  customer: {
    id: string;
    firstName?: string;
    lastName?: string;
    email?: string;
  };
  points: number;
  type: 'earned' | 'redeemed' | 'expired' | 'adjusted' | 'referral_bonus';
  description: string;
  order?: {
    id: string;
    orderNumber: string;
  };
  reward?: {
    id: string;
    name: string;
  };
  balanceAfter: number;
  expiresAt?: string;
  createdAt: string;
}

const LoyaltyManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslationWithBackend();
  const { addToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(() => searchParams.get('tab') || 'tiers');

  // Update URL when tab changes
  useEffect(() => {
    const newSearchParams = new URLSearchParams(searchParams);
    if (activeTab === 'tiers') {
      newSearchParams.delete('tab');
    } else {
      newSearchParams.set('tab', activeTab);
    }
    setSearchParams(newSearchParams, { replace: true });
  }, [activeTab, searchParams, setSearchParams]);

  // Loyalty Tiers state
  const { 
    data: tiersData, 
    isLoading: tiersLoading, 
    error: tiersError, 
    refetch: refetchTiers 
  } = trpc.adminLoyaltyTiers.list.useQuery({
    page: 1,
    limit: 100,
    isActive: undefined,
    sortBy: 'sortOrder',
    sortOrder: 'ASC'
  });

  // Loyalty Rewards state
  const { 
    data: rewardsData, 
    isLoading: rewardsLoading, 
    error: rewardsError, 
    refetch: refetchRewards 
  } = trpc.adminLoyaltyRewards.list.useQuery({
    page: 1,
    limit: 50,
    isActive: undefined,
    sortBy: 'sortOrder',
    sortOrder: 'ASC'
  });

  // Loyalty Transactions state
  const { 
    data: transactionsData, 
    isLoading: transactionsLoading, 
    error: transactionsError, 
    refetch: refetchTransactions 
  } = trpc.adminLoyaltyTransactions.list.useQuery({
    page: 1,
    limit: 50,
    sortBy: 'createdAt',
    sortOrder: 'DESC'
  });

  // Loyalty Stats
  const { 
    data: statsData, 
    isLoading: statsLoading 
  } = trpc.adminLoyaltyStats.get.useQuery();

  const tiers = (tiersData as any)?.data?.items || [];
  const rewards = (rewardsData as any)?.data?.items || [];
  const transactions = (transactionsData as any)?.data?.items || [];

  // Handle actions
  const handleCreateTier = () => navigate('/loyalty/tiers/create');
  const handleCreateReward = () => navigate('/loyalty/rewards/create');
  const handleEditTier = (id: string) => navigate(`/loyalty/tiers/${id}/edit`);
  const handleEditReward = (id: string) => navigate(`/loyalty/rewards/${id}/edit`);
  const handleViewTransaction = (id: string) => navigate(`/loyalty/transactions/${id}`);

  const deleteTierMutation = trpc.adminLoyaltyTiers.delete.useMutation({
    onSuccess: () => {
      addToast({ type: 'success', title: t('loyalty.tier_deleted_success') });
      refetchTiers();
    },
    onError: (error: any) => {
      addToast({ type: 'error', title: t('loyalty.tier_delete_error'), description: error?.message });
    },
  });

  const deleteRewardMutation = trpc.adminLoyaltyRewards.delete.useMutation({
    onSuccess: () => {
      addToast({ type: 'success', title: t('loyalty.reward_deleted_success') });
      refetchRewards();
    },
    onError: (error: any) => {
      addToast({ type: 'error', title: t('loyalty.reward_delete_error'), description: error?.message });
    },
  });

  const handleDeleteTier = useCallback(async (tierId: string) => {
    try {
      const ok = window.confirm(t('loyalty.tier_delete_confirm'));
      if (!ok) return;
      await deleteTierMutation.mutateAsync({ id: tierId });
    } catch (e) {
      // Error handled by mutation callbacks
    }
  }, [deleteTierMutation, t]);

  const handleDeleteReward = useCallback(async (rewardId: string) => {
    try {
      const ok = window.confirm(t('loyalty.reward_delete_confirm'));
      if (!ok) return;
      await deleteRewardMutation.mutateAsync({ id: rewardId });
    } catch (e) {
      // Error handled by mutation callbacks
    }
  }, [deleteRewardMutation, t]);

  // Tier columns
  const tierColumns: Column<LoyaltyTier>[] = useMemo(() => [
    {
      id: 'name',
      header: t('loyalty.tier_name'),
      accessor: (tier: LoyaltyTier) => (
        <div className="flex items-center space-x-3">
          <div 
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ backgroundColor: tier.color }}
          >
            {tier.icon ? (
              <span className="text-white text-sm">{tier.icon}</span>
            ) : (
              <FiStar className="w-4 h-4 text-white" />
            )}
          </div>
          <div>
            <div className="font-medium text-gray-900 dark:text-white">
              {tier.name}
            </div>
            {tier.description && (
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {tier.description}
              </div>
            )}
          </div>
        </div>
      ),
      isSortable: true,
    },
    {
      id: 'pointsRange',
      header: t('loyalty.points_range'),
      accessor: (tier: LoyaltyTier) => (
        <div className="text-sm">
          <div className="font-medium">{tier.minPoints}+ points</div>
          {tier.maxPoints && (
            <div className="text-gray-500 dark:text-gray-400">
              Up to {tier.maxPoints}
            </div>
          )}
        </div>
      ),
      isSortable: true,
    },
    {
      id: 'benefits',
      header: t('loyalty.benefits'),
      accessor: (tier: LoyaltyTier) => (
        <div className="text-sm">
          {tier.benefits.length > 0 ? (
            <div className="space-y-1">
              {tier.benefits.slice(0, 2).map((benefit, index) => (
                <div key={index} className="text-gray-700 dark:text-gray-300">
                  • {benefit}
                </div>
              ))}
              {tier.benefits.length > 2 && (
                <div className="text-gray-500 dark:text-gray-400">
                  +{tier.benefits.length - 2} more
                </div>
              )}
            </div>
          ) : (
            <span className="text-gray-500 dark:text-gray-400">No benefits</span>
          )}
        </div>
      ),
      isSortable: false,
    },
    {
      id: 'customers',
      header: t('loyalty.customers'),
      accessor: (tier: LoyaltyTier) => (
        <div className="text-sm font-medium text-gray-900 dark:text-white">
          {tier.customerCount || 0}
        </div>
      ),
      isSortable: false,
    },
    {
      id: 'status',
      header: t('common.status'),
      accessor: (tier: LoyaltyTier) => (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
          tier.isActive 
            ? 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30'
            : 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-800'
        }`}>
          {tier.isActive ? t('common.active') : t('common.inactive')}
        </span>
      ),
      isSortable: true,
    },
    {
      id: 'actions',
      header: t('common.actions'),
      accessor: (tier: LoyaltyTier) => (
        <Dropdown
          button={
            <Button variant="ghost" size="sm">
              <FiMoreVertical />
            </Button>
          }
          items={[
            {
              label: t('common.edit'),
              icon: <FiEdit2 className="w-4 h-4" />,
              onClick: () => handleEditTier(tier.id)
            },
            {
              label: t('common.delete'),
              icon: <FiTrash2 className="w-4 h-4" />,
              onClick: () => handleDeleteTier(tier.id),
              className: 'text-red-500 hover:text-red-700'
            },
          ]}
        />
      ),
      width: '80px',
    },
  ], [navigate, handleDeleteTier, t]);

  // Reward columns
  const rewardColumns: Column<LoyaltyReward>[] = useMemo(() => [
    {
      id: 'name',
      header: t('loyalty.reward_name'),
      accessor: (reward: LoyaltyReward) => (
        <div className="flex items-center space-x-3">
          {reward.imageUrl && (
            <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
              <img 
                src={reward.imageUrl} 
                alt={reward.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div>
            <div className="font-medium text-gray-900 dark:text-white">
              {reward.name}
            </div>
            {reward.description && (
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {reward.description}
              </div>
            )}
          </div>
        </div>
      ),
      isSortable: true,
    },
    {
      id: 'type',
      header: t('loyalty.reward_type'),
      accessor: (reward: LoyaltyReward) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
          {t(`loyalty.reward_types.${reward.type}`)}
        </span>
      ),
      isSortable: true,
    },
    {
      id: 'points',
      header: t('loyalty.points_required'),
      accessor: (reward: LoyaltyReward) => (
        <div className="text-sm font-medium text-gray-900 dark:text-white">
          {reward.pointsRequired.toLocaleString()} pts
        </div>
      ),
      isSortable: true,
    },
    {
      id: 'value',
      header: t('loyalty.reward_value'),
      accessor: (reward: LoyaltyReward) => (
        <div className="text-sm">
          {reward.value ? (
            <div className="font-medium">
              {reward.discountType === 'percentage' 
                ? `${reward.value}%`
                : `$${reward.value}`
              }
            </div>
          ) : (
            <span className="text-gray-500 dark:text-gray-400">-</span>
          )}
        </div>
      ),
      isSortable: true,
    },
    {
      id: 'availability',
      header: t('loyalty.availability'),
      accessor: (reward: LoyaltyReward) => (
        <div className="text-sm">
          {reward.isLimited ? (
            <div>
              <div className="font-medium">
                {reward.remainingQuantity || 0} / {reward.totalQuantity || 0}
              </div>
              <div className="text-gray-500 dark:text-gray-400">
                {Math.round((reward.remainingQuantity || 0) / (reward.totalQuantity || 1) * 100)}% left
              </div>
            </div>
          ) : (
            <span className="text-green-600 font-medium">{t('loyalty.unlimited')}</span>
          )}
        </div>
      ),
      isSortable: false,
    },
    {
      id: 'status',
      header: t('common.status'),
      accessor: (reward: LoyaltyReward) => (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
          reward.isActive 
            ? 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30'
            : 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-800'
        }`}>
          {reward.isActive ? t('common.active') : t('common.inactive')}
        </span>
      ),
      isSortable: true,
    },
    {
      id: 'actions',
      header: t('common.actions'),
      accessor: (reward: LoyaltyReward) => (
        <Dropdown
          button={
            <Button variant="ghost" size="sm">
              <FiMoreVertical />
            </Button>
          }
          items={[
            {
              label: t('common.edit'),
              icon: <FiEdit2 className="w-4 h-4" />,
              onClick: () => handleEditReward(reward.id)
            },
            {
              label: t('common.delete'),
              icon: <FiTrash2 className="w-4 h-4" />,
              onClick: () => handleDeleteReward(reward.id),
              className: 'text-red-500 hover:text-red-700'
            },
          ]}
        />
      ),
      width: '80px',
    },
  ], [navigate, handleDeleteReward, t]);

  // Transaction columns
  const transactionColumns: Column<LoyaltyTransaction>[] = useMemo(() => [
    {
      id: 'customer',
      header: t('loyalty.customer'),
      accessor: (transaction: LoyaltyTransaction) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-white">
            {transaction.customer.firstName || 'Unknown'} {transaction.customer.lastName || ''}
          </div>
          {transaction.customer.email && (
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {transaction.customer.email}
            </div>
          )}
        </div>
      ),
      isSortable: false,
    },
    {
      id: 'type',
      header: t('loyalty.transaction_type'),
      accessor: (transaction: LoyaltyTransaction) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          transaction.type === 'earned' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
          transaction.type === 'redeemed' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
          transaction.type === 'expired' ? 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200' :
          'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
        }`}>
          {t(`loyalty.transaction_types.${transaction.type}`)}
        </span>
      ),
      isSortable: true,
    },
    {
      id: 'points',
      header: t('loyalty.points'),
      accessor: (transaction: LoyaltyTransaction) => (
        <div className={`text-sm font-medium ${
          transaction.points > 0 
            ? 'text-green-600 dark:text-green-400' 
            : 'text-red-600 dark:text-red-400'
        }`}>
          {transaction.points > 0 ? '+' : ''}{transaction.points}
        </div>
      ),
      isSortable: true,
    },
    {
      id: 'description',
      header: t('loyalty.description'),
      accessor: (transaction: LoyaltyTransaction) => (
        <div className="text-sm text-gray-900 dark:text-white">
          {transaction.description}
        </div>
      ),
      isSortable: false,
    },
    {
      id: 'balance',
      header: t('loyalty.balance_after'),
      accessor: (transaction: LoyaltyTransaction) => (
        <div className="text-sm font-medium text-gray-900 dark:text-white">
          {transaction.balanceAfter.toLocaleString()} pts
        </div>
      ),
      isSortable: true,
    },
    {
      id: 'related',
      header: t('loyalty.related_to'),
      accessor: (transaction: LoyaltyTransaction) => (
        <div className="text-sm">
          {transaction.order && (
            <div>Order: {transaction.order.orderNumber}</div>
          )}
          {transaction.reward && (
            <div>Reward: {transaction.reward.name}</div>
          )}
          {!transaction.order && !transaction.reward && (
            <span className="text-gray-500 dark:text-gray-400">-</span>
          )}
        </div>
      ),
      isSortable: false,
    },
    {
      id: 'createdAt',
      header: t('common.date'),
      accessor: (transaction: LoyaltyTransaction) => (
        <div className="text-sm text-gray-900 dark:text-white">
          {new Date(transaction.createdAt).toLocaleDateString()}
        </div>
      ),
      isSortable: true,
    },
  ], [t]);

  // Statistics data
  const statisticsCards: StatisticData[] = useMemo(() => {
    if (!statsData) {
      return [
        {
          id: 'total-customers',
          title: t('loyalty.total_customers'),
          value: '0',
          icon: <FiUsers className="w-5 h-5" />,
        },
        {
          id: 'active-tiers',
          title: t('loyalty.active_tiers'),
          value: '0',
          icon: <FiAward className="w-5 h-5" />,
        },
        {
          id: 'active-rewards',
          title: t('loyalty.active_rewards'),
          value: '0',
          icon: <FiGift className="w-5 h-5" />,
        },
        {
          id: 'points-issued',
          title: t('loyalty.points_issued'),
          value: '0',
          icon: <FiTrendingUp className="w-5 h-5" />,
        },
      ];
    }

    const stats = (statsData as any)?.data || {};
    return [
      {
        id: 'total-customers',
        title: t('loyalty.total_customers'),
        value: (stats.totalCustomers || 0).toLocaleString(),
        icon: <FiUsers className="w-5 h-5" />,
      },
      {
        id: 'active-tiers',
        title: t('loyalty.active_tiers'),
        value: (stats.activeTiers || 0).toLocaleString(),
        icon: <FiAward className="w-5 h-5" />,
      },
      {
        id: 'active-rewards',
        title: t('loyalty.active_rewards'),
        value: (stats.activeRewards || 0).toLocaleString(),
        icon: <FiGift className="w-5 h-5" />,
      },
      {
        id: 'points-issued',
        title: t('loyalty.points_issued_this_month'),
        value: (stats.pointsIssuedThisMonth || 0).toLocaleString(),
        icon: <FiTrendingUp className="w-5 h-5" />,
      },
      {
        id: 'points-redeemed',
        title: t('loyalty.points_redeemed_this_month'),
        value: (stats.pointsRedeemedThisMonth || 0).toLocaleString(),
        icon: <FiGift className="w-5 h-5" />,
      },
      {
        id: 'avg-points',
        title: t('loyalty.avg_points_per_customer'),
        value: (stats.averagePointsPerCustomer || 0).toLocaleString(),
        icon: <FiStar className="w-5 h-5" />,
      },
    ];
  }, [statsData, t]);

  const actions = useMemo(() => [
    {
      label: activeTab === 'tiers' ? t('loyalty.create_tier') : 
             activeTab === 'rewards' ? t('loyalty.create_reward') : 
             t('common.refresh'),
      onClick: activeTab === 'tiers' ? handleCreateTier : 
               activeTab === 'rewards' ? handleCreateReward : 
               () => {
                 refetchTiers();
                 refetchRewards();
                 refetchTransactions();
               },
      primary: activeTab !== 'transactions',
      icon: activeTab === 'tiers' ? <FiPlus /> : 
             activeTab === 'rewards' ? <FiPlus /> : 
             <FiRefreshCw />,
    },
  ], [activeTab, handleCreateTier, handleCreateReward, refetchTiers, refetchRewards, refetchTransactions, t]);

  const breadcrumbs = useMemo(() => ([
    {
      label: t('navigation.home', 'Home'),
      href: '/',
      icon: <FiHome className="w-4 h-4" />
    },
    {
      label: t('loyalty.title'),
      icon: <FiAward className="w-4 h-4" />
    }
  ]), [t]);

  if (tiersLoading || rewardsLoading || transactionsLoading) {
    return (
      <BaseLayout
        title={t('loyalty.title', 'Loyalty Management')}
        description={t('loyalty.description', 'Manage loyalty program')}
        actions={actions}
        fullWidth={true}
        breadcrumbs={breadcrumbs}
      >
        <div className="flex items-center justify-center h-64">
          <Loading />
        </div>
      </BaseLayout>
    );
  }

  if (tiersError || rewardsError || transactionsError) {
    return (
      <BaseLayout
        title={t('loyalty.title', 'Loyalty Management')}
        description={t('loyalty.description', 'Manage loyalty program')}
        actions={actions}
        fullWidth={true}
        breadcrumbs={breadcrumbs}
      >
        <Alert variant="destructive">
          <AlertTitle>{t('common.error', 'Error')}</AlertTitle>
          <AlertDescription>
            {(tiersError as any)?.message || (rewardsError as any)?.message || (transactionsError as any)?.message}
          </AlertDescription>
        </Alert>
      </BaseLayout>
    );
  }

  return (
    <BaseLayout
      title={t('loyalty.title', 'Loyalty Management')}
      description={t('loyalty.description', 'Manage loyalty program')}
      actions={actions}
      fullWidth={true}
      breadcrumbs={breadcrumbs}
    >
      <div className="space-y-6">
        {/* Statistics Cards */}
        <StatisticsGrid
          statistics={statisticsCards}
          isLoading={statsLoading}
          skeletonCount={6}
        />

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="tiers">{t('loyalty.tiers')}</TabsTrigger>
            <TabsTrigger value="rewards">{t('loyalty.rewards')}</TabsTrigger>
            <TabsTrigger value="transactions">{t('loyalty.transactions')}</TabsTrigger>
          </TabsList>

          <TabsContent value="tiers" className="space-y-4">
            <Table<LoyaltyTier>
              columns={tierColumns}
              data={tiers}
              emptyMessage={t('loyalty.no_tiers_found')}
              emptyAction={{
                label: t('loyalty.create_tier'),
                onClick: handleCreateTier,
                icon: <FiPlus />,
              }}
              enableRowHover={true}
            />
          </TabsContent>

          <TabsContent value="rewards" className="space-y-4">
            <Table<LoyaltyReward>
              columns={rewardColumns}
              data={rewards}
              emptyMessage={t('loyalty.no_rewards_found')}
              emptyAction={{
                label: t('loyalty.create_reward'),
                onClick: handleCreateReward,
                icon: <FiPlus />,
              }}
              enableRowHover={true}
            />
          </TabsContent>

          <TabsContent value="transactions" className="space-y-4">
            <Table<LoyaltyTransaction>
              columns={transactionColumns}
              data={transactions}
              emptyMessage={t('loyalty.no_transactions_found')}
              enableRowHover={true}
            />
          </TabsContent>
        </Tabs>
      </div>
    </BaseLayout>
  );
};

export default LoyaltyManagementPage;
