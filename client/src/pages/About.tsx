// About Page — Quizoi Light Theme
import { Brain, Target, BookOpen, Users } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function About() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="container flex-1 py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-6">About Quizoi</h1>

          <p className="text-lg text-muted-foreground leading-relaxed mb-8">
            Quizoi is a free online quiz platform designed to challenge your knowledge, teach you something new, and provide hours of entertainment. Whether you're a trivia enthusiast, a student looking to test your knowledge, or just someone who enjoys a good brain teaser, Quizoi has something for you.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-8">
            {[
              { icon: Target, title: 'Our Mission', desc: 'To make learning fun and accessible through engaging, well-researched quiz content that educates while it entertains.' },
              { icon: BookOpen, title: 'Quality Content', desc: 'Every question comes with a detailed "Did You Know?" fact lab — original, educational content that adds real value.' },
              { icon: Brain, title: '10+ Categories', desc: 'From science and geography to music and movies, our quizzes span a wide range of topics to keep things fresh.' },
              { icon: Users, title: 'Community Driven', desc: 'See how your answers compare with thousands of other players through our real-time poll statistics.' },
            ].map(item => (
              <div key={item.title} className="rounded-xl border border-gray-100 bg-white shadow-sm p-5">
                <item.icon className="w-6 h-6 text-primary mb-3" />
                <h3 className="font-display text-base font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          <h2 className="font-display text-xl font-bold text-foreground mt-8 mb-4">How It Works</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Each quiz on Quizoi consists of 10 carefully crafted questions with four possible answers. After selecting your answer, you'll see whether you got it right, along with statistics showing how other players answered the same question. Every question also includes a "Fact Lab" section with 150+ words of original, educational content related to the topic — so you learn something new regardless of whether you got the answer right.
          </p>
          <p className="text-muted-foreground leading-relaxed mb-4">
            At the end of each quiz, you'll receive your final score along with a personalized result message. You can share your score with friends on social media and challenge them to beat it.
          </p>

          <h2 className="font-display text-xl font-bold text-foreground mt-8 mb-4">Contact Us</h2>
          <p className="text-muted-foreground leading-relaxed">
            Have a question, suggestion, or want to report an issue? We'd love to hear from you. Reach out to us at{' '}
            <a href="mailto:hello@quizoi.com" className="text-primary hover:underline font-medium">hello@quizoi.com</a>.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
