import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Church, Users, Crown, Mail, Phone, MapPin, Building } from 'lucide-react';

export default function ChurchPartnership() {
  const [formData, setFormData] = useState({
    organization_name: '',
    contact_person: '',
    email: '',
    phone: '',
    address: '',
    denomination: '',
    congregation_size: '',
    current_communication: '',
    interest_areas: [],
    special_requests: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const INTEREST_AREAS = [
    { id: 'birthdays', label: 'Birthday Celebrations', description: 'Automated birthday cards for congregation' },
    { id: 'anniversaries', label: 'Wedding Anniversaries', description: 'Celebrate marriage milestones' },
    { id: 'baptisms', label: 'Baptisms & New Members', description: 'Welcome new members with custom messages' },
    { id: 'sympathy', label: 'Sympathy & Condolences', description: 'Thoughtful messages during difficult times' },
    { id: 'holidays', label: 'Holiday Greetings', description: 'Christmas, Easter, and other religious holidays' },
    { id: 'fundraising', label: 'Fundraising Events', description: 'Event invitations and thank you messages' },
    { id: 'pastoral', label: 'Pastoral Care', description: 'Ongoing support and encouragement messages' },
    { id: 'youth', label: 'Youth Ministry', description: 'Engagement with young members and families' }
  ];

  const CONGREGATION_SIZES = [
    { value: 'small', label: 'Small (Under 100 members)' },
    { value: 'medium', label: 'Medium (100-500 members)' },
    { value: 'large', label: 'Large (500-1000 members)' },
    { value: 'xlarge', label: 'Extra Large (1000+ members)' }
  ];

  const handleInterestChange = (interestId) => {
    setFormData(prev => ({
      ...prev,
      interest_areas: prev.interest_areas.includes(interestId)
        ? prev.interest_areas.filter(id => id !== interestId)
        : [...prev.interest_areas, interestId]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const partnershipData = {
        ...formData,
        user_id: user?.id,
        status: 'pending',
        created_at: new Date().toISOString(),
        interest_areas: JSON.stringify(formData.interest_areas)
      };

      const { error } = await supabase
        .from('church_partnerships')
        .insert([partnershipData]);

      if (error) throw error;

      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting partnership request:', error);
      alert('There was an error submitting your request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="pb-24 pt-6 px-4 animate-in fade-in slide-in-from-right-8 duration-300">
        <div className="max-w-2xl mx-auto text-center py-12">
          <div className="w-24 h-24 bg-gradient-to-r from-green-500 to-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6">
            <Church className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Application Submitted!</h2>
          <p className="text-gray-600 text-lg mb-6">
            Thank you for your interest in Digital Bloom Church Partnership. 
            Our team will review your application and contact you within 24-48 hours.
          </p>
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
            <h3 className="font-bold text-blue-900 mb-3">What's Next?</h3>
            <ul className="text-left text-blue-700 space-y-2">
              <li>• We'll review your congregation's needs</li>
              <li>• Schedule a consultation call</li>
              <li>• Create a custom implementation plan</li>
              <li>• Provide training for your staff</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-24 pt-6 px-4 animate-in fade-in slide-in-from-right-8 duration-300">
      <div className="text-left mb-8">
        <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-600 to-orange-500">
          Church Partnership Program
        </h2>
        <p className="text-gray-600 font-medium mt-2">
          Automated Digital Blooms for your entire congregation
        </p>
      </div>

      {/* Program Benefits */}
      <div className="mb-8 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-6 border border-blue-200">
        <div className="flex items-start space-x-4 mb-6">
          <Crown className="w-8 h-8 text-blue-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="text-2xl font-bold text-blue-900 mb-2">$49/month Partnership Benefits</h3>
            <p className="text-blue-700">Everything your congregation needs for meaningful digital outreach</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-blue-600" />
              <span className="text-blue-800">Bulk sending for entire congregation</span>
            </div>
            <div className="flex items-center space-x-2">
              <Building className="w-5 h-5 text-blue-600" />
              <span className="text-blue-800">Admin dashboard & member management</span>
            </div>
            <div className="flex items-center space-x-2">
              <Mail className="w-5 h-5 text-blue-600" />
              <span className="text-blue-800">Custom branding with church logo</span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Church className="w-5 h-5 text-blue-600" />
              <span className="text-blue-800">Dedicated customer success manager</span>
            </div>
            <div className="flex items-center space-x-2">
              <Crown className="w-5 h-5 text-blue-600" />
              <span className="text-blue-800">Priority support & training</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-blue-600" />
              <span className="text-blue-800">Staff training & onboarding</span>
            </div>
          </div>
        </div>
      </div>

      {/* Application Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="glass rounded-2xl p-6 border border-white/40">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Organization Information</h3>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Organization Name *</label>
              <input
                type="text"
                value={formData.organization_name}
                onChange={(e) => setFormData({...formData, organization_name: e.target.value})}
                className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-amber-500"
                placeholder="First Baptist Church"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Contact Person *</label>
              <input
                type="text"
                value={formData.contact_person}
                onChange={(e) => setFormData({...formData, contact_person: e.target.value})}
                className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-amber-500"
                placeholder="Pastor John Smith"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Email *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-amber-500"
                placeholder="pastor@church.org"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-amber-500"
                placeholder="(555) 123-4567"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-bold text-gray-700 mb-2">Address</label>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
              className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-amber-500"
              rows="2"
              placeholder="123 Church Street, City, State 12345"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Denomination</label>
              <input
                type="text"
                value={formData.denomination}
                onChange={(e) => setFormData({...formData, denomination: e.target.value})}
                className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-amber-500"
                placeholder="Baptist, Methodist, Catholic, etc."
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Congregation Size *</label>
              <select
                value={formData.congregation_size}
                onChange={(e) => setFormData({...formData, congregation_size: e.target.value})}
                className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-amber-500"
                required
              >
                <option value="">Select size</option>
                {CONGREGATION_SIZES.map(size => (
                  <option key={size.value} value={size.value}>{size.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Interest Areas */}
        <div className="glass rounded-2xl p-6 border border-white/40">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Areas of Interest</h3>
          <p className="text-gray-600 mb-4">Select the types of Digital Blooms your congregation would benefit from:</p>
          
          <div className="grid md:grid-cols-2 gap-3">
            {INTEREST_AREAS.map(interest => (
              <label key={interest.id} className="flex items-start space-x-3 p-3 rounded-xl border border-gray-200 hover:bg-amber-50 transition-colors cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.interest_areas.includes(interest.id)}
                  onChange={() => handleInterestChange(interest.id)}
                  className="mt-1 w-5 h-5 text-amber-500 rounded focus:ring-amber-500"
                />
                <div>
                  <div className="font-bold text-gray-900">{interest.label}</div>
                  <div className="text-sm text-gray-600">{interest.description}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Additional Information */}
        <div className="glass rounded-2xl p-6 border border-white/40">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Additional Information</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Current Communication Methods</label>
              <textarea
                value={formData.current_communication}
                onChange={(e) => setFormData({...formData, current_communication: e.target.value})}
                className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-amber-500"
                rows="3"
                placeholder="How do you currently communicate with members? (Newsletter, email, bulletin boards, etc.)"
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Special Requests or Questions</label>
              <textarea
                value={formData.special_requests}
                onChange={(e) => setFormData({...formData, special_requests: e.target.value})}
                className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-amber-500"
                rows="3"
                placeholder="Any specific needs, questions, or customization requests?"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-4 px-8 rounded-2xl font-bold text-white transition-all ${
            loading 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:shadow-lg transform active:scale-95'
          }`}
        >
          {loading ? 'Submitting Application...' : 'Submit Partnership Application'}
        </button>
      </form>
    </div>
  );
}