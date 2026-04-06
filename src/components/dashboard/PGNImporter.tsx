import { useCallback } from 'react';
import { Upload, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PGNImporterProps {
  onImport: (pgn: string) => void;
  gameCount: number;
}

export function PGNImporter({ onImport, gameCount }: PGNImporterProps) {
  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files) return;
    const texts: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const text = await files[i].text();
      texts.push(text);
    }
    onImport(texts.join('\n\n'));
  }, [onImport]);

  return (
    <div className="stat-card">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-heading font-semibold text-sm">Import PGN Games</h3>
            <p className="text-xs text-muted-foreground">
              {gameCount > 0 ? `${gameCount} games loaded` : 'Upload .pgn files or drag & drop'}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <label>
            <input
              type="file"
              accept=".pgn"
              multiple
              className="hidden"
              onChange={e => handleFiles(e.target.files)}
            />
            <Button variant="outline" size="sm" className="cursor-pointer text-xs" asChild>
              <span><Upload className="h-3.5 w-3.5 mr-1.5" /> Upload PGN</span>
            </Button>
          </label>
        </div>
      </div>
    </div>
  );
}
