import React from 'react';
import { FiHelpCircle, FiBookOpen, FiMessageCircle, FiClipboard, FiLifeBuoy, FiMail, FiHome } from 'react-icons/fi';
import { Link as RouterLink } from 'react-router-dom';
import BaseLayout from '../components/layout/BaseLayout';
import { withAdminSeo } from '../components/SEO/withAdminSeo';
import { useTranslationWithBackend } from '../hooks/useTranslationWithBackend';

interface HelpResource {
  icon: React.ReactNode;
  title: string;
  description: string;
  to: string;
  external?: boolean;
}

interface HelpContactOption {
  icon: React.ReactNode;
  label: string;
  description: string;
  action: () => void;
}

const HelpPage: React.FC = () => {
  const { t } = useTranslationWithBackend();

  const supportEmail = t('help.support_email', 'support@quasar.dev');
  const documentationUrl = t('help.documentation_url', 'https://docs.quasar.dev');
  const chatUrl = t('help.chat_url', 'https://chat.quasar.dev');

  const resources: HelpResource[] = [
    {
      icon: <FiClipboard className="w-6 h-6 text-primary-500" />,
      title: t('help.resources.getting_started.title', 'Admin onboarding checklist'),
      description: t('help.resources.getting_started.description', 'Review the steps every new admin should complete to get up and running quickly.'),
      to: documentationUrl,
      external: true
    },
    {
      icon: <FiBookOpen className="w-6 h-6 text-primary-500" />,
      title: t('help.resources.guides.title', 'Guides & documentation'),
      description: t('help.resources.guides.description', 'Browse how-to articles that cover core workflows like publishing content, managing orders, and configuring integrations.'),
      to: documentationUrl,
      external: true
    },
    {
      icon: <FiMessageCircle className="w-6 h-6 text-primary-500" />,
      title: t('help.resources.support_channels.title', 'Customer-facing support channels'),
      description: t('help.resources.support_channels.description', 'Update chat widgets, hotlines, and messaging apps that customers see across the storefront.'),
      to: '/support-clients'
    },
    {
      icon: <FiLifeBuoy className="w-6 h-6 text-primary-500" />,
      title: t('help.resources.incident_playbook.title', 'Incident response playbook'),
      description: t('help.resources.incident_playbook.description', 'Follow recommended steps for communicating outages, rolling back deployments, or coordinating with engineering.'),
      to: documentationUrl,
      external: true
    }
  ];

  const contactOptions: HelpContactOption[] = [
    {
      icon: <FiMail className="w-5 h-5" />,
      label: t('help.contact.email.label', 'Email support'),
      description: t('help.contact.email.description', 'We typically reply within one business day. Please include screenshots and relevant order IDs when possible.'),
      action: () => {
        window.location.href = `mailto:${supportEmail}`;
      }
    },
    {
      icon: <FiMessageCircle className="w-5 h-5" />,
      label: t('help.contact.chat.label', 'Chat with us'),
      description: t('help.contact.chat.description', 'Reach our success team in real time during your local business hours.'),
      action: () => {
        window.open(chatUrl, '_blank', 'noopener,noreferrer');
      }
    },
    {
      icon: <FiBookOpen className="w-5 h-5" />,
      label: t('help.contact.docs.label', 'Read the documentation'),
      description: t('help.contact.docs.description', 'Search detailed feature guides, API references, and step-by-step tutorials.'),
      action: () => {
        window.open(documentationUrl, '_blank', 'noopener,noreferrer');
      }
    }
  ];

  const faqs = [
    {
      question: t('help.faq.permissions.question', 'Who can invite new teammates?'),
      answer: t('help.faq.permissions.answer', 'Only admins with the Manage Users permission can invite or deactivate teammates. Review permissions under Users → Roles to confirm.')
    },
    {
      question: t('help.faq.support_channels.question', 'Where do I change the help buttons customers see?'),
      answer: t('help.faq.support_channels.answer', 'Navigate to Support Clients to manage phone, chat, and messaging entries. Updates go live immediately across your storefront experiences.')
    },
    {
      question: t('help.faq.visibility.question', 'How do I publish maintenance messages?'),
      answer: t('help.faq.visibility.answer', 'Use Settings → Visibility to enable maintenance banners or coordinate with site content editors for more detailed announcements.')
    }
  ];

  return (
    <BaseLayout
      title={t('help.title', 'Help & Support')}
      description={t('help.description', 'Find resources, troubleshooting guides, and ways to contact our support team.')}
      breadcrumbs={[
        {
          label: t('navigation.home', 'Home'),
          href: '/',
          icon: <FiHome className="w-4 h-4" />
        },
        {
          label: t('help.title', 'Help & Support'),
          icon: <FiHelpCircle className="w-4 h-4" />
        }
      ]}
    >
      <div className="space-y-8">
        <section className="grid gap-6 xl:grid-cols-3">
          <div className="space-y-6 xl:col-span-2">
            <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 shadow-sm">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-wide text-primary-600 font-semibold">
                    {t('help.banner.subtitle', 'Stay confident running day-to-day operations')}
                  </p>
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mt-2">
                    {t('help.banner.title', 'Everything you need to keep your team unblocked')}
                  </h2>
                  <p className="mt-3 text-gray-600 dark:text-gray-400">
                    {t('help.banner.description', 'From onboarding to advanced workflows, these resources help your administrators support customers without waiting on engineering.')}
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={() => window.open(documentationUrl, '_blank', 'noopener,noreferrer')}
                    className="inline-flex items-center justify-center rounded-xl bg-primary-600 hover:bg-primary-700 text-white px-4 py-2.5 font-semibold transition-colors"
                  >
                    <FiBookOpen className="w-4 h-4 mr-2" />
                    {t('help.banner.cta_docs', 'Open documentation')}
                  </button>
                  <button
                    type="button"
                    onClick={() => window.location.href = `mailto:${supportEmail}`}
                    className="inline-flex items-center justify-center rounded-xl border border-primary-200 dark:border-primary-800 text-primary-700 dark:text-primary-300 px-4 py-2.5 font-semibold hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                  >
                    <FiMail className="w-4 h-4 mr-2" />
                    {t('help.banner.cta_email', 'Email support')}
                  </button>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                {t('help.resources.title', 'Most requested resources')}
              </h3>
              <div className="grid gap-4 md:grid-cols-2">
                {resources.map((resource, index) => (
                  resource.external ? (
                    <a
                      key={index}
                      href={resource.to}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5 shadow-sm hover:border-primary-500 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary-50 dark:bg-primary-900/30 mb-4">
                        {resource.icon}
                      </div>
                      <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100 group-hover:text-primary-600">
                        {resource.title}
                      </h4>
                      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        {resource.description}
                      </p>
                    </a>
                  ) : (
                    <RouterLink
                      key={index}
                      to={resource.to}
                      className="group rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5 shadow-sm hover:border-primary-500 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary-50 dark:bg-primary-900/30 mb-4">
                        {resource.icon}
                      </div>
                      <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100 group-hover:text-primary-600">
                        {resource.title}
                      </h4>
                      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        {resource.description}
                      </p>
                    </RouterLink>
                  )
                ))}
              </div>
            </div>
          </div>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                <FiLifeBuoy className="w-5 h-5 mr-2 text-primary-500" />
                {t('help.contact.title', 'Need extra help?')}
              </h3>
              <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                {t('help.contact.description', 'Connect with the Quasar support team however it works best for you.')}
              </p>

              <div className="mt-5 space-y-3">
                {contactOptions.map((option, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={option.action}
                    className="w-full text-left rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 hover:border-primary-500 hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-center text-sm font-semibold text-gray-900 dark:text-gray-100">
                      <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-900/30 mr-3 text-primary-600">
                        {option.icon}
                      </span>
                      {option.label}
                    </div>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                      {option.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-primary-100 dark:border-primary-900/40 bg-primary-50 dark:bg-primary-900/10 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-primary-900 dark:text-primary-100">
                {t('help.success_manager.title', 'Work with your customer success manager')}
              </h3>
              <p className="mt-3 text-sm text-primary-900/80 dark:text-primary-100/80">
                {t('help.success_manager.description', 'Schedule quarterly reviews, align on adoption goals, and surface feedback directly to our product teams.')}
              </p>
              <button
                type="button"
                onClick={() => window.open(chatUrl, '_blank', 'noopener,noreferrer')}
                className="mt-4 inline-flex items-center justify-center rounded-lg bg-primary-600 hover:bg-primary-700 text-white px-3 py-2 text-sm font-semibold"
              >
                <FiMessageCircle className="w-4 h-4 mr-2" />
                {t('help.success_manager.cta', 'Message success team')}
              </button>
            </div>
          </aside>
        </section>

        <section>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            {t('help.faq.title', 'Common questions')}
          </h3>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5 shadow-sm"
              >
                <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                  {faq.question}
                </h4>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </BaseLayout>
  );
};

export default withAdminSeo(HelpPage, {
  title: 'Help & Support | Quasar Admin',
  description: 'Access documentation, contact support, and keep your administrators productive.',
  path: '/help'
});
