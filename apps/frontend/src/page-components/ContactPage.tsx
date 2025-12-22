'use client';

import { useState } from 'react';
import { Card, CardBody, CardHeader, Input, Textarea, Button } from '@heroui/react';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Thank you for your message! We will get back to you soon.');
    setFormData({ name: '', email: '', message: '' });
  };

  const contactInfo = [
    { label: 'Email', value: 'contact@frontendapp.com' },
    { label: 'Phone', value: '+1 (555) 123-4567' },
    { label: 'Address', value: '123 Tech Street\nSan Francisco, CA 94105' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Contact Us</h1>
        <p className="text-xl text-gray-600">Get in touch with our team</p>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Contact Info */}
        <Card shadow="md">
          <CardHeader>
            <h2 className="text-2xl font-semibold text-blue-600">Get in Touch</h2>
          </CardHeader>
          <CardBody className="space-y-6">
            {contactInfo.map((info, index) => (
              <div key={index}>
                <h3 className="text-lg font-medium text-gray-800 mb-2">{info.label}</h3>
                <p className="text-gray-600 whitespace-pre-line">{info.value}</p>
              </div>
            ))}
          </CardBody>
        </Card>

        {/* Contact Form */}
        <Card shadow="md">
          <CardHeader>
            <h2 className="text-2xl font-semibold text-blue-600">Send us a Message</h2>
          </CardHeader>
          <CardBody>
            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                type="text"
                name="name"
                label="Name"
                placeholder="Enter your name"
                value={formData.name}
                onChange={handleChange}
                required
                variant="bordered"
              />
              <Input
                type="email"
                name="email"
                label="Email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
                variant="bordered"
              />
              <Textarea
                name="message"
                label="Message"
                placeholder="Enter your message"
                value={formData.message}
                onChange={handleChange}
                required
                variant="bordered"
                minRows={4}
              />
              <Button type="submit" color="primary" size="lg" className="w-full font-semibold">
                Send Message
              </Button>
            </form>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default ContactPage;
