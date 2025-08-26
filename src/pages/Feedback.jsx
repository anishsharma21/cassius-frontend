import React, { useState } from 'react';
import PageHeader from '../components/PageHeader';
import Tooltip from '../components/Tooltip';

const Feedback = () => {
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    feedbackType: 'general',
    rating: 5,
    message: '',
    allowContact: true
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically send the feedback to your backend
    console.log('Feedback submitted:', formData);
    // Reset form after submission
    setFormData({
      name: '',
      company: '',
      email: '',
      feedbackType: 'general',
      rating: 5,
      message: '',
      allowContact: true
    });
    alert('Thank you for your feedback!');
  };

  return (
    <div className="p-6 bg-white min-h-screen">
      <PageHeader
        title="Feedback"
        subtitle="Share your thoughts and help us improve"
      />
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name, Company and Email */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-900 mb-2">
                Name (Optional)
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Your name"
              />
            </div>
            <div>
              <label htmlFor="company" className="block text-sm font-medium text-gray-900 mb-2">
                Company (Optional)
              </label>
              <input
                type="text"
                id="company"
                name="company"
                value={formData.company}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Your company"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-2">
                Email (Optional)
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="your.email@example.com"
              />
            </div>
          </div>

          {/* Feedback Type */}
          <div>
            <label htmlFor="feedbackType" className="block text-sm font-medium text-gray-900 mb-2">
              Type of Feedback
            </label>
            <select
              id="feedbackType"
              name="feedbackType"
              value={formData.feedbackType}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="general">General Feedback</option>
              <option value="bug">Bug Report</option>
              <option value="feature">Feature Request</option>
              <option value="improvement">Improvement Suggestion</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Overall Rating
            </label>
            <div className="flex items-center space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, rating: star }))}
                  className={`text-2xl ${
                    star <= formData.rating ? 'text-yellow-400' : 'text-gray-300'
                  } hover:text-yellow-400 transition-colors`}
                >
                  ★
                </button>
              ))}
              <span className="ml-2 text-sm text-gray-600">
                {formData.rating} out of 5
              </span>
            </div>
          </div>

          {/* Message */}
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-900 mb-2">
              Your Feedback
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              rows={6}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
              placeholder="Please share your thoughts, suggestions, or report any issues you've encountered..."
            />
          </div>

          {/* Contact Permission */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="allowContact"
              name="allowContact"
              checked={formData.allowContact}
              onChange={handleInputChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="allowContact" className="ml-2 block text-sm text-gray-700">
              Allow us to contact you about this feedback (if you provided contact information)
            </label>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <Tooltip text="Please write some feedback in the message field above to enable this button">
              <button
                type="submit"
                disabled={!formData.message.trim()}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Submit Feedback
              </button>
            </Tooltip>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Feedback;
