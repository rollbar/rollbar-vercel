'use client';

/**
 * Footer component - displays help/contact call-to-action
 */
export default function Footer() {
  return (
    <footer className="footer-container">
      <div className="max-w-[1200px] mx-auto px-5 py-16 text-center pb-[350px]">
        <h2 className="text-white text-3xl font-semibold mb-4">
          Need Help Getting Started?
        </h2>
        <p className="text-rollbar-gray-text text-lg mb-8 max-w-[600px] mx-auto">
          Our team is here to help you integrate Rollbar into your application.
          Get in touch with us for personalized support and guidance.
        </p>
        <a
          href="https://rollbar.com/contact-us"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-blue-lg inline-block"
        >
          Contact Us
        </a>
      </div>
      <div className="footer-pattern"></div>
    </footer>
  );
}
