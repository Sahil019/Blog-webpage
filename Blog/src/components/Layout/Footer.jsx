import { Link } from 'react-router-dom';
import { PenLine, Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-border bg-secondary/30 mt-auto">
      <div className="container-wide py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <PenLine className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-heading text-xl text-foreground">
              Inkwell
            </span>
          </Link>

          <p className="text-sm text-muted-foreground flex items-center gap-1">
            Crafted with{' '}
            <Heart className="w-4 h-4 text-accent fill-accent" /> for writers
          </p>
        </div>
      </div>
    </footer>
  );
}
