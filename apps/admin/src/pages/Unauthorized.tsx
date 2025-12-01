import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiLock, FiHome, FiArrowLeft } from 'react-icons/fi';
import SeoHead from '../components/SEO/SeoHead';
import { SeoData } from '../hooks/useSeo';

export const Unauthorized: React.FC = () => {
  const navigate = useNavigate();
  
  // Define static SEO data for unauthorized page
  const seoData: SeoData = {
    path: '/unauthorized',
    title: 'Không có quyền truy cập | Quasar Admin',
    description: 'Bạn không có quyền truy cập vào trang này.',
    ogTitle: 'Không có quyền truy cập',
    ogDescription: 'Bạn không có quyền truy cập vào trang này.',
    ogType: 'website'
  };

  return (
    <>
      <SeoHead data={seoData} />
      
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          {/* Icon */}
          <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
            <FiLock className="w-10 h-10 text-red-600" />
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Không có quyền truy cập
          </h1>
          
          {/* Description */}
          <p className="text-gray-600 mb-8 leading-relaxed">
            Xin lỗi, bạn không có quyền truy cập vào trang này. 
            Vui lòng liên hệ quản trị viên nếu bạn cần quyền truy cập.
          </p>
          
          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
            >
              <FiArrowLeft className="w-5 h-5" />
              Quay lại
            </button>
            
            <Link 
              to="/" 
              className="flex items-center justify-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-lg transition-colors"
            >
              <FiHome className="w-5 h-5" />
              Về trang chủ
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Unauthorized;



