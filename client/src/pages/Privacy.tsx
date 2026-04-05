// Privacy Policy — Required for AdSense approval
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function Privacy() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="container flex-1 py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">Privacy Policy</h1>
          <p className="text-sm text-muted-foreground mb-8">Last updated: March 25, 2026</p>

          <div className="space-y-8 text-muted-foreground leading-relaxed">
            <section>
              <h2 className="font-display text-lg font-semibold text-foreground mb-3">1. Introduction</h2>
              <p>Welcome to Quizoi ("we," "our," or "us"). We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit quizoi.com. Please read this policy carefully. If you disagree with its terms, please discontinue use of our site.</p>
            </section>

            <section>
              <h2 className="font-display text-lg font-semibold text-foreground mb-3">2. Information We Collect</h2>
              <p className="mb-3">We may collect information about you in a variety of ways. The information we may collect on the Site includes:</p>
              <p className="mb-2"><strong className="text-foreground">Automatically Collected Information:</strong> When you visit our website, we automatically collect certain information about your device, including information about your web browser, IP address, time zone, and some of the cookies that are installed on your device. Additionally, as you browse the Site, we collect information about the individual web pages or products that you view, what websites or search terms referred you to the Site, and information about how you interact with the Site.</p>
              <p><strong className="text-foreground">Quiz Session Data:</strong> We collect anonymous session data including quiz progress, answers selected, completion status, and device type. This data is used to display poll statistics ("X% of people chose this answer") and to improve our content. This data is not linked to any personally identifiable information.</p>
            </section>

            <section>
              <h2 className="font-display text-lg font-semibold text-foreground mb-3">3. Use of Cookies</h2>
              <p className="mb-3">We use cookies and similar tracking technologies to track activity on our website and hold certain information. Cookies are files with a small amount of data which may include an anonymous unique identifier. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.</p>
              <p>We use the following types of cookies: <strong className="text-foreground">Session cookies</strong> (to operate our service), <strong className="text-foreground">Preference cookies</strong> (to remember your preferences), and <strong className="text-foreground">Analytics cookies</strong> (to understand how you use our site).</p>
            </section>

            <section>
              <h2 className="font-display text-lg font-semibold text-foreground mb-3">4. Google AdSense & Advertising</h2>
              <p className="mb-3">We use Google AdSense to display advertisements on our website. Google AdSense uses cookies to serve ads based on your prior visits to our website or other websites. Google's use of advertising cookies enables it and its partners to serve ads to you based on your visit to our site and/or other sites on the Internet.</p>
              <p className="mb-3">You may opt out of personalized advertising by visiting <a href="https://www.google.com/settings/ads" className="text-cyan hover:underline" target="_blank" rel="noopener noreferrer">Google Ads Settings</a>. Alternatively, you can opt out of a third-party vendor's use of cookies for personalized advertising by visiting <a href="http://www.aboutads.info/choices/" className="text-cyan hover:underline" target="_blank" rel="noopener noreferrer">www.aboutads.info</a>.</p>
              <p>Third-party vendors, including Google, use cookies to serve ads based on a user's prior visits to our website. These cookies allow Google and its partners to serve ads to our users based on their visits to our site and/or other sites on the Internet.</p>
            </section>

            <section>
              <h2 className="font-display text-lg font-semibold text-foreground mb-3">5. How We Use Your Information</h2>
              <p>We use the information we collect to: operate and maintain our website; improve, personalize, and expand our website; understand and analyze how you use our website; develop new products, services, features, and functionality; display relevant advertisements through Google AdSense; and comply with applicable laws and regulations.</p>
            </section>

            <section>
              <h2 className="font-display text-lg font-semibold text-foreground mb-3">6. Third-Party Websites</h2>
              <p>Our website may contain links to third-party websites. We have no control over, and assume no responsibility for, the content, privacy policies, or practices of any third-party sites or services. We strongly advise you to review the Privacy Policy of every site you visit.</p>
            </section>

            <section>
              <h2 className="font-display text-lg font-semibold text-foreground mb-3">7. Children's Privacy</h2>
              <p>Our website is not directed to children under the age of 13. We do not knowingly collect personally identifiable information from children under 13. If you are a parent or guardian and you are aware that your child has provided us with personal data, please contact us.</p>
            </section>

            <section>
              <h2 className="font-display text-lg font-semibold text-foreground mb-3">8. Your Rights (GDPR / EU Users)</h2>
              <p>If you are located in the European Economic Area (EEA), you have certain data protection rights. You have the right to access, update, or delete the information we have on you; the right of rectification; the right to object; the right of restriction; the right to data portability; and the right to withdraw consent. To exercise these rights, please contact us at <a href="mailto:privacy@quizoi.com" className="text-cyan hover:underline">privacy@quizoi.com</a>.</p>
            </section>

            <section>
              <h2 className="font-display text-lg font-semibold text-foreground mb-3">9. Changes to This Policy</h2>
              <p>We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. You are advised to review this Privacy Policy periodically for any changes.</p>
            </section>

            <section>
              <h2 className="font-display text-lg font-semibold text-foreground mb-3">10. Contact Us</h2>
              <p>If you have any questions about this Privacy Policy, please contact us at <a href="mailto:privacy@quizoi.com" className="text-cyan hover:underline">privacy@quizoi.com</a>.</p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
