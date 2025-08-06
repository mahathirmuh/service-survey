#!/usr/bin/env node

// Get current date and time for journal entries
const now = new Date();

// Format: YYYY-MM-DD HH:MM:SS (Local Time)
const localDateTime = now.toLocaleString('en-CA', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false
}).replace(',', '');

// Format: YYYY-MM-DD
const dateOnly = now.toISOString().split('T')[0];

// Format: HH:MM:SS
const timeOnly = now.toTimeString().split(' ')[0];

// Format: Day, Month DD, YYYY
const readableDate = now.toLocaleDateString('en-US', {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric'
});

console.log(`Current Date/Time: ${localDateTime}`);
console.log(`Date: ${dateOnly}`);
console.log(`Time: ${timeOnly}`);
console.log(`Readable: ${readableDate}`);

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    localDateTime,
    dateOnly,
    timeOnly,
    readableDate
  };
}