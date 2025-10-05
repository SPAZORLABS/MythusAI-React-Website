import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Calendar, Clock, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/utils/formatters';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Screenplay } from '@/services/api/screenplayService';

interface ScreenplayListProps {
  screenplays: Screenplay[];
  onScreenplaySelect: (screenplayId: string) => void;
  className?: string;
}

const ScreenplayList: React.FC<ScreenplayListProps> = ({ 
  screenplays, 
  onScreenplaySelect, 
  className 
}) => {
  const navigate = useNavigate();

  const handleCallSheet = (e: React.MouseEvent, screenplayId: string) => {
    e.stopPropagation();
    navigate(`/screenplay/call-sheet`, { state: { screenplayId } });
  };

  const handleDailyReport = (e: React.MouseEvent, screenplayId: string) => {
    e.stopPropagation();
    navigate(`/screenplay/daily-production-report`, { state: { screenplayId } });
  };

  if (screenplays.length === 0) {
    return (
      <div className={cn("text-center py-12", className)}>
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-muted mx-auto mb-4">
          <FileText className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          No Screenplays Yet
        </h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          Create your first screenplay project to get started with script breakdown and production planning.
        </p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">Your Screenplays</h2>
        <Badge variant="secondary" className="text-xs">
          {screenplays.length} {screenplays.length === 1 ? 'screenplay' : 'screenplays'}
        </Badge>
      </div>

      <div className="grid gap-4">
        {screenplays.map((screenplay, index) => (
          <motion.div
            key={screenplay.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.3, 
              delay: Math.min(index * 0.05, 0.3),
              ease: "easeOut"
            }}
            layoutId={`screenplay-${screenplay.id}`}
          >
            <Card 
              className="cursor-pointer hover:shadow-md transition-all duration-200 hover:border-primary/20 group"
              onClick={() => onScreenplaySelect(screenplay.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base sm:text-lg truncate pr-2 group-hover:text-primary transition-colors">
                      {screenplay.title}
                    </CardTitle>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <FileText className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate max-w-[200px] sm:max-w-[300px]">
                          {screenplay.filename || 'No script uploaded'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 flex-shrink-0" />
                        <span className="whitespace-nowrap">{formatDate(screenplay.created_at)}</span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 hidden sm:block" />
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <Badge 
                    variant={screenplay.scene_count > 0 ? "default" : "secondary"}
                    className="text-xs w-fit"
                  >
                    {screenplay.scene_count > 0 ? `${screenplay.scene_count} scenes` : 'Not Processed'}
                  </Badge>

                  <div className="flex gap-2 flex-wrap">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => handleCallSheet(e, screenplay.id)}
                      className="text-xs h-8 px-3 flex-1 sm:flex-none"
                    >
                      <Calendar className="h-3 w-3 mr-1" />
                      <span className="hidden xs:inline">Call Sheet</span>
                      <span className="xs:hidden">Call</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => handleDailyReport(e, screenplay.id)}
                      className="text-xs h-8 px-3 flex-1 sm:flex-none"
                    >
                      <FileText className="h-3 w-3 mr-1" />
                      <span className="hidden xs:inline">Daily Report</span>
                      <span className="xs:hidden">Report</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ScreenplayList;
