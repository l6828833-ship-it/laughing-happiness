// Terms of Service — Required for AdSense approval
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function Terms() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="container flex-1 py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">Terms of Service</h1>
          <p className="text-sm text-muted-foreground mb-8">Last updated: March 25, 2026</p>

          <div className="space-y-8 text-muted-foreground leading-relaxed">
            <section>
              <h2 className="font-display text-lg font-semibold text-foreground mb-3">1. Acceptance of Terms</h2>
              <p>By accessing and using Quizoi ("the Service") at quizoi.com, you accept and agree to be bound by the terms and provisions of this agreement. If you do not agree to abide by the above, please do not use this service.</p>
            </section>

            <section>
              <h2 className="font-display text-lg font-semibold text-foreground mb-3">2. Description of Service</h2>
              <p>Quizoi provides an online quiz platform where users can participate in quizzes across various categories. The Service is provided for entertainment and educational purposes. We reserve the right to modify, suspend, or discontinue the Service at any time without notice.</p>
            </section>

            <section>
              <h2 className="font-display text-lg font-semibold text-foreground mb-3">3. Use of the Service</h2>
              <p className="mb-3">You agree to use the Service only for lawful purposes and in a manner that does not infringe the rights of others. You agree not to:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Use the Service in any way that violates applicable local, national, or international laws or regulations</li>
                <li>Attempt to gain unauthorized access to any part of the Service or its related systems</li>
                <li>Transmit any unsolicited or unauthorized advertising or promotional material</li>
                <li>Use automated means to access or scrape the Service without our prior written consent</li>
                <li>Interfere with or disrupt the integrity or performance of the Service</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-lg font-semibold text-foreground mb-3">4. Intellectual Property</h2>
              <p>The Service and its original content (excluding content provided by users), features, and functionality are and will remain the exclusive property of Quizoi and its licensors. Our trademarks and trade dress may not be used in connection with any product or service without the prior written consent of Quizoi.</p>
            </section>

            <section>
              <h2 className="font-display text-lg font-semibold text-foreground mb-3">5. Advertising</h2>
              <p>Quizoi is supported by advertising revenue. By using our Service, you acknowledge that advertisements may be displayed on the website. We use Google AdSense to serve relevant advertisements. We are not responsible for the content of these advertisements. Clicking on advertisements is entirely at your own discretion.</p>
            </section>

            <section>
              <h2 className="font-display text-lg font-semibold text-foreground mb-3">6. Disclaimer of Warranties</h2>
              <p>The Service is provided on an "AS IS" and "AS AVAILABLE" basis without any warranties of any kind, either express or implied. We do not warrant that the Service will be uninterrupted, error-free, or free of viruses or other harmful components. While we strive for accuracy in our quiz content, we make no representations or warranties about the completeness, accuracy, or reliability of any quiz questions or answers.</p>
            </section>

            <section>
              <h2 className="font-display text-lg font-semibold text-foreground mb-3">7. Limitation of Liability</h2>
              <p>To the maximum extent permitted by applicable law, Quizoi shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of (or inability to access or use) the Service.</p>
            </section>

            <section>
              <h2 className="font-display text-lg font-semibold text-foreground mb-3">8. Changes to Terms</h2>
              <p>We reserve the right to modify these terms at any time. We will notify users of any changes by updating the "Last updated" date at the top of this page. Your continued use of the Service after any changes constitutes your acceptance of the new Terms of Service.</p>
            </section>

            <section>
              <h2 className="font-display text-lg font-semibold text-foreground mb-3">9. Governing Law</h2>
              <p>These Terms shall be governed and construed in accordance with applicable laws, without regard to its conflict of law provisions.</p>
            </section>

            <section>
              <h2 className="font-display text-lg font-semibold text-foreground mb-3">10. Contact Us</h2>
              <p>If you have any questions about these Terms, please contact us at <a href="mailto:legal@quizoi.com" className="text-cyan hover:underline">legal@quizoi.com</a>.</p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
