# Integration Examples

This directory contains examples of how to integrate your deployed Sclay AI Proposal Generator into existing websites.

## HTML Integration (for any website)

See `navigation-link.html` for complete HTML examples including:
- Simple navigation links
- Styled CTA buttons  
- Embedded iframes
- Modal popups

## React/Next.js Integration

If your existing website uses React or Next.js, here are some component examples:

```tsx
// Simple navigation link
export function Navigation() {
  return (
    <nav className="flex space-x-6">
      <Link href="/">Home</Link>
      <Link href="/about">About</Link>
      <Link href="https://your-app.vercel.app" target="_blank">
        AI Proposal Generator
      </Link>
      <Link href="/contact">Contact</Link>
    </nav>
  )
}

// Call-to-action component
export function ProposalCTA() {
  return (
    <div className="bg-blue-50 p-8 rounded-lg text-center">
      <h2 className="text-2xl font-bold mb-4">Need a Professional Proposal?</h2>
      <a
        href="https://your-app.vercel.app"
        target="_blank"
        className="bg-blue-600 text-white px-6 py-3 rounded-lg"
      >
        Generate AI Proposal →
      </a>
    </div>
  )
}

// Embedded iframe
export function EmbeddedGenerator() {
  return (
    <iframe
      src="https://your-app.vercel.app"
      width="100%"
      height="800"
      frameBorder="0"
      title="AI Proposal Generator"
    />
  )
}

// Modal with state
export function ProposalModal() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button onClick={() => setIsOpen(true)}>
        Create Proposal
      </button>
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg w-full max-w-6xl">
            <button onClick={() => setIsOpen(false)}>×</button>
            <iframe src="https://your-app.vercel.app" width="100%" height="600" />
          </div>
        </div>
      )}
    </>
  )
}
```

## WordPress Integration

For WordPress sites, add this to your theme's functions.php:

```php
// Add to functions.php
function add_proposal_generator_link($items, $args) {
    if ($args->theme_location == 'primary') {
        $items .= '<li><a href="https://your-app.vercel.app" target="_blank">AI Proposal Generator</a></li>';
    }
    return $items;
}
add_filter('wp_nav_menu_items', 'add_proposal_generator_link', 10, 2);
```

## Shopify Integration

Add to your theme's navigation:

```liquid
<!-- In your theme's navigation template -->
<a href="https://your-app.vercel.app" target="_blank" class="nav-link">
  AI Proposal Generator
</a>
```

## Replace URLs

Remember to replace `https://your-app.vercel.app` with your actual deployed URL after deployment! 