import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, CheckCircle, X, AlertCircle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { parse } from 'papaparse';

interface ParsedTrade {
  tradeId?: string;
  symbol?: string;
  entryTime?: string;
  exitTime?: string;
  entryPrice?: string;
  exitPrice?: string;
  positionSize?: string;
  profitLoss?: string;
  riskReward?: string;
  session?: string;
  direction?: string;
  setupType?: string;
  emotionalState?: string;
  holdingTime?: string;
  maxDrawdown?: string;
  maxProfit?: string;
  exitReason?: string;
  commission?: string;
  swap?: string;
  tags?: string;
  notes?: string;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  rowCount: number;
}

export default function CSVUpload() {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [parsedData, setParsedData] = useState<ParsedTrade[]>([]);

  const validateCSVData = useCallback((data: ParsedTrade[]): ValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];
    let isValid = true;

    if (data.length === 0) {
      errors.push('CSV file is empty');
      return { isValid: false, errors, warnings, rowCount: 0 };
    }

    // Check required columns
    const requiredFields = ['tradeId', 'symbol', 'entryTime', 'exitTime', 'entryPrice', 'exitPrice'];
    const firstRow = data[0];
    
    requiredFields.forEach(field => {
      if (!firstRow[field]) {
        errors.push(`Missing required column: ${field}`);
        isValid = false;
      }
    });

    // Validate data types and formats
    data.forEach((row, index) => {
      if (index === 0) return; // Skip header row

      // Validate numeric fields
      const numericFields = ['entryPrice', 'exitPrice', 'positionSize', 'profitLoss', 'riskReward'];
      numericFields.forEach(field => {
        const value = row[field as keyof ParsedTrade];
        if (value && isNaN(Number(value))) {
          warnings.push(`Row ${index}: ${field} should be a number`);
        }
      });

      // Validate dates
      const dateFields = ['entryTime', 'exitTime'];
      dateFields.forEach(field => {
        const value = row[field as keyof ParsedTrade];
        if (value && isNaN(Date.parse(value))) {
          warnings.push(`Row ${index}: ${field} is not a valid date format`);
        }
      });

      // Validate required values
      if (!row.tradeId) {
        errors.push(`Row ${index}: Trade ID is required`);
        isValid = false;
      }

      if (!row.symbol) {
        errors.push(`Row ${index}: Symbol is required`);
        isValid = false;
      }
    });

    return {
      isValid,
      errors,
      warnings,
      rowCount: data.length - 1 // Exclude header row
    };
  }, []);

  const handleFileSelect = useCallback((selectedFile: File) => {
    if (selectedFile && selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
      setValidationResult({
        isValid: false,
        errors: ['Please select a valid CSV file'],
        warnings: [],
        rowCount: 0
      });
      return;
    }

    setFile(selectedFile);
    setValidationResult(null);
    setParsedData([]);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const processFile = useCallback(async () => {
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const text = await file.text();
      setUploadProgress(30);

      // Parse CSV using PapaParse
      parse(text, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          setUploadProgress(60);
          
          const data = results.data as ParsedTrade[];
          setParsedData(data);
          setUploadProgress(80);

          // Validate parsed data
          const validation = validateCSVData(data);
          setValidationResult(validation);
          setUploadProgress(100);

          setTimeout(() => {
            setIsUploading(false);
            if (validation.isValid) {
              // Here you would typically send the data to your backend
              console.log('Valid trades ready for import:', data);
            }
          }, 500);
        },
        error: (error) => {
          setValidationResult({
            isValid: false,
            errors: [`CSV parsing error: ${error.message}`],
            warnings: [],
            rowCount: 0
          });
          setIsUploading(false);
          setUploadProgress(0);
        }
      });
    } catch (error) {
      setValidationResult({
        isValid: false,
        errors: [`File reading error: ${error}`],
        warnings: [],
        rowCount: 0
      });
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, [file, validateCSVData]);

  const resetUpload = useCallback(() => {
    setFile(null);
    setValidationResult(null);
    setParsedData([]);
    setUploadProgress(0);
    setIsUploading(false);
  }, []);

  return (
    <Card className="glass-card border-0 shadow-lg">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl">
            <Upload className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold">CSV Upload</h3>
            <p className="text-sm text-muted-foreground">
              Import your trading data from CSV files
            </p>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Upload Area */}
        <div
          className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
            isDragging 
              ? 'border-primary bg-primary/5 scale-[1.02]' 
              : 'border-muted-foreground/20 hover:border-primary/50 hover:bg-muted/10'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <input
            type="file"
            accept=".csv,text/csv"
            onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={isUploading}
          />
          
          <div className="space-y-4">
            <motion.div
              animate={{ scale: isDragging ? 1.1 : 1 }}
              className="mx-auto w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center"
            >
              <FileText className="h-8 w-8 text-primary" />
            </motion.div>
            
            <div className="space-y-2">
              <h4 className="text-lg font-semibold">
                {file ? file.name : 'Drop your CSV file here'}
              </h4>
              <p className="text-sm text-muted-foreground">
                {file 
                  ? `Size: ${(file.size / 1024).toFixed(1)} KB` 
                  : 'or click to browse'
                }
              </p>
            </div>
          </div>
        </div>

        {/* File Actions */}
        <AnimatePresence>
          {file && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center justify-between p-4 bg-muted/30 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">{file.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  onClick={processFile}
                  disabled={isUploading}
                  className="flex items-center gap-2"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      Import Trades
                    </>
                  )}
                </Button>
                
                <Button
                  variant="outline"
                  onClick={resetUpload}
                  disabled={isUploading}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress Bar */}
        <AnimatePresence>
          {isUploading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-2"
            >
              <div className="flex items-center justify-between text-sm">
                <span>Processing file...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Validation Results */}
        <AnimatePresence>
          {validationResult && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {/* Status Badge */}
              <div className="flex items-center gap-2">
                {validationResult.isValid ? (
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Valid
                  </Badge>
                ) : (
                  <Badge className="bg-red-100 text-red-800 border-red-200">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Invalid
                  </Badge>
                )}
                
                <span className="text-sm text-muted-foreground">
                  {validationResult.rowCount} trades found
                </span>
              </div>

              {/* Errors */}
              {validationResult.errors.length > 0 && (
                <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <h5 className="font-semibold text-red-800 dark:text-red-300 mb-2 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    Errors ({validationResult.errors.length})
                  </h5>
                  <ul className="space-y-1 text-sm text-red-700 dark:text-red-400">
                    {validationResult.errors.map((error, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-red-500 dark:text-red-400 mt-0.5">•</span>
                        <span>{error}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Warnings */}
              {validationResult.warnings.length > 0 && (
                <div className="p-4 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <h5 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-2 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    Warnings ({validationResult.warnings.length})
                  </h5>
                  <ul className="space-y-1 text-sm text-yellow-700 dark:text-yellow-400">
                    {validationResult.warnings.map((warning, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-yellow-500 dark:text-yellow-400 mt-0.5">•</span>
                        <span>{warning}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Success State */}
              {validationResult.isValid && validationResult.errors.length === 0 && (
                <div className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                    <div>
                      <h5 className="font-semibold text-green-800 dark:text-green-300">
                        Import Ready!
                      </h5>
                      <p className="text-sm text-green-700 dark:text-green-400">
                        {validationResult.rowCount} trades validated and ready to import
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sample Format */}
        <div className="p-4 bg-muted/30 rounded-lg">
          <h5 className="font-semibold mb-3">Expected CSV Format:</h5>
          <div className="text-xs font-mono bg-background p-3 rounded border overflow-x-auto">
            tradeId,symbol,entryTime,exitTime,entryPrice,exitPrice,positionSize,profitLoss,riskReward,session,direction,setupType,emotionalState,holdingTime,maxDrawdown,maxProfit,exitReason,commission,swap,tags,notes
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Required fields: tradeId, symbol, entryTime, exitTime, entryPrice, exitPrice
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
