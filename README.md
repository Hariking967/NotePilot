# NotePilot

NotePilot is a Next.js-based web application that provides advanced PowerPoint presentation analysis and evaluation tools.

## Features

### PPT Score Evaluation

- Upload PowerPoint presentations for detailed evaluation
- Customizable evaluation criteria
- Real-time scoring and feedback
- Detailed analysis of presentation aspects
- Support for user-defined evaluation fields
- Score visualization with detailed feedback
- Overall presentation rating with justification

### PPT to Text Conversion

- Extract text content from PowerPoint presentations
- Efficient file upload handling
- Text extraction and processing
- Clean presentation of extracted content

### Key Components

#### PPT Score View (`/pptscore`)

- **File Upload**: Support for .ppt and .pptx files
- **Custom Evaluation Fields**:
  - Add multiple evaluation criteria
  - Prevent duplicate fields
  - User-added fields are highlighted
- **Real-time Processing**:
  - Automatic file upload handling
  - Server-side presentation analysis
  - Instant feedback display
- **Evaluation Display**:
  - Overall presentation score
  - Individual criteria scores
  - Detailed feedback for each criterion
  - Clean black and white UI with emerald accents for user fields

#### PPT to Text View (`/ppttotext`)

- Clean interface for file uploads
- Text extraction capabilities
- Organized display of extracted content

## Technical Details

### Built With

- Next.js (App Router)
- React
- TypeScript
- Tailwind CSS
- Shadcn UI Components

### API Endpoints

- `/api/evaluate` - Handles presentation evaluation
- `/api/uploads/local` - Manages file uploads
- `/api/ppttotext` - Processes text extraction

### Key Features Implementation

1. **File Processing**

   - Local file storage
   - Secure file handling
   - Support for various PowerPoint formats

2. **Evaluation System**

   - Custom evaluation criteria support
   - Unique field validation
   - Structured feedback generation
   - Score calculation and normalization

3. **User Interface**
   - Responsive design
   - Real-time feedback
   - Error handling
   - Loading states
   - Clean, modern aesthetics

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── pptscore/          # PPT evaluation page
│   └── ppttotext/         # PPT to text conversion page
├── components/            # Reusable UI components
├── modules/              # Feature-specific modules
│   ├── pptscore/        # PPT scoring functionality
│   └── ppttotext/       # Text extraction functionality
└── api/                 # API routes
    ├── evaluate/        # Evaluation endpoints
    └── uploads/         # File upload handling
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
