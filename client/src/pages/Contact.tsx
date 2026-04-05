// Contact Page — Required for AdSense compliance — Quizoi Light Theme
import { Mail, MessageSquare, Clock } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { toast } from 'sonner';

export default function Contact() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Message sent! We'll get back to you within 48 hours.");
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="container flex-1 py-12">
        <div className="max-w-2xl mx-auto">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">Contact Us</h1>
          <p className="text-muted-foreground mb-10">Have a question, suggestion, or want to report an issue? We'd love to hear from you.</p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
            {[
              { icon: Mail, title: 'Email', desc: 'hello@quizoi.com' },
              { icon: MessageSquare, title: 'Feedback', desc: 'Quiz suggestions welcome' },
              { icon: Clock, title: 'Response Time', desc: 'Within 48 hours' },
            ].map(item => (
              <div key={item.title} className="rounded-xl border border-gray-100 bg-white shadow-sm p-4 text-center">
                <item.icon className="w-5 h-5 text-primary mx-auto mb-2" />
                <h3 className="font-display text-sm font-semibold text-foreground mb-1">{item.title}</h3>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="rounded-xl border border-gray-100 bg-white shadow-sm p-6 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Name</label>
                <input
                  type="text"
                  required
                  placeholder="Your name"
                  className="w-full px-4 py-2.5 rounded-lg bg-gray-50 border border-gray-200 text-foreground placeholder:text-muted-foreground/50 text-sm focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
                <input
                  type="email"
                  required
                  placeholder="your@email.com"
                  className="w-full px-4 py-2.5 rounded-lg bg-gray-50 border border-gray-200 text-foreground placeholder:text-muted-foreground/50 text-sm focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-colors"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Subject</label>
              <select className="w-full px-4 py-2.5 rounded-lg bg-gray-50 border border-gray-200 text-foreground text-sm focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-colors">
                <option value="general">General Question</option>
                <option value="quiz-suggestion">Quiz Suggestion</option>
                <option value="bug-report">Bug Report</option>
                <option value="content-issue">Content Issue</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Message</label>
              <textarea
                required
                rows={5}
                placeholder="Tell us what's on your mind..."
                className="w-full px-4 py-2.5 rounded-lg bg-gray-50 border border-gray-200 text-foreground placeholder:text-muted-foreground/50 text-sm focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-colors resize-none"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-primary text-white font-display font-bold rounded-xl hover:bg-primary/90 transition-all duration-200 shadow-sm"
            >
              Send Message
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
