# Solar Calculator - Chairbord Private Limited

A modern Next.js application for calculating solar system component prices with categorized item selection.

## Features

- **Categorized Items**: Items organized into 8 categories:
  - Solar Panels
  - Inverters
  - Cables - DC
  - Cables - Copper
  - Meters
  - Electrical Components
  - Structural Components
  - Accessories

- **Item Selection**: Select items and specify quantities
- **Real-time Calculation**: Automatic price calculation as you add items
- **Search Functionality**: Search items within each category
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Modern UI**: Clean, professional interface with gradient design

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

### Build for Production

```bash
npm run build
npm start
```

## Usage

1. Select a category from the tabs at the top
2. Browse items or use the search box to find specific items
3. Enter quantities for items you want to include
4. View selected items and total price in the summary panel on the right
5. Remove items or clear all selections as needed

## Project Structure

```
totalcalculator/
├── app/
│   ├── layout.tsx       # Root layout
│   ├── page.tsx         # Home page
│   └── globals.css      # Global styles
├── components/
│   └── Calculator.tsx   # Main calculator component
├── data/
│   └── items.ts         # Item data and categories
└── package.json         # Dependencies
```

## Technologies Used

- Next.js 14
- React 18
- TypeScript
- CSS3 (with modern gradients and animations)

## Company Information

**CHAIRBORD PRIVATE LIMITED**
- Plot No-10, Shri Shyam Vihar
- Kalwar Road Jaipur Rajasthan, 302012
- Contact: +91-9269666646
- E-Mail: support@chairbord.com

# totalcalculator
