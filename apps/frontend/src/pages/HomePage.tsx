import { Button, Card, CardBody, CardHeader } from '@heroui/react';

const HomePage = () => {
  const features = [
    {
      title: 'Modern React',
      description: 'Built with the latest React features and best practices.',
    },
    {
      title: 'Responsive Design',
      description: 'Works seamlessly across all devices and screen sizes.',
    },
    {
      title: 'Fast Performance',
      description: 'Optimized for speed and smooth user experience.',
    },
  ];

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="text-center py-16 px-4 bg-gradient-to-br from-blue-600 to-purple-700 rounded-3xl text-white">
        <h1 className="text-5xl font-bold mb-6">Welcome to Frontend App</h1>
        <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
          A simple and clean React frontend service for clients built with HeroUI components.
        </p>
        <Button
          size="lg"
          color="secondary"
          variant="solid"
          className="font-semibold px-8 py-3"
        >
          Get Started
        </Button>
      </div>

      {/* Features Section */}
      <div className="py-8">
        <h2 className="text-4xl font-bold text-center mb-12 text-gray-800">Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="hover:scale-105 transition-transform duration-200"
              shadow="md"
            >
              <CardHeader className="pb-2">
                <h3 className="text-xl font-semibold text-blue-600">{feature.title}</h3>
              </CardHeader>
              <CardBody className="pt-0">
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage;