import { useState } from "react";
import UploadDocs from "@/components/UploadDocs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, FileText, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import AdminHeader from "./AdminHeader";
import AdminFooter from "./AdminFooter";

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
    <>
      <AdminHeader />
      <main className="flex-1 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Section */}
        <div className="lg:col-span-2">
          <Card className="shadow-md border-t-4 border-t-primary">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-primary/70 shadow-md">
                  <Upload className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <CardTitle className="text-xl">Upload Documents</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">Add new documents to the AI knowledge base</p>
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

        {/* Guide Section */}
        <div className="lg:col-span-1">
          <Card className="shadow-md h-full">
            <CardHeader className="bg-gradient-to-r from-muted/50 to-transparent">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-md">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                <CardTitle className="text-xl">Quick Guide</CardTitle>
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
                  
                  <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4 shadow-sm">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-yellow-100">
                        <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-yellow-900">Admin Only Access</h4>
                        <p className="text-sm text-yellow-800 mt-1 leading-relaxed">
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
      </main>
      <AdminFooter />
    </>
  );
}