'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardBody, CardHeader, Progress, Button, Modal, ModalContent, ModalHeader, ModalBody, Input, useDisclosure } from '@heroui/react';
import { Star, Gift, History, TrendingUp, Crown, Coins, Calendar, ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface LoyaltyBalance {
  currentPoints: number;
  lifetimePoints: number;
  tier: string;
  nextTier?: string;
  pointsToNextTier?: number;
}

interface LoyaltyTransaction {
  id: string;
  points: number;
  type: 'earned' | 'redeemed' | 'expired' | 'adjusted';
  description: string;
  orderId?: string;
  createdAt: string;
  expiresAt?: string;
}

interface LoyaltyRedeemData {
  points: number;
  description: string;
}

export const LoyaltyDashboard: React.FC = () => {
  const { user } = useAuth();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const t = useTranslations();

  const [loyaltyBalance, setLoyaltyBalance] = useState<LoyaltyBalance | null>(null);
  const [transactions, setTransactions] = useState<LoyaltyTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [redeemPoints, setRedeemPoints] = useState('');
  const [redeemDescription, setRedeemDescription] = useState('');
  const [redeeming, setRedeeming] = useState(false);

  useEffect(() => {
    fetchLoyaltyData();
  }, []);

  const fetchLoyaltyData = async () => {
    try {
      setLoading(true);

      // Fetch loyalty balance
      const balanceResponse = await fetch('/api/trpc/clientUser.getLoyaltyBalance', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (balanceResponse.ok) {
        const balanceData = await balanceResponse.json();
        setLoyaltyBalance(balanceData.result.data);
      }

      // Fetch loyalty history
      const historyResponse = await fetch('/api/trpc/clientUser.getLoyaltyHistory', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (historyResponse.ok) {
        const historyData = await historyResponse.json();
        setTransactions(historyData.result.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch loyalty data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRedeemPoints = async () => {
    if (!redeemPoints || !redeemDescription) return;

    try {
      setRedeeming(true);

      const response = await fetch('/api/trpc/clientUser.redeemLoyaltyPoints', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          points: parseInt(redeemPoints),
          description: redeemDescription,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        // Show success message
        alert(result.result.data.message);

        // Reset form and refresh data
        setRedeemPoints('');
        setRedeemDescription('');
        onClose();
        fetchLoyaltyData();
      } else {
        const error = await response.json();
        alert(error.error?.message || 'Failed to redeem points');
      }
    } catch (error) {
      console.error('Failed to redeem points:', error);
      alert('Failed to redeem points');
    } finally {
      setRedeeming(false);
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier.toLowerCase()) {
      case 'platinum': return 'text-purple-500';
      case 'gold': return 'text-yellow-500';
      case 'silver': return 'text-gray-400';
      case 'bronze': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier.toLowerCase()) {
      case 'platinum': return <Crown className="w-6 h-6 text-purple-500" />;
      case 'gold': return <Star className="w-6 h-6 text-yellow-500" />;
      case 'silver': return <Star className="w-6 h-6 text-gray-400" />;
      case 'bronze': return <Star className="w-6 h-6 text-orange-600" />;
      default: return <Star className="w-6 h-6 text-gray-600" />;
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'earned': return <Coins className="w-4 h-4 text-green-500" />;
      case 'redeemed': return <Gift className="w-4 h-4 text-blue-500" />;
      case 'expired': return <Calendar className="w-4 h-4 text-red-500" />;
      case 'adjusted': return <TrendingUp className="w-4 h-4 text-purple-500" />;
      default: return <Coins className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTransactionColor = (type: string, points: number) => {
    if (type === 'earned') return 'text-green-600';
    if (type === 'redeemed') return 'text-blue-600';
    if (type === 'expired') return 'text-red-600';
    if (points > 0) return 'text-green-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!loyaltyBalance) {
    return (
      <Card>
        <CardBody>
          <div className="text-center py-8">
            <Star className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Loyalty program not available for your account.</p>
          </div>
        </CardBody>
      </Card>
    );
  }

  const progressPercentage = loyaltyBalance.nextTier && loyaltyBalance.pointsToNextTier
    ? ((loyaltyBalance.currentPoints - (loyaltyBalance.pointsToNextTier - (loyaltyBalance.nextTier === 'Silver' ? 200 : loyaltyBalance.nextTier === 'Gold' ? 500 : 1000))) / (loyaltyBalance.nextTier === 'Silver' ? 200 : loyaltyBalance.nextTier === 'Gold' ? 300 : 500)) * 100
    : 0;

  return (
    <div className="space-y-6">
      {/* Loyalty Balance Card */}
      <Card>
        <CardHeader className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            <h3 className="text-lg font-semibold">Loyalty Points</h3>
          </div>
          {getTierIcon(loyaltyBalance.tier)}
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">
                {loyaltyBalance.currentPoints.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Current Points</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-semibold text-gray-700">
                {loyaltyBalance.lifetimePoints.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Lifetime Points</div>
            </div>
            <div className="text-center">
              <div className={`text-xl font-semibold ${getTierColor(loyaltyBalance.tier)}`}>
                {loyaltyBalance.tier}
              </div>
              <div className="text-sm text-gray-600">Current Tier</div>
            </div>
          </div>

          {loyaltyBalance.nextTier && loyaltyBalance.pointsToNextTier && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">
                  Progress to {loyaltyBalance.nextTier}
                </span>
                <span className="text-sm font-medium text-gray-900">
                  {loyaltyBalance.pointsToNextTier} points to go
                </span>
              </div>
              <Progress
                value={progressPercentage}
                className="h-2"
                color="primary"
              />
            </div>
          )}

          <div className="flex gap-2 mt-6">
            <Button
              color="primary"
              variant="solid"
              onPress={onOpen}
              className="flex-1"
            >
              <Gift className="w-4 h-4 mr-2" />
              Redeem Points
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <History className="w-5 h-5" />
            <h3 className="text-lg font-semibold">Transaction History</h3>
          </div>
        </CardHeader>
        <CardBody>
          {transactions.length === 0 ? (
            <div className="text-center py-8">
              <History className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No transactions yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    {getTransactionIcon(transaction.type)}
                    <div>
                      <div className="font-medium text-gray-900">
                        {transaction.description}
                      </div>
                      <div className="text-sm text-gray-600 flex items-center gap-2">
                        <Calendar className="w-3 h-3" />
                        {new Date(transaction.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className={`text-right ${getTransactionColor(transaction.type, transaction.points)}`}>
                    <div className="font-semibold">
                      {transaction.type === 'earned' || transaction.points > 0 ? '+' : ''}
                      {transaction.points} points
                    </div>
                    <div className="text-xs text-gray-500 capitalize">
                      {transaction.type}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      {/* Redeem Points Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="md">
        <ModalContent>
          <ModalHeader>Redeem Loyalty Points</ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Available Points:</span>
                  <span className="text-2xl font-bold text-blue-600">
                    {loyaltyBalance.currentPoints.toLocaleString()}
                  </span>
                </div>
              </div>

              <Input
                type="number"
                label="Points to Redeem"
                placeholder="Enter points amount"
                value={redeemPoints}
                onChange={(e) => setRedeemPoints(e.target.value)}
                min={1}
                max={loyaltyBalance.currentPoints}
              />

              <Input
                type="text"
                label="Description"
                placeholder="What are you redeeming for?"
                value={redeemDescription}
                onChange={(e) => setRedeemDescription(e.target.value)}
              />

              <div className="flex gap-2 pt-4">
                <Button
                  variant="light"
                  onPress={onClose}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  color="primary"
                  onPress={handleRedeemPoints}
                  className="flex-1"
                  isDisabled={!redeemPoints || !redeemDescription || redeeming}
                  isLoading={redeeming}
                >
                  Redeem Points
                </Button>
              </div>
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>
    </div>
  );
};