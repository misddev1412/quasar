import { Route, Routes } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import styles from './app.module.scss';
import Layout from '../components/Layout';
import HomePage from '../page-components/HomePage';
import AboutPage from '../page-components/AboutPage';
import ContactPage from '../page-components/ContactPage';
import LoginPage from '../page-components/LoginPage';
import RegisterPage from '../page-components/RegisterPage';
import { Loading } from '../components/utility/Loading';

// Lazy load pages
const DashboardPage = lazy(() => import('../pages/DashboardPage'));
const ProfilePage = lazy(() => import('../pages/ProfilePage'));
const NotFoundPage = lazy(() => import('../pages/NotFoundPage'));

export function App() {
  return (
    <div className={styles.app}>
      <Layout>
        <Suspense fallback={<Loading fullScreen />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/account" element={<DashboardPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </Layout>
    </div>
  );
}

export default App;
