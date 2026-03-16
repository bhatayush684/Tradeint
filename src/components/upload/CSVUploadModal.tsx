import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Upload } from 'lucide-react';
import CSVUpload from './CSVUpload';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface CSVUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CSVUploadModal({ isOpen, onClose }: CSVUploadModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl">
                <Upload className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Import Trading Data</h3>
                <p className="text-sm text-muted-foreground">
                  Upload CSV files to import your trading history
                </p>
              </div>
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="p-6">
          <CSVUpload />
        </div>
      </DialogContent>
    </Dialog>
  );
}
