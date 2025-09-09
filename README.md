# Smart Timetable Generator

A modern, AI-powered timetable generation system built with Next.js, Firebase, and Perplexity AI. This application helps educational institutions create optimized class schedules with intelligent conflict resolution and approval workflows.

## ✨ Features

### 🎯 Core Functionality
- **AI-Powered Generation**: Uses Perplexity AI to generate multiple optimized timetable options
- **Multi-Step Configuration**: Guided setup process for time slots, subjects, classrooms, labs, and faculty
- **Conflict Resolution**: Intelligent scheduling that avoids double-booking and faculty conflicts
- **Fixed Classes**: Support for immovable classes/events (seminars, meetings, etc.)
- **Lunch Breaks**: Automatic lunch slot management across all days
- **Customization**: Interactive timetable editing with drag-and-drop functionality

### 👥 User Management
- **Role-Based Access**: Separate interfaces for staff and approvers
- **Firebase Authentication**: Secure user registration and login
- **Profile Management**: User profiles with role assignments
- **Draft System**: Save and manage multiple timetable drafts

### 🎨 User Experience
- **Dark/Light Theme**: Toggle between themes with smooth transitions
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Real-time Validation**: Immediate feedback on missing or invalid data
- **Auto-Retry Logic**: Automatically retries generation if blank timetables are detected
- **Loading States**: Clear visual feedback during generation process

### 📊 Approval Workflow
- **Draft Submission**: Submit timetables for approval
- **Approval Interface**: Approvers can review, approve, or reject timetables
- **Comments System**: Add rejection reasons and feedback
- **Status Tracking**: Monitor approval status in real-time

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Firebase project with Firestore enabled
- Perplexity AI API key

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Smart-Timetable-Generator/frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env.local` file in the root directory:
   ```env
   # Firebase Configuration
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

   # Firebase Admin (Server-side)
   FIREBASE_ADMIN_PROJECT_ID=your_project_id
   FIREBASE_ADMIN_PRIVATE_KEY=your_private_key
   FIREBASE_ADMIN_CLIENT_EMAIL=your_client_email

   # Perplexity AI
   PERPLEXITY_API_KEY=your_perplexity_api_key
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗️ Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── ConflictBanner.js    # Conflict detection display
│   ├── InputList.js         # Dynamic input list component
│   ├── Navbar.js            # Navigation bar with theme toggle
│   ├── Stepper.js           # Multi-step progress indicator
│   └── TimetableTable.js    # Interactive timetable display
├── context/              # React Context providers
│   ├── AuthContext.js       # Authentication state management
│   ├── SchedulerContext.js  # Timetable generation logic
│   └── ThemeContext.js      # Dark/light theme management
├── lib/                  # Utility libraries
│   ├── firebaseAdmin.js     # Server-side Firebase admin
│   └── firebaseClient.js    # Client-side Firebase config
├── pages/                # Next.js pages and API routes
│   ├── api/              # API endpoints
│   │   ├── generateTimetablePerplexity.js  # Main AI generation
│   │   ├── generateTimetable.js           # Alternative generation
│   │   ├── generateTimetableLocal.js      # Local fallback
│   │   └── timetables/                    # Timetable CRUD operations
│   ├── approvals.js       # Approver interface
│   ├── classrooms.js      # Classroom management
│   ├── drafts.js          # Draft management
│   ├── fixedClasses.js    # Fixed class configuration
│   ├── labs.js            # Lab scheduling
│   ├── subjects.js        # Subject configuration
│   ├── timeslots.js       # Time slot setup
│   └── timetable.js       # Main timetable generation page
└── styles/
    └── globals.css        # Global styles and Tailwind config
```

## 🔧 Configuration Steps

### 1. Time Slots
- Define your institution's time slots (e.g., 09:00-10:00, 10:00-11:00)
- Set lunch break timing
- Auto-generate slots from start time and duration

### 2. Subjects
- Add theory subjects with weekly occurrence counts
- Assign faculty members to each subject
- Set faculty availability by day and time slot

### 3. Classrooms
- Configure available classrooms
- Set room capacities and features

### 4. Labs
- Define lab sessions with duration and preferred timing
- Assign specific rooms if required

### 5. Fixed Classes
- Lock specific classes to particular times/rooms
- Useful for seminars, meetings, or special events

### 6. Generate & Review
- AI generates 3 different timetable options
- Compare recommendations and select the best fit
- Customize schedules as needed

## 🎨 Theming

The application supports both dark and light themes with:
- Smooth transitions between themes
- Consistent color schemes across all components
- Theme persistence across sessions
- Accessible contrast ratios

## 🔐 User Roles

### Staff Users
- Create and configure timetables
- Submit drafts for approval
- View and edit their own timetables

### Approver Users
- Review submitted timetables
- Approve or reject with comments
- Access the approvals dashboard

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms
1. Build the application: `npm run build`
2. Start the production server: `npm start`
3. Configure your hosting platform with the built files

## 🛠️ Development

### Available Scripts
- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run Biome linter
- `npm run format` - Format code with Biome

### Code Quality
- **Biome**: Fast linter and formatter
- **ESLint**: Code quality checks
- **Prettier**: Code formatting
- **TypeScript**: Type safety (optional)

## 🔧 API Endpoints

### Timetable Generation
- `POST /api/generateTimetablePerplexity` - Main AI generation endpoint
- `POST /api/generateTimetable` - Alternative generation method
- `POST /api/generateTimetableLocal` - Local fallback generation

### Timetable Management
- `GET /api/timetables` - List all timetables
- `POST /api/timetables` - Create new timetable
- `PUT /api/timetables/[id]` - Update timetable
- `PUT /api/timetables/[id]/submit` - Submit for approval

## 🐛 Troubleshooting

### Common Issues

1. **Blank Timetables Generated**
   - The system includes auto-retry logic
   - Check that all required fields are filled
   - Verify faculty availability matches subject assignments

2. **Permission Denied on Approvals Page**
   - Ensure user has "approver" role in Firebase
   - Check user authentication status

3. **Generation Errors**
   - Verify Perplexity API key is correct
   - Check network connectivity
   - Review console logs for detailed error messages

### Debug Mode
Enable detailed logging by checking browser console for:
- Generation progress
- API responses
- State changes
- Error details

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Perplexity AI** for intelligent timetable generation
- **Firebase** for authentication and data storage
- **Next.js** for the React framework
- **Tailwind CSS** for styling
- **Vercel** for deployment platform

## 📞 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the troubleshooting section above
- Review the API documentation

---

**Built with ❤️ for educational institutions worldwide**
