# Adjacent - AI-Powered Collaborative Project Manager

A futuristic landing page for Adjacent, an intelligent project management platform powered by a network of autonomous AI agents.

## 🚀 Features

- **Dark Futuristic Theme**: Modern, sleek design with gradient effects and animations
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Smooth Animations**: Powered by Framer Motion for engaging user interactions
- **Modern Tech Stack**: Built with Next.js 14, TypeScript, and Tailwind CSS

## 🛠️ Tech Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **Lucide React** - Beautiful icon library
- **Supabase** - Backend as a Service (Database, Authentication, Storage)

## 📦 Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd hackutd
```

2. Install dependencies:
```bash
npm install
```

3. Set up Supabase:
   - Create a Supabase project at https://supabase.com
   - Get your project URL and anon key from the Supabase dashboard
   - Create a `.env.local` file in the root directory:
     ```env
     NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
     ```
   - Run the database migration (see [README_SUPABASE.md](./README_SUPABASE.md) for detailed instructions)

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

## 🎨 Project Structure

```
hackutd/
├── app/
│   ├── api/             # API routes
│   │   └── auth/        # Authentication endpoints
│   ├── layout.tsx       # Root layout
│   ├── page.tsx         # Home page
│   └── globals.css      # Global styles
├── components/          # React components
├── lib/
│   ├── supabase/        # Supabase client configuration
│   └── db/              # Database utility functions
├── supabase/
│   └── migrations/      # Database migration files
├── public/              # Static assets
└── package.json         # Dependencies
```

## 🎯 Sections

1. **Hero Section** - Eye-catching introduction with animated background
2. **Tracks** - Competition tracks (PNC, NVIDIA, Startup)
3. **Overview** - Project overview and key features
4. **How It Works** - Step-by-step workflow explanation
5. **Agents** - Detailed information about the 3-agent network
6. **Vision** - Project vision and goals
7. **Footer** - Contact and social links

## 🎨 Design Features

- **Gradient Text Effects** - Beautiful gradient text animations
- **Glow Effects** - Subtle glow effects on interactive elements
- **Animated Backgrounds** - Floating orbs and gradient animations
- **Smooth Scrolling** - Smooth scroll animations with Framer Motion
- **Responsive Grid Layouts** - Adaptive layouts for all screen sizes

## 🚀 Build for Production

```bash
npm run build
npm start
```

## 📝 License

This project is created for HackUTD.

## 🗄️ Database Setup

This project uses Supabase for backend services. See [README_SUPABASE.md](./README_SUPABASE.md) for detailed setup instructions.

### Database Schema

The database includes the following main tables:
- **profiles** - User profile information
- **companies** - Company/organization data
- **projects** - Project information
- **tasks** - Task management (Jira-style)
- **agents** - AI agent configurations
- **tensions** - Tensions detected by agents
- **project_data_sources** - Uploaded files and data sources
- **agent_activities** - Agent activity logs

All tables have Row Level Security (RLS) enabled for secure access control.

## 🔐 Authentication

The project includes authentication API routes:
- `POST /api/auth/signup` - User registration
- `POST /api/auth/signin` - User login
- `POST /api/auth/signout` - User logout
- `GET /api/auth/user` - Get current user
- `GET /api/auth/callback` - OAuth callback handler

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

