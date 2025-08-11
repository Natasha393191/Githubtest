# Personal Finance Tracker

A modern, responsive web application for tracking personal finances using vanilla HTML, CSS, and JavaScript.

## Features

- **Dashboard**: Overview of financial health with summary cards showing total income, expenses, net worth, and monthly budget
- **Income Tracking**: Add and manage income sources with amounts and dates
- **Expense Management**: Track expenses by category with detailed descriptions
- **Asset Portfolio**: Record and monitor various types of assets (cash, investments, real estate, vehicles)
- **Liability Management**: Track debts and liabilities with interest rates
- **Recent Transactions**: Quick view of the latest financial activities
- **Local Data Storage**: All data is stored locally in the browser using localStorage
- **Responsive Design**: Mobile-friendly interface that works on all devices
- **Modern UI**: Clean, professional design with smooth animations and transitions

## File Structure

```
personal-finance-tracker/
├── index.html          # Main HTML file with complete application structure
├── styles.css          # CSS with responsive design and modern styling
├── script.js           # JavaScript for functionality and data management
└── README.md           # This documentation file
```

## Design Features

### Color Scheme
- **Primary Blue**: #3498db (main theme color)
- **Success Green**: #27ae60 (income, positive values)
- **Danger Red**: #e74c3c (expenses, liabilities, negative values)
- **Professional grays and whites** for backgrounds and text

### Layout
- **Header**: Gradient background with app title
- **Navigation**: Tab-based navigation with 5 sections
- **Main Content**: Card-based layout with forms and data displays
- **Footer**: Shows current date and copyright information

### Responsive Breakpoints
- **Desktop**: 1200px+ (full layout)
- **Tablet**: 768px-1199px (adapted grid layouts)
- **Mobile**: 480px-767px (stacked layouts)
- **Small Mobile**: <480px (optimized for small screens)

## How to Use

### Getting Started
1. Open `index.html` in a web browser
2. Start by adding some income entries in the "Income" tab
3. Add expenses in the "Expenses" tab
4. Record your assets in the "Assets" tab
5. Track any liabilities in the "Liabilities" tab
6. Monitor your financial overview in the "Dashboard" tab

### Navigation
- Click on the tab buttons to switch between different sections
- All data is automatically saved to your browser's local storage
- The dashboard updates automatically when you add new entries

### Dashboard Overview
- **Total Income**: Sum of all income entries
- **Total Expenses**: Sum of all expense entries
- **Net Worth**: Total assets minus total liabilities
- **Monthly Budget**: Total income minus total expenses
- **Recent Transactions**: Latest 5 transactions across income and expenses

### Data Management
- **Add Entries**: Fill out the forms in each section and click the respective "Add" button
- **Delete Entries**: Click the "×" button next to any entry to delete it
- **View History**: All entries are automatically displayed in chronological order

## Browser Compatibility

The application works in all modern browsers including:
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Local Storage

All data is stored locally in your browser using localStorage API. This means:
- ✅ Your data persists between browser sessions
- ✅ No internet connection required after initial load
- ✅ Complete privacy - no data sent to external servers
- ⚠️ Data is specific to the browser and device
- ⚠️ Clearing browser data will remove all entries

## Technical Details

### Technologies Used
- **HTML5**: Semantic markup and modern form elements
- **CSS3**: Flexbox, Grid, animations, and responsive design
- **Vanilla JavaScript**: ES6+ features, DOM manipulation, localStorage

### Key JavaScript Features
- **Tab Navigation**: Dynamic content switching
- **Form Validation**: Client-side validation for all inputs
- **Data Persistence**: localStorage integration
- **Real-time Updates**: Dashboard updates automatically
- **Responsive Notifications**: User feedback for all actions
- **Delete Functionality**: Confirm dialogs for data safety

### CSS Highlights
- **CSS Grid**: Dashboard summary cards layout
- **Flexbox**: Navigation and form layouts
- **CSS Animations**: Smooth transitions and hover effects
- **Media Queries**: Responsive design for all screen sizes
- **CSS Variables**: Consistent color scheme (in dark mode section)

## Future Enhancements

Potential features that could be added:
- **Data Export/Import**: JSON file backup and restore
- **Charts and Graphs**: Visual representation of financial data
- **Budget Categories**: Set spending limits for expense categories
- **Recurring Transactions**: Automatic income/expense entries
- **Dark Mode**: Toggle between light and dark themes
- **Multiple Accounts**: Support for different bank accounts
- **Currency Support**: Multi-currency tracking
- **Reports**: Monthly/yearly financial reports

## Customization

### Modifying Colors
Edit the color values in `styles.css`:
```css
/* Primary colors used throughout the app */
--primary-blue: #3498db;
--success-green: #27ae60;
--danger-red: #e74c3c;
```

### Adding Categories
Modify the select options in `index.html` for expenses, assets, or liabilities:
```html
<option value="new-category">New Category</option>
```

### Changing Layout
The CSS uses modern flexbox and grid layouts that can be easily modified:
- Dashboard grid: `.dashboard-grid`
- Form layouts: `.form-section`
- Navigation: `.navigation`

## License

This project is open source and available under the MIT License.

## Support

This is a client-side application that doesn't require a server. If you encounter issues:
1. Check that JavaScript is enabled in your browser
2. Ensure you're viewing the file via HTTP (not file://)
3. Check browser console for any error messages
4. Try clearing localStorage if data appears corrupted

For development, you can serve the files using any HTTP server:
```bash
# Python 3
python -m http.server 8000

# Node.js
npx serve .

# PHP
php -S localhost:8000
```

Then navigate to `http://localhost:8000` in your browser.