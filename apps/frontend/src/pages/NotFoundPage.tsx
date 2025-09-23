import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@heroui/react';
import { SEO } from '../components/utility/SEO';
import {
  HiOutlineHome,
  HiOutlineShoppingBag,
  HiOutlineExclamation,
  HiOutlineSearch,
  HiOutlineArrowLeft
} from 'react-icons/hi';

const NotFoundPage = () => {
  const navigate = useNavigate();

  const popularCategories = [
    { name: 'Electronics', path: '/categories/electronics' },
    { name: 'Fashion', path: '/categories/fashion' },
    { name: 'Home & Garden', path: '/categories/home-garden' },
    { name: 'Sports', path: '/categories/sports' },
  ];

  return (
    <>
      <SEO
        title="Page Not Found - 404"
        description="The page you're looking for doesn't exist. Browse our products or return to homepage."
      />

      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl w-full">
          <div className="text-center">
            {/* 404 Illustration */}
            <div className="relative mb-8">
              <div className="flex justify-center items-center">
                <div className="relative">
                  {/* Large 404 Text */}
                  <h1 className="text-9xl font-bold text-gray-200 select-none">404</h1>

                  {/* Overlay Icon */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-primary-100 rounded-full p-8">
                      <HiOutlineExclamation className="w-20 h-20 text-primary-500" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Error Message */}
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Oops! Page Not Found
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              The page you're looking for seems to have gone on a shopping spree and hasn't returned.
              Let's get you back on track!
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button
                color="primary"
                size="lg"
                onPress={() => navigate('/')}
                startContent={<HiOutlineHome className="text-xl" />}
                className="font-semibold"
              >
                Go to Homepage
              </Button>

              <Button
                variant="bordered"
                size="lg"
                onPress={() => navigate('/products')}
                startContent={<HiOutlineShoppingBag className="text-xl" />}
                className="font-semibold"
              >
                Browse Products
              </Button>

              <Button
                variant="flat"
                size="lg"
                onPress={() => navigate(-1)}
                startContent={<HiOutlineArrowLeft className="text-xl" />}
                className="font-semibold"
              >
                Go Back
              </Button>
            </div>

            {/* Search Suggestion */}
            <div className="mb-12">
              <div className="max-w-md mx-auto">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search for products..."
                    className="w-full px-4 py-3 pl-12 pr-4 text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.currentTarget.value) {
                        navigate(`/search?q=${encodeURIComponent(e.currentTarget.value)}`);
                      }
                    }}
                  />
                  <HiOutlineSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
                </div>
              </div>
            </div>

            {/* Popular Categories */}
            <div className="border-t border-gray-200 pt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Popular Categories
              </h3>
              <div className="flex flex-wrap justify-center gap-3">
                {popularCategories.map((category) => (
                  <Link
                    key={category.name}
                    to={category.path}
                    className="px-6 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700 font-medium transition-colors duration-200"
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Help Section */}
            <div className="mt-12 p-6 bg-blue-50 rounded-lg max-w-2xl mx-auto">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Need Help?
              </h3>
              <p className="text-gray-600 mb-4">
                If you believe this is a mistake or need assistance, please don't hesitate to contact us.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/contact"
                  className="text-primary-600 hover:text-primary-700 font-medium"
                >
                  Contact Support
                </Link>
                <span className="hidden sm:inline text-gray-400">•</span>
                <Link
                  to="/help"
                  className="text-primary-600 hover:text-primary-700 font-medium"
                >
                  Help Center
                </Link>
                <span className="hidden sm:inline text-gray-400">•</span>
                <Link
                  to="/faq"
                  className="text-primary-600 hover:text-primary-700 font-medium"
                >
                  FAQ
                </Link>
              </div>
            </div>

            {/* Fun Facts */}
            <div className="mt-8 text-sm text-gray-500">
              <p>Fun fact: 404 is the HTTP status code for "Not Found"</p>
              <p className="mt-1">But don't worry, there are thousands of products that can be found!</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default NotFoundPage;