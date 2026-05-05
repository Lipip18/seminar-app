const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname);

// Directories to exist
const dirs = [
  'pages/admin',
  'pages/faculty',
  'pages/student',
  'routes',
  'components/layout',
  'components/common',
  'components/ui',
  'services'
];

dirs.forEach(d => {
  const p = path.join(srcDir, d);
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
});

// Stubs object
const stubs = {
  'pages/admin/ManageHalls.jsx': `export default function ManageHalls() { return <div className="p-6 bg-card text-card-foreground shadow-soft rounded-2xl border border-border"><h2>Admin Manage Halls (Coming Soon)</h2></div>; }`,
  'pages/admin/ManageBookings.jsx': `export default function ManageBookings() { return <div className="p-6 bg-card text-card-foreground shadow-soft rounded-2xl border border-border"><h2>Admin Manage Bookings (Coming Soon)</h2></div>; }`,
  'pages/admin/ManageUsers.jsx': `export default function ManageUsers() { return <div className="p-6 bg-card text-card-foreground shadow-soft rounded-2xl border border-border"><h2>Admin Manage Users (Coming Soon)</h2></div>; }`,
  'pages/admin/Calendar.jsx': `export default function Calendar() { return <div className="p-6 bg-card text-card-foreground shadow-soft rounded-2xl border border-border"><h2>Admin Calendar (Coming Soon)</h2></div>; }`,
  'pages/admin/Profile.jsx': `export default function Profile() { return <div className="p-6 bg-card text-card-foreground shadow-soft rounded-2xl border border-border"><h2>Admin Profile (Coming Soon)</h2></div>; }`,

  'pages/faculty/ViewHalls.jsx': `export default function ViewHalls() { return <div className="p-6 bg-card text-card-foreground shadow-soft rounded-2xl border border-border"><h2>Faculty View Halls (Coming Soon)</h2></div>; }`,
  'pages/faculty/HallDetails.jsx': `export default function HallDetails() { return <div className="p-6 bg-card text-card-foreground shadow-soft rounded-2xl border border-border"><h2>Faculty Hall Details (Coming Soon)</h2></div>; }`,
  'pages/faculty/BookHall.jsx': `export default function BookHall() { return <div className="p-6 bg-card text-card-foreground shadow-soft rounded-2xl border border-border"><h2>Faculty Book Hall (Coming Soon)</h2></div>; }`,
  'pages/faculty/Calendar.jsx': `export default function Calendar() { return <div className="p-6 bg-card text-card-foreground shadow-soft rounded-2xl border border-border"><h2>Faculty Calendar (Coming Soon)</h2></div>; }`,
  'pages/faculty/Profile.jsx': `export default function Profile() { return <div className="p-6 bg-card text-card-foreground shadow-soft rounded-2xl border border-border"><h2>Faculty Profile (Coming Soon)</h2></div>; }`,

  'pages/student/ViewHalls.jsx': `export default function ViewHalls() { return <div className="p-6 bg-card text-card-foreground shadow-soft rounded-2xl border border-border"><h2>Student View Halls (Coming Soon)</h2></div>; }`,
  'pages/student/Schedule.jsx': `export default function Schedule() { return <div className="p-6 bg-card text-card-foreground shadow-soft rounded-2xl border border-border"><h2>Student Schedule (Coming Soon)</h2></div>; }`,
  'pages/student/Profile.jsx': `export default function Profile() { return <div className="p-6 bg-card text-card-foreground shadow-soft rounded-2xl border border-border"><h2>Student Profile (Coming Soon)</h2></div>; }`,

  'pages/NotFound.jsx': `import React from 'react';\nimport { Link } from 'react-router-dom';\nexport default function NotFound() { return <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background"><h1 className="text-4xl font-bold mb-4 text-foreground">404 - Page Not Found</h1><Link to="/" className="text-secondary hover:underline">Go back home</Link></div>; }`
};

for (const [file, content] of Object.entries(stubs)) {
  const fp = path.join(srcDir, file);
  if (!fs.existsSync(fp)) {
     fs.writeFileSync(fp, content);
  }
}
console.log("Stubs generated!");
