# Personal Finance Tracker

A modern, responsive web application for tracking personal finances built with HTML, CSS, and vanilla JavaScript.

## Features

### 📊 Dashboard
- Overview of total income, expenses, net balance, and assets
- Recent transactions display
- Color-coded financial indicators

### 💰 Income Tracking
- Add income entries with description, amount, category, and date
- Categories: Salary, Freelance, Investment, Business, Other
- View income history sorted by date

### 💸 Expense Tracking
- Record expenses with detailed categorization
- Categories: Food, Transport, Utilities, Entertainment, Healthcare, Shopping, Other
- Track spending patterns over time

### 🏦 Asset Management
- Manage various asset types
- Categories: Cash, Savings Account, Investment, Property, Vehicle, Other
- Track asset values and portfolio growth

### 📋 Liability Tracking
- Record debts and obligations
- Categories: Credit Card, Loan, Mortgage, Student Loan, Other
- Due date tracking with overdue notifications

## Technical Features

### 🎨 Modern Design
- Clean, professional interface
- Responsive design for mobile and desktop
- CSS Grid and Flexbox layouts
- Modern color scheme with CSS custom properties

### 💾 Data Persistence
- Local storage for data persistence
- No server required - runs entirely in the browser
- Data survives browser restarts

### 🔧 User Experience
- Tab-based navigation
- Form validation
- Success/error notifications
- Delete functionality with confirmation
- Keyboard shortcuts (Ctrl/Cmd + 1-5 for tab navigation)

### 📱 Mobile Responsive
- Optimized for mobile devices
- Touch-friendly interface
- Horizontal scrolling navigation on small screens

## File Structure

```
personal-finance-tracker/
├── index.html          # Main HTML structure
├── styles.css          # CSS styling and responsive design
├── script.js           # JavaScript functionality
└── README.md          # This file
```

## Usage

### Getting Started
1. Open `index.html` in any modern web browser
2. No installation or setup required
3. Start adding your financial data using the forms

### Navigation
- **Dashboard**: View your financial overview
- **Income**: Add and view income entries
- **Expenses**: Track your spending
- **Assets**: Manage your assets
- **Liabilities**: Track debts and obligations

### Adding Data
1. Select the appropriate tab (Income, Expenses, Assets, or Liabilities)
2. Fill out the form with relevant information
3. Click the submit button
4. Data is automatically saved and the dashboard updates

### Deleting Entries
- Click the × button next to any entry
- Confirm deletion in the dialog box
- Data is automatically removed and dashboard updates

## Browser Compatibility

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Any modern browser with ES6 support

## Data Storage

The application uses browser localStorage to save your data. This means:
- ✅ Data persists between browser sessions
- ✅ No internet connection required
- ✅ Complete privacy - data never leaves your device
- ⚠️ Data is tied to the specific browser and device
- ⚠️ Clearing browser data will remove your financial records

## Security & Privacy

- All data is stored locally in your browser
- No data is transmitted to external servers
- No tracking or analytics
- Complete privacy and security

## Future Enhancements

Potential features for future versions:
- Data export/import functionality
- Charts and graphs for visual analysis
- Budget setting and tracking
- Recurring transaction support
- Multiple currency support
- Categories customization
- Data backup and sync

## Development

To run the application locally:

1. Clone or download the files
2. Start a local web server:
   ```bash
   python3 -m http.server 8000
   ```
3. Open `http://localhost:8000` in your browser

## Contributing

This is a standalone project. Feel free to fork and modify according to your needs.

## License

This project is open source and available under the MIT License.