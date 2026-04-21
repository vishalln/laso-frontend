import { Link } from "react-router-dom";
import { Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30 mt-auto">
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 font-bold text-lg text-primary mb-3">
              <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center text-white text-xs font-black">L</div>
              Laso Health
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              India's first clinically supervised GLP-1 metabolic health programme — combining medical expertise, AI insights, and pharmacy delivery.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-sm">Programme</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/quiz" className="hover:text-primary transition-colors">Eligibility Quiz</Link></li>
              <li><Link to="/consult" className="hover:text-primary transition-colors">Book Consultation</Link></li>
              <li><Link to="/orders" className="hover:text-primary transition-colors">Pharmacy</Link></li>
              <li><Link to="/#how-it-works" className="hover:text-primary transition-colors">How It Works</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-sm">Clinical</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><span className="cursor-default">GLP-1 Explainer</span></li>
              <li><span className="cursor-default">Safety Information</span></li>
              <li><span className="cursor-default">Clinical Evidence</span></li>
              <li><Link to="/#faq" className="hover:text-primary transition-colors">FAQs</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-sm">Legal & Support</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><span className="cursor-default">Privacy Policy</span></li>
              <li><span className="cursor-default">Terms of Service</span></li>
              <li><span className="cursor-default">HIPAA Notice</span></li>
              <li><Link to="/support" className="hover:text-primary transition-colors">Contact Us</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <p>© 2026 Laso Health Technologies Pvt. Ltd. · CIN: U85100MH2025PTC000001 · All rights reserved.</p>
          <p className="flex items-center gap-1">
            Made with <Heart className="h-3 w-3 text-destructive fill-current" /> in India · CDSCO compliant · Licensed pharmacy network
          </p>
        </div>
        <p className="mt-4 text-xs text-muted-foreground/70 text-center max-w-3xl mx-auto">
          <strong>Medical Disclaimer:</strong> Laso Health is not a substitute for professional medical advice, diagnosis, or treatment. All treatment decisions are made by licensed physicians. GLP-1 medications are prescription-only. This platform facilitates doctor-patient consultation under the telemedicine guidelines of India (2020).
        </p>
      </div>
    </footer>
  );
}
