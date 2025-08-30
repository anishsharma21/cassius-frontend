import React, { useState } from 'react';
import { useSubmitFeedback } from '../hooks/useFeedback';

const Feedback = () => {
  const [message, setMessage] = useState('');
  const [rating, setRating] = useState('');
  const [category, setCategory] = useState('general');
  const [submitted, setSubmitted] = useState(false);

  const { mutate: submitFeedback, isPending, error } = useSubmitFeedback();

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!message.trim()) {
      return;
    }

    const feedbackData = {
      message: message.trim(),
      category,
      ...(rating && { rating: parseInt(rating) })
    };

    submitFeedback(feedbackData, {
      onSuccess: () => {
        setSubmitted(true);
        setMessage('');
        setRating('');
        setCategory('general');
        setTimeout(() => setSubmitted(false), 3000);
      }
    });
  };

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Feedback</h1>
      
      {submitted && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800">Thank you for your feedback! We appreciate your input.</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
            Category
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="general">General</option>
            <option value="bug_report">Bug Report</option>
            <option value="feature_request">Feature Request</option>
            <option value="ui_ux">UI/UX</option>
            <option value="performance">Performance</option>
          </select>
        </div>

        <div>
          <label htmlFor="rating" className="block text-sm font-medium text-gray-700 mb-2">
            Rating (Optional)
          </label>
          <select
            id="rating"
            value={rating}
            onChange={(e) => setRating(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select a rating</option>
            <option value="5">5 - Excellent</option>
            <option value="4">4 - Good</option>
            <option value="3">3 - Average</option>
            <option value="2">2 - Poor</option>
            <option value="1">1 - Very Poor</option>
          </select>
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
            Your Feedback
          </label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Tell us what you think about Cassius..."
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            required
          />
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">Failed to submit feedback. Please try again.</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isPending || !message.trim()}
          className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          {isPending ? 'Submitting...' : 'Submit Feedback'}
        </button>
      </form>
    </div>
  );
};

export default Feedback;
