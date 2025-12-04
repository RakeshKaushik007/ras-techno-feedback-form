import { useState } from 'react';
import { useForm } from 'react-hook-form@7.55.0';
import { Send, Sparkles, MessageSquare, TrendingUp, Users } from 'lucide-react';
import { FeedbackSuccess } from './FeedbackSuccess';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface FeedbackFormData {
  name: string;
  email: string;
  company: string;
  categories: string[];
  suggestion: string;
  rating: number;
  contactMe: boolean;
  subscribe: boolean;
}

interface PublicFeedbackFormProps {
  features: Record<string, boolean>;
}

export function PublicFeedbackForm({ features }: PublicFeedbackFormProps) {
  const [submitted, setSubmitted] = useState(false);
  const [submittedData, setSubmittedData] = useState<FeedbackFormData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<FeedbackFormData>({
    defaultValues: {
      categories: [],
      rating: 0,
      contactMe: false,
      subscribe: false,
    }
  });

  const rating = watch('rating');
  const categories = watch('categories');

  const onSubmit = async (data: FeedbackFormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-4e760034/feedback`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify(data),
        }
      );

      const result = await response.json();
      
      if (result.success) {
        console.log('Feedback submitted successfully:', result);
        setSubmittedData(data);
        setSubmitted(true);
      } else {
        console.error('Failed to submit feedback:', result);
        alert('Failed to submit feedback. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRatingClick = (value: number) => {
    setValue('rating', value);
  };

  const toggleCategory = (category: string) => {
    const currentCategories = categories || [];
    if (currentCategories.includes(category)) {
      setValue('categories', currentCategories.filter(c => c !== category));
    } else {
      setValue('categories', [...currentCategories, category]);
    }
  };

  if (submitted && submittedData) {
    return <FeedbackSuccess data={submittedData} onBackToForm={() => setSubmitted(false)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl mb-6 shadow-lg">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Help RaS Techno Grow – Share Your Ideas With Us!
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            At RaS Techno, we believe growth comes from listening to the community.
            Your suggestions can help us innovate, improve, and serve businesses better.
          </p>
        </div>

        {/* What We'd Love to Know */}
        {features.showWhatWeWantSection !== false && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
            <h2 className="mb-6 flex items-center gap-2">
              <MessageSquare className="w-6 h-6 text-blue-600" />
              We'd Love to Know:
            </h2>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 flex-shrink-0" />
                <span className="text-gray-700">What new services or solutions should RaS Techno explore?</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-600 mt-2 flex-shrink-0" />
                <span className="text-gray-700">How can we improve our consultancy experience?</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 flex-shrink-0" />
                <span className="text-gray-700">What trends or technologies do you think we should adopt?</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-600 mt-2 flex-shrink-0" />
                <span className="text-gray-700">Any other ideas that could help us grow together.</span>
              </li>
            </ul>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          {/* Basic Info Section */}
          {features.showBasicInfo !== false && (
            <div className="mb-8">
              <h3 className="mb-1">Your Information</h3>
              <p className="text-gray-500 mb-6">Optional – feel free to remain anonymous</p>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-gray-700 mb-2">
                    Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    {...register('name')}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    {...register('email')}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <div className="mt-6">
                <label htmlFor="company" className="block text-gray-700 mb-2">
                  Company / Role
                </label>
                <input
                  id="company"
                  type="text"
                  {...register('company')}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Company name or your role"
                />
              </div>
            </div>
          )}

          {features.showBasicInfo !== false && <div className="border-t border-gray-100 my-8" />}

          {/* Suggestion Categories */}
          {features.showCategories !== false && (
            <div className="mb-8">
              <h3 className="mb-1">Suggestion Category</h3>
              <p className="text-gray-500 mb-6">Select all that apply</p>
              
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { value: 'services', label: 'Services we should add', icon: TrendingUp },
                  { value: 'consultancy', label: 'Improvements in consultancy', icon: Users },
                  { value: 'technology', label: 'Technology adoption ideas', icon: Sparkles },
                  { value: 'general', label: 'General feedback', icon: MessageSquare },
                ].map((category) => {
                  const Icon = category.icon;
                  const isSelected = categories?.includes(category.value);
                  return (
                    <button
                      key={category.value}
                      type="button"
                      onClick={() => toggleCategory(category.value)}
                      className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        isSelected ? 'bg-blue-600' : 'bg-gray-100'
                      }`}>
                        <Icon className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-gray-600'}`} />
                      </div>
                      <span className={isSelected ? 'text-blue-900' : 'text-gray-700'}>
                        {category.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {features.showCategories !== false && <div className="border-t border-gray-100 my-8" />}

          {/* Open-Ended Suggestion */}
          <div className="mb-8">
            <label htmlFor="suggestion" className="block mb-2">
              <h3 className="inline">Share Your Suggestion or Idea</h3>
              <span className="text-red-500 ml-1">*</span>
            </label>
            <p className="text-gray-500 mb-4">Tell us your thoughts in detail</p>
            <textarea
              id="suggestion"
              {...register('suggestion', { required: 'Please share your suggestion' })}
              rows={6}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
              placeholder="Share your ideas, suggestions, or feedback here..."
            />
            {errors.suggestion && (
              <p className="text-red-500 mt-2">{errors.suggestion.message}</p>
            )}
          </div>

          <div className="border-t border-gray-100 my-8" />

          {/* Rating */}
          {features.showRating !== false && (
            <div className="mb-8">
              <h3 className="mb-1">Rate Your Perception of RaS Techno</h3>
              <p className="text-gray-500 mb-4">Optional – help us understand your experience</p>
              
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleRatingClick(star)}
                    className="group transition-transform hover:scale-110"
                  >
                    <svg
                      className={`w-10 h-10 transition-colors ${
                        star <= rating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'fill-none text-gray-300 group-hover:text-yellow-200'
                      }`}
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  </button>
                ))}
                {rating > 0 && (
                  <span className="ml-3 text-gray-600 flex items-center">
                    {rating} / 5
                  </span>
                )}
              </div>
            </div>
          )}

          {features.showRating !== false && <div className="border-t border-gray-100 my-8" />}

          {/* Engagement Options */}
          {features.showEngagementOptions !== false && (
            <div className="mb-8">
              <h3 className="mb-6">Stay Connected</h3>
              
              <div className="space-y-4">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    {...register('contactMe')}
                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 mt-0.5 cursor-pointer"
                  />
                  <div>
                    <span className="text-gray-900 group-hover:text-blue-600 transition-colors">
                      Would you like to be contacted about your suggestion?
                    </span>
                    <p className="text-gray-500">
                      We may reach out to discuss your ideas further
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    {...register('subscribe')}
                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 mt-0.5 cursor-pointer"
                  />
                  <div>
                    <span className="text-gray-900 group-hover:text-blue-600 transition-colors">
                      Subscribe to updates and newsletters
                    </span>
                    <p className="text-gray-500">
                      Stay informed about RaS Techno's latest innovations
                    </p>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                Submit Your Suggestions
              </>
            )}
          </button>
        </form>

        {/* Footer Note */}
        <p className="text-center text-gray-500 mt-8">
          Thank you for helping RaS Techno grow and innovate together! 🚀
        </p>
      </div>
    </div>
  );
}
