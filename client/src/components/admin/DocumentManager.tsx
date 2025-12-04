import { useState } from "react";
import UploadDocs from "@/components/UploadDocs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, FileText, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function DocumentManager() {
  const [uploadedDocsCount, setUploadedDocsCount] = useState(0);
  const { toast } = useToast();

  const handleUploadSuccess = () => {
    setUploadedDocsCount(prev => prev + 1);
    toast({
      title: "Success",
      description: "Document processed and added to AI knowledge base",
    });
  };

  return (
    <div className="flex-1 bg-background">
      <div className="container mx-auto px-4 sm:px-6 py-6">
        {/* Page Header - Using common AdminHeader instead */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Document Management</h1>
          <p className="text-muted-foreground">
            Manage documents for the AI Assistant. When users ask questions specifically about these documents, the AI will provide only accurate information from them.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Upload className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Upload Documents</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">Add new documents. Users will get specific information from these when relevant.</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <UploadDocs onUploadSuccess={handleUploadSuccess} />
                
                {uploadedDocsCount > 0 && (
                  <div className="mt-4 p-3 bg-green-50 rounded-md border border-green-200">
                    <p className="text-sm text-green-800">
                      <span className="font-medium">{uploadedDocsCount}</span> document{uploadedDocsCount !== 1 ? 's' : ''} processed and added to knowledge base
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <FileText className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Document Management Guide</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">How it works</h3>
                    <ul className="text-sm text-muted-foreground space-y-2">
                      <li className="flex items-start gap-2">
                        <span className="mt-1 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0"></span>
                        <span>Upload PDF, DOCX, or TXT files to train the AI model</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="mt-1 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0"></span>
                        <span>Documents are processed and converted to embeddings</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="mt-1 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0"></span>
                        <span>When users ask questions specifically about document content, the AI provides only accurate information from these documents</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="mt-1 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0"></span>
                        <span>For general questions, the AI can draw on its general knowledge</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="mt-1 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0"></span>
                        <span>All uploaded documents are persisted between server restarts</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-2">Best Practices</h3>
                    <ul className="text-sm text-muted-foreground space-y-2">
                      <li className="flex items-start gap-2">
                        <span className="mt-1 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0"></span>
                        <span>Use clear, well-structured documents with headings</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="mt-1 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0"></span>
                        <span>Include specific terminology relevant to crop diseases and pests</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="mt-1 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0"></span>
                        <span>Break large documents into smaller, focused sections</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-yellow-800">Admin Only Access</h4>
                        <p className="text-sm text-yellow-700 mt-1">
                          Only administrators can upload documents. Regular users can only ask questions about existing documents.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}