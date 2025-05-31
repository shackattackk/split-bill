# Split Bill

A modern web application built with Next.js for easily splitting bills and expenses among friends, roommates, or groups.

## Features

- Modern UI built with Next.js and Tailwind CSS
- Real-time updates and notifications
- OCR capabilities for receipt scanning
- AI-powered expense categorization
- Secure authentication with Supabase
- Background job processing with Trigger.dev

## Tech Stack

- **Framework**: Next.js 15.3.2
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase with Drizzle ORM
- **Authentication**: Supabase Auth
- **Background Jobs**: Trigger.dev
- **AI Integration**: Together AI


## Prerequisites

- Node.js (Latest LTS version recommended)
- pnpm (v10.11.0 or later)
- Supabase account
- Trigger.dev account
- Together AI API key

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/yourusername/split-bill.git
cd split-bill
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
Create a `.env` file in the root directory with the following variables:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
TRIGGER_API_KEY=your_trigger_api_key
TOGETHER_API_KEY=your_together_api_key
```

4. Run the development server:
```bash
pnpm dev
```

This will start both the Next.js development server and Trigger.dev worker.

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Available Scripts

- `pnpm dev` - Start development server with Trigger.dev worker
- `pnpm build` - Build the application for production
- `pnpm start` - Start the production server
- `pnpm lint` - Run ESLint
- `pnpm trigger:dev` - Start Trigger.dev worker in development mode

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
