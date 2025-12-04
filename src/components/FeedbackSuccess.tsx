import { CheckCircle, Mail, ArrowLeft, Sparkles } from 'lucide-react';

interface FeedbackSuccessProps {
  data: {
    name: string;
    email: string;
    company: string;
    categories: string[];
    suggestion: string;
    rating: number;
    contactMe: boolean;
    subscribe: boolean;
  };
  onBackToForm: () => void;
}

export function FeedbackSuccess({ data, onBackToForm }: FeedbackSuccessProps) {
  const categoryLabels: Record<string, string> = {
    services: 'Services we should add',
    consultancy: 'Improvements in consultancy',
    technology: 'Technology adoption ideas',
    general: 'General feedback',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Success Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 md:p-12 text-center">
          {/* Success Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full mb-6 animate-bounce">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>

          {/* Thank You Message */}
          <h1 className="mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Thank You for Your Feedback!
          </h1>
          
          <p className="text-gray-600 mb-8 max-w-xl mx-auto">
            Your suggestions are incredibly valuable to us. We've received your feedback and our team will carefully review it to help RaS Techno grow and serve you better.
          </p>

          {/* Confirmation Details */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 mb-8 text-left">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-blue-600" />
              <h3>What's Next?</h3>
            </div>
            
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">✓</span>
                <span>Your feedback has been recorded and will be reviewed by our team</span>
              </li>
              {data.contactMe && data.email && (
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 mt-1">✓</span>
                  <span>We'll reach out to <span className="text-blue-600">{data.email}</span> to discuss your suggestions</span>
                </li>
              )}
              {data.subscribe && (
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 mt-1">✓</span>
                  <span>You'll receive updates and newsletters about RaS Techno's innovations</span>
                </li>
              )}
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">✓</span>
                <span>We're committed to implementing community-driven improvements</span>
              </li>
            </ul>
          </div>

          {/* Submission Summary */}
          {(data.name || data.categories.length > 0 || data.rating > 0) && (
            <div className="border-t border-gray-100 pt-6 mb-8 text-left">
              <h3 className="mb-4 text-center">Your Submission Summary</h3>
              
              <div className="space-y-3 text-gray-600">
                {data.name && (
                  <div>
                    <span className="text-gray-500">Name:</span>{' '}
                    <span className="text-gray-900">{data.name}</span>
                  </div>
                )}
                {data.company && (
                  <div>
                    <span className="text-gray-500">Company/Role:</span>{' '}
                    <span className="text-gray-900">{data.company}</span>
                  </div>
                )}
                {data.categories.length > 0 && (
                  <div>
                    <span className="text-gray-500">Categories:</span>{' '}
                    <div className="flex flex-wrap gap-2 mt-2">
                      {data.categories.map((cat) => (
                        <span
                          key={cat}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full"
                        >
                          {categoryLabels[cat]}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {data.rating > 0 && (
                  <div>
                    <span className="text-gray-500">Rating:</span>{' '}
                    <span className="text-yellow-500">
                      {'★'.repeat(data.rating)}{'☆'.repeat(5 - data.rating)}
                    </span>
                    <span className="text-gray-900 ml-2">({data.rating}/5)</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Email Confirmation Note */}
          {data.email && (
            <div className="flex items-center justify-center gap-2 text-gray-600 mb-8 p-4 bg-blue-50 rounded-lg">
              <Mail className="w-5 h-5 text-blue-600" />
              <span>
                A confirmation has been sent to <span className="text-blue-600">{data.email}</span>
              </span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={onBackToForm}
              className="flex items-center justify-center gap-2 px-6 py-3 border-2 border-gray-200 rounded-lg hover:border-blue-600 hover:text-blue-600 transition-all group"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              Submit Another Suggestion
            </button>
            
            <a
              href="https://rastechno.com"
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
            >
              Visit RaS Techno Website
            </a>
          </div>
        </div>

        {/* Footer Message */}
        <p className="text-center text-gray-500 mt-8">
          Together, we'll continue to innovate and grow! 🚀
        </p>
      </div>
    </div>
  );
}
