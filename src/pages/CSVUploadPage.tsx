import { motion } from 'framer-motion';
import { Upload, FileText, ArrowRight } from 'lucide-react';
import EnhancedCSVUpload from '@/components/upload/EnhancedCSVUpload';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export default function CSVUploadPage() {
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring' as const, stiffness: 100 } }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 max-w-[1200px] mx-auto pb-20"
    >
      {/* Page Header */}
      <motion.div variants={itemVariants} className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary/5 rounded-3xl blur-3xl opacity-50" />
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg border border-white/10">
              <Upload className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent tracking-tight">
                CSV Upload
              </h1>
              <p className="text-lg text-muted-foreground font-medium mt-1">
                Import your trade history — new uploads replace all existing data
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            className="flex items-center gap-2 self-start md:self-auto"
            onClick={() => navigate('/journal')}
          >
            <FileText className="h-4 w-4" />
            View Journal
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </motion.div>

      {/* Info Banner */}
      <motion.div variants={itemVariants}>
        <div className="flex flex-col sm:flex-row gap-4">
          {[
            { label: 'Supported Formats', value: 'CSV (any broker export)' },
            { label: 'Storage', value: 'Local browser storage' },
          ].map((item) => (
            <div
              key={item.label}
              className="flex-1 rounded-xl bg-card/50 border border-border/60 backdrop-blur-sm px-5 py-4"
            >
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">
                {item.label}
              </p>
              <p className="text-sm font-semibold text-foreground">{item.value}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Main Upload Component */}
      <motion.div variants={itemVariants}>
        <EnhancedCSVUpload />
      </motion.div>
    </motion.div>
  );
}
