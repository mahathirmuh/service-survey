# Survey Application - Department Performance Evaluation System

A comprehensive web-based survey application designed for organizational department performance evaluation and feedback collection.

## 📋 Project Overview

This application enables employees to evaluate different departments within their organization through structured questionnaires. It features a modern, responsive interface with department-specific sections, visual performance charts, and comprehensive feedback collection.

### Key Features

- **Multi-Department Support**: Environmental, HR, External Affairs, Finance, ICT, Supply Chain Management, and Personal Data departments
- **Section-Based Evaluation**: Each department contains multiple specialized sections for targeted feedback
- **Visual Performance Charts**: Interactive charts displaying department performance metrics
- **Employee Validation**: ID badge number validation against employee database
- **Responsive Design**: Mobile-friendly interface with modern UI components
- **Real-time Data**: Live survey submission and data storage
- **Professional Layout**: Clean, intuitive design with proper spacing and typography

### Supported Departments & Sections

- **Environmental**: Management, Monitoring, Study, Audit teams
- **Human Resources**: Personnel Development, Industrial Relations, Compensation & Benefits, Safety & Security, Translator services
- **External Affairs**: Community Relations, Asset Protection, Government Relations
- **Finance**: Finance, Contract Management, Cost Control
- **ICT**: Infrastructure, Data Center, Support services
- **Supply Chain Management**: Logistics, Warehouse & Inventory operations
- **Personal Data**: Data protection and management

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v16 or higher) - [Install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)
- **npm** or **bun** package manager
- **Docker** (optional, for containerized deployment)

### Installation & Setup

#### Option 1: Local Development

```bash
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to project directory
cd service-survey

# Install dependencies
npm install
# or
bun install

# Start development server
npm run dev
# or
bun run dev
```

The application will be available at `http://localhost:5173`

#### Option 2: Docker Development

```bash
# Build and run with Docker Compose
docker-compose up --build

# For development with hot reload
docker-compose -f docker-compose.dev.yml up --build
```

The application will be available at `http://localhost:3000`

## 🛠️ How to Edit This Code

### Development Environment Options

#### **1. Use Lovable IDE (Recommended)**
- Visit the [Lovable Project](https://lovable.dev/projects/1ad2be17-68d7-45cd-acf5-d596f00cb6a4)
- Make changes through natural language prompts
- Changes are automatically committed to the repository

#### **2. Local IDE Development**
- Clone the repository and use your preferred IDE (VS Code, WebStorm, etc.)
- Make changes locally and push to the repository
- Changes will be reflected in Lovable automatically

#### **3. GitHub Direct Editing**
- Navigate to files in the GitHub repository
- Click the "Edit" button (pencil icon)
- Make changes and commit directly

#### **4. GitHub Codespaces**
- Click "Code" → "Codespaces" → "New codespace"
- Edit files in the browser-based VS Code environment
- Commit and push changes when done

### Project Structure

```
src/
├── components/          # React components
│   ├── SurveyForm.tsx  # Main survey form component
│   └── ui/             # Reusable UI components
├── data/
│   └── images.ts       # Department and section configurations
├── assets/             # Images and static files
├── hooks/              # Custom React hooks
├── lib/                # Utility functions
├── pages/              # Page components
└── integrations/       # External service integrations
```

### Key Files to Modify

- **`src/data/images.ts`**: Department configurations, sections, and content
- **`src/components/SurveyForm.tsx`**: Main survey form logic and UI
- **`src/assets/`**: Department images and charts
- **`supabase/migrations/`**: Database schema changes
- **`mssql-schema.sql`**: MSSQL database alternative

## 🗄️ Database Options

### Current Setup: Supabase (PostgreSQL)
- Cloud-hosted PostgreSQL database
- Real-time capabilities
- Built-in authentication and security

### Alternative: Microsoft SQL Server
- Use `mssql-schema.sql` for local MSSQL setup
- See `README-MSSQL.md` for detailed migration instructions
- Includes equivalent schema, triggers, and sample data

## 🎨 Technologies Used

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Database**: Supabase (PostgreSQL) / MSSQL Server
- **Containerization**: Docker & Docker Compose
- **State Management**: React Hooks
- **Form Handling**: Custom form validation

## 📱 Features in Detail

### Survey Flow
1. **Employee Information**: Name and ID badge validation
2. **Department Selection**: Choose departments to evaluate
3. **Section Selection**: Pick specific sections within departments
4. **Questionnaire**: Rate services on 1-5 scale with feedback
5. **Visual Charts**: View department performance metrics
6. **Submission**: Save responses to database

### UI/UX Features
- Responsive design for all screen sizes
- Professional color scheme and typography
- Interactive department tabs
- Visual performance charts
- Form validation and error handling
- Loading states and user feedback

## 🚢 Deployment

### Development Deployment
```bash
# Using Docker
docker-compose up --build -d

# Local development
npm run dev
```

### Production Deployment

#### **Option 1: Lovable Platform**
- Open [Lovable Project](https://lovable.dev/projects/1ad2be17-68d7-45cd-acf5-d596f00cb6a4)
- Click Share → Publish
- Custom domain available in Project → Settings → Domains

#### **Option 2: Manual Deployment**
```bash
# Build for production
npm run build

# Deploy dist/ folder to your hosting provider
```

#### **Option 3: Docker Production**
```bash
# Build production image
docker build -t survey-app .

# Run production container
docker run -p 3000:80 survey-app
```

## 🔧 Configuration

### Environment Variables
Create `.env` file for local development:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
```

### Database Configuration
- **Supabase**: Configure in `src/integrations/supabase/`
- **MSSQL**: Use connection string in your backend integration

## 📚 Additional Documentation

- **Docker Setup**: See `README-Docker.md`
- **MSSQL Migration**: See `README-MSSQL.md`
- **Database Schema**: Check `supabase/migrations/` or `mssql-schema.sql`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For technical support or questions:
- Check the documentation files in the repository
- Review the database schema files
- Consult the Lovable project dashboard
- Check Docker logs for containerized deployments

---

**Built with ❤️ using modern web technologies for efficient organizational feedback collection.**
