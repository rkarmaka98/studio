
import type { SVGProps } from 'react';
import { cn } from '@/lib/utils';

export function Logo(props: SVGProps<SVGSVGElement> & { size?: number; className?: string }) {
  const { size = 40, className, ...rest } = props; // className is now for the container div, ...rest for the SVG
  return (
    <div className={cn("flex items-center space-x-1", className)}> {/* Apply className to the root div */}
       <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor" // Will inherit from parent div if text-primary-foreground is set, but paths below have specific colors
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        // Removed className={className} from here, specific SVG classes could be a new prop if needed
        {...rest} // Pass other SVGProps (like id, specific event handlers if any) to svg
      >
        <path d="M12 2a4 4 0 0 0-4 4c0 3 4 6 4 6s4-3 4-6a4 4 0 0 0-4-4Z" fill="hsl(var(--primary))" stroke="hsl(var(--primary-foreground))"/>
        <path d="M14.5 9.5A7.5 7.5 0 0 0 7 15.25V18a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-2.75A7.5 7.5 0 0 0 14.5 9.5Z" fill="hsl(var(--accent))" stroke="hsl(var(--accent-foreground))"/>
        <path d="M12 12v10" stroke="hsl(var(--primary-foreground))"/>
        <path d="M17.73 11A4.5 4.5 0 0 1 21 14.27V18a2 2 0 0 1-2 2h-1" stroke="hsl(var(--accent-foreground))"/>
        <path d="M6.27 11A4.5 4.5 0 0 0 3 14.27V18a2 2 0 0 0 2 2h1" stroke="hsl(var(--accent-foreground))"/>
      </svg>
      <span className="text-2xl font-semibold text-foreground">Therapie</span>
    </div>
  );
}
