'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import { Loader2, Upload } from 'lucide-react';
import { brevoApi } from '@/lib/utils';

type Attribute = {
  name: string;
  type: string;
};

const PREDEFINED_ATTRIBUTES: Attribute[] = [
  { name: 'EMAIL', type: 'Email' },
  { name: 'FIRSTNAME', type: 'Text' },
  { name: 'LASTNAME', type: 'Text' },
  { name: 'SMS', type: 'SMS' }
];

export default function ContactImport({
  listId,
  fetchContacts,
  onClose
}: {
  listId: string;
  fetchContacts: () => void;
  onClose: () => void;
}) {
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [sampleData, setSampleData] = useState<string[]>([]);
  const [mappings, setMappings] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [separator, setSeparator] = useState<',' | ';'>(',');

  const detectSeparator = (content: string): ',' | ';' => {
    const firstLine = content.split('\n')[0];
    return firstLine.includes(';') ? ';' : ',';
  };

  const splitLine = (line: string, sep: ',' | ';'): string[] => {
    return line.split(sep).map((item) => item.trim());
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCsvFile(file);

      const content = await file.text();
      const detectedSeparator = detectSeparator(content);
      setSeparator(detectedSeparator);

      const lines = content.split('\n');
      if (lines.length > 1) {
        const csvHeaders = splitLine(lines[0], detectedSeparator);
        setHeaders(csvHeaders);
        setSampleData(splitLine(lines[1], detectedSeparator));
        setMappings(new Array(csvHeaders.length).fill('do_not_import'));
      }
    }
  };

  const handleMappingChange = (index: number, value: string) => {
    setMappings((prev) => {
      const newMappings = [...prev];
      newMappings[index] = value;
      return newMappings;
    });
  };

  const handleImportContacts = async () => {
    if (!csvFile) {
      toast({
        title: 'Error',
        description: 'Please select a CSV file to import.',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);
    try {
      const fileContent = await csvFile.text();

      // Detect the separator used in the file (either , or ;)
      const detectedSeparator = detectSeparator(fileContent);

      // Split the file into lines
      const lines = fileContent.split('\n');

      // Get the headers from the first line
      const csvHeaders = splitLine(lines[0], detectedSeparator);

      // Get all the rows of data excluding the headers
      const csvData = lines.slice(1);

      // Create a new fileBody with mapped headers
      const fileBody = csvData
        .map((line) => {
          const values = splitLine(line, detectedSeparator); // Split the current line into values using detected separator
          return mappings
            .map((mapping, index) => {
              if (mapping === 'do_not_import') return ''; // Skip columns marked as 'do_not_import'
              return values[index] || ''; // Use the mapped value if it exists
            })
            .join(detectedSeparator); // Join the values using the detected separator
        })
        .join('\n'); // Join each row with a newline character

      // Ensure that the mapped headers are sent in the correct format
      const mappedHeaders = mappings
        .filter((mapping) => mapping !== 'do_not_import')
        .join(detectedSeparator); // Join the non-skipped headers with the detected separator

      const finalFileBody = `${mappedHeaders}\n${fileBody}`; // Combine the headers and fileBody

      const importData = {
        fileBody: finalFileBody,
        listIds: [parseInt(listId)],
        updateExistingContacts: true,
        emptyContactsAttributes: false
      };

      // Make the API call with the new importData
      await brevoApi.post('/contacts/import', importData);
      toast({
        title: 'Success',
        description: 'Contacts imported successfully!',
        variant: 'success'
      });
      fetchContacts();
      onClose();
    } catch (error) {
      console.error('Error importing contacts:', error);
      toast({
        title: 'Error',
        description: 'Failed to import contacts. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="csvFile">CSV File</Label>
        <Input
          id="csvFile"
          type="file"
          accept=".csv"
          onChange={handleFileChange}
        />
      </div>

      {headers.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">
            Map CSV Headers to Contact Attributes
          </h3>
          <p className="text-sm text-gray-500">
            Detected separator:{' '}
            {separator === ',' ? 'Comma (,)' : 'Semicolon (;)'}
          </p>
          {headers.map((header, index) => (
            <div key={header} className="flex items-center space-x-4">
              <div className="w-1/3">
                <Label>{header}</Label>
                <div className="text-sm text-gray-500">{sampleData[index]}</div>
              </div>
              <Select
                value={mappings[index]}
                onValueChange={(value) => handleMappingChange(index, value)}
              >
                <SelectTrigger className="w-2/3">
                  <SelectValue placeholder="Select an attribute" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="do_not_import">Do not import</SelectItem>
                  {PREDEFINED_ATTRIBUTES.map((attr) => (
                    <SelectItem key={attr.name} value={attr.name}>
                      {attr.name} - {attr.type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>
      )}

      <Button onClick={handleImportContacts} disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Importing...
          </>
        ) : (
          <>
            <Upload className="mr-2 h-4 w-4" />
            Import Contacts
          </>
        )}
      </Button>
    </div>
  );
}
