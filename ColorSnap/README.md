# ColorSnap

A full-stack personalized beauty recommendation platform built around AI-assisted color analysis, explainable product matching, saved looks, cart flow, and expert consultation booking.

## Features

- **AI Color Analysis**: Upload photos for personalized seasonal color analysis
- **Personalized Beauty Preferences**: Re-rank recommendations by style, budget, finish, brand, and shopping goal
- **Explainable Product Recommendations**: Match score, score breakdown, and specific color-fit reasons
- **Saved Looks**: Save recommended products into a complete beauty routine
- **Shopping Cart**: Add single products or a full saved look while preserving match context
- **Expert Consultations**: Book sessions with a color profile and saved-look brief
- **Eval Harness**: Measure color-analysis and recommendation quality with JSON/Markdown reports
- **Responsive Design**: Fully responsive design that works on all devices
- **Modern UI/UX**: Beautiful, intuitive interface with smooth animations

## Technology Stack

- **React 19** with TypeScript
- **React Router 7** for navigation
- **Styled Components** for styling
- **Local Storage** for state management
- **Express** backend for analysis and product APIs

## Getting Started

### Prerequisites

- Node.js (version 20 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ColorSnap
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The application will open in your browser at `http://localhost:3000`.

4. In another terminal, start the analysis backend:
```bash
npm run backend:dev
```

The backend runs at `http://localhost:4000`. The React dev server proxies `/api/v1` requests there.

The backend supports two AI modes:

- `MOCK_AI=true` returns a deterministic demo response for local development.
- `MOCK_AI=false` uses the configured OpenAI model and requires `OPENAI_API_KEY`.

Copy `backend/.env.example` to `backend/.env` and set the values you need before starting the backend.

For Google login, create an OAuth 2.0 Web client in Google Cloud and set the same client id in both places:

- `REACT_APP_GOOGLE_CLIENT_ID` in the React app environment, for example in `.env`.
- `GOOGLE_CLIENT_ID` in `backend/.env`, so the backend can verify Google ID tokens before issuing the ColorSnap JWT.

### Available Scripts

- `npm start` - Runs the app in development mode
- `npm run backend:dev` - Builds and starts the analysis backend
- `npm run backend:build` - Compiles the backend TypeScript
- `npm run backend:start` - Starts the compiled backend
- `cd backend && npm run eval:color` - Runs the AI color-analysis and recommendation eval harness
- `npm test` - Launches the test runner
- `npm run build` - Builds the app for production
- `npm run eject` - Ejects from Create React App (not recommended)

## Project Structure

```
src/
├── components/          # Reusable components
│   ├── Header.tsx     # Navigation header
│   └── Footer.tsx     # Site footer
├── pages/             # Page components
│   ├── Home.tsx       # Landing page
│   ├── Analysis.tsx   # Photo upload and analysis
│   ├── Result.tsx     # Analysis results and recommendations
│   ├── Consultation.tsx # Expert consultation booking
│   ├── ShoppingCart.tsx # Shopping cart with match context
│   ├── SavedLooks.tsx  # Saved look builder and routine management
│   ├── About.tsx      # About page
│   ├── FAQ.tsx        # Frequently asked questions
│   ├── Booking.tsx    # Consultation booking form
│   ├── Payment.tsx    # Payment processing
│   └── ProductDetail.tsx # Personalized product detail page
├── hooks/             # Custom React hooks
├── utils/             # Utility functions
├── types/             # TypeScript type definitions
└── App.tsx           # Main application component
```

## Key Features Implementation

### 1. Photo Upload and Analysis
- File input with drag-and-drop support
- Image preview before analysis
- OpenAI or demo-mode backend analysis with loading and polling states
- Results fetched from `/api/v1/analyses/:analysis_id`

### 2. Personalized Product Recommendations
- Hybrid rule-based recommendation scoring from season, undertone, saturation, brightness, contrast, category, and preference fit
- Filterable product grid by category, price, retailer, finish, and intensity
- Match score, score breakdown, badges, and specific match reasons
- Save to Look and Add to Cart actions

### 3. Saved Looks and Shopping Cart
- Save recommendations into a named look with occasion and notes
- Add a full saved look to cart
- Persistent cart using localStorage
- Cart items preserve analysis id, saved look id, match score, and match reason
- Real-time total calculation
- Clear cart functionality
- Checkout flow

### 4. Expert Consultations
- Grid of expert profiles
- Booking form with validation and consultant brief
- Booking can attach a completed analysis, saved look, and user questions
- Date and time selection
- Success feedback

### 6. Evaluation Harness
- Versioned JSONL goldset
- JSON and Markdown reports
- Color-analysis metrics such as schema validity, quality gate accuracy, season accuracy, and confidence calibration
- Recommendation metrics such as relevance, reason specificity, category coverage, and generic language rate

### 5. Payment Processing
- Credit card form with validation
- Order summary display
- Simulated payment processing
- Success confirmation

## Styling

The application uses styled-components for all styling, providing:
- Consistent design system
- Responsive breakpoints
- Smooth animations and transitions
- Modern gradient backgrounds
- Mobile-first approach

## State Management

- **Local Storage**: Used for cart items and uploaded photos
- **React State**: Component-level state management
- **URL Parameters**: Used for expert selection in booking

## Performance Optimizations

- Lazy loading of images
- Optimized bundle size
- Efficient re-renders with React.memo
- Responsive images with proper sizing

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Deployment

To build the application for production:

```bash
npm run build
```

The build files will be created in the `build` folder, ready for deployment to any static hosting service.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Contact

For support or questions, contact: support@ColorSnap.com
