import { Card, CardBody, CardHeader } from '@heroui/react';

const AboutPage = () => {
  const values = [
    {
      title: 'Innovation',
      description: 'Constantly pushing boundaries and embracing new technologies.',
    },
    {
      title: 'Quality',
      description: 'Delivering excellence in every line of code we write.',
    },
    {
      title: 'Collaboration',
      description: 'Working together to achieve extraordinary results.',
    },
    {
      title: 'User Focus',
      description: 'Putting user experience at the center of everything we do.',
    },
  ];

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">About Us</h1>
        <p className="text-xl text-gray-600">Learn more about our mission and values</p>
      </div>

      {/* Mission Section */}
      <Card shadow="lg" className="p-4">
        <CardHeader>
          <h2 className="text-3xl font-bold text-blue-600">Our Mission</h2>
        </CardHeader>
        <CardBody>
          <p className="text-lg text-gray-700 leading-relaxed">
            We are dedicated to creating exceptional user experiences through innovative technology
            and thoughtful design. Our frontend service provides clients with modern, responsive,
            and performant web applications built with the latest technologies like React, HeroUI,
            and Tailwind CSS.
          </p>
        </CardBody>
      </Card>

      {/* Values Section */}
      <div>
        <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">Our Values</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {values.map((value, index) => (
            <Card
              key={index}
              shadow="md"
              className="hover:scale-105 transition-transform duration-200 p-2"
            >
              <CardHeader className="text-center">
                <h3 className="text-xl font-semibold text-blue-600">{value.title}</h3>
              </CardHeader>
              <CardBody className="text-center">
                <p className="text-gray-600 leading-relaxed">{value.description}</p>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
