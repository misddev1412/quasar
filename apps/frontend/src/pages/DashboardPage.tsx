import { useProtectedRoute } from '../hooks/useProtectedRoute';
import { useTrpcQuery } from '../hooks/useTrpcQuery';
import { useAuth } from '../contexts/AuthContext';
import { Container } from '../components/common/Container';
import { Loading } from '../components/utility/Loading';
import { Card, CardBody, CardHeader } from '@heroui/react';
import { SEO } from '../components/utility/SEO';

const DashboardPage = () => {
  // Protect this route - requires authentication
  const { isLoading: authLoading } = useProtectedRoute({
    requireAuth: true,
  });

  const { user } = useAuth();
  const { useProducts, useOrders } = useTrpcQuery();

  // Example: Fetch user's recent orders
  const { data: orders, isLoading: ordersLoading } = useOrders();

  // Example: Fetch products
  const { data: products, isLoading: productsLoading } = useProducts({
    limit: 5,
  });

  if (authLoading || ordersLoading || productsLoading) {
    return <Loading fullScreen label="Loading dashboard..." />;
  }

  return (
    <>
      <SEO
        title="Dashboard"
        description="Manage your account and view your activity"
      />
      <Container className="py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {user?.name || 'User'}!
            </h1>
            <p className="text-gray-600 mt-2">
              Here's what's happening with your account today.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Stats Cards */}
            <Card>
              <CardBody>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Total Orders</p>
                    <p className="text-2xl font-bold">{orders?.length || 0}</p>
                  </div>
                  <div className="text-blue-600 text-3xl">📦</div>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Available Products</p>
                    <p className="text-2xl font-bold">{products?.length || 0}</p>
                  </div>
                  <div className="text-green-600 text-3xl">🛍️</div>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Account Status</p>
                    <p className="text-2xl font-bold text-green-600">Active</p>
                  </div>
                  <div className="text-green-600 text-3xl">✓</div>
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Recent Activity */}
          <div className="mt-8">
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">Recent Activity</h2>
              </CardHeader>
              <CardBody>
                {orders && orders.length > 0 ? (
                  <div className="space-y-3">
                    {orders.slice(0, 5).map((order: any, index: number) => (
                      <div
                        key={index}
                        className="flex items-center justify-between py-2 border-b last:border-0"
                      >
                        <div>
                          <p className="font-medium">Order #{order.id}</p>
                          <p className="text-sm text-gray-600">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <span
                          className={`
                            px-3 py-1 rounded-full text-sm font-medium
                            ${
                              order.status === 'completed'
                                ? 'bg-green-100 text-green-800'
                                : order.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-800'
                            }
                          `}
                        >
                          {order.status}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    No recent activity to show
                  </p>
                )}
              </CardBody>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card
                isPressable
                className="hover:scale-105 transition-transform cursor-pointer"
              >
                <CardBody className="text-center py-6">
                  <div className="text-3xl mb-2">🛒</div>
                  <p className="font-medium">Browse Products</p>
                </CardBody>
              </Card>
              <Card
                isPressable
                className="hover:scale-105 transition-transform cursor-pointer"
              >
                <CardBody className="text-center py-6">
                  <div className="text-3xl mb-2">📝</div>
                  <p className="font-medium">View Orders</p>
                </CardBody>
              </Card>
              <Card
                isPressable
                className="hover:scale-105 transition-transform cursor-pointer"
                onPress={() => window.location.href = '/profile'}
              >
                <CardBody className="text-center py-6">
                  <div className="text-3xl mb-2">👤</div>
                  <p className="font-medium">Edit Profile</p>
                </CardBody>
              </Card>
              <Card
                isPressable
                className="hover:scale-105 transition-transform cursor-pointer"
              >
                <CardBody className="text-center py-6">
                  <div className="text-3xl mb-2">⚙️</div>
                  <p className="font-medium">Settings</p>
                </CardBody>
              </Card>
            </div>
          </div>
        </Container>
    </>
  );
};

export default DashboardPage;