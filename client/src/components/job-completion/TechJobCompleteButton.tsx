import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CheckCircle, Loader2, Camera } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface TechJobCompleteButtonProps {
  workOrderId: string;
  jobTitle: string;
  currentStatus: string;
  technicianId: string;
  onCompleted?: () => void;
}

export function TechJobCompleteButton({ 
  workOrderId, 
  jobTitle, 
  currentStatus, 
  technicianId,
  onCompleted 
}: TechJobCompleteButtonProps) {
  const [open, setOpen] = useState(false);
  const [completionNotes, setCompletionNotes] = useState("");
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Don't show button if job is already tech completed or beyond
  if (currentStatus === "tech_completed" || 
      currentStatus === "pending_inspection" || 
      currentStatus === "inspector_approved") {
    return null;
  }

  const markTechCompleteMutation = useMutation({
    mutationFn: async (data: {
      notes: string;
      photos: string[];
    }) => {
      return apiRequest(`/api/work-orders/${workOrderId}/tech-complete`, "PUT", {
        status: "tech_completed",
        techCompletedDate: new Date().toISOString(),
        completionNotes: data.notes,
        techPhotos: data.photos,
        technicianId: technicianId
      });
    },
    onSuccess: () => {
      toast({
        title: "Job Marked Complete",
        description: "Job has been marked complete by technician. Awaiting inspector approval.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/work-orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      setOpen(false);
      setCompletionNotes("");
      setPhotoUrls([]);
      onCompleted?.();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to mark job complete. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (!completionNotes.trim()) {
      toast({
        title: "Notes Required",
        description: "Please provide completion notes before marking the job complete.",
        variant: "destructive",
      });
      return;
    }

    markTechCompleteMutation.mutate({
      notes: completionNotes,
      photos: photoUrls
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="default" 
          size="sm" 
          className="bg-green-600 hover:bg-green-700 text-white"
          data-testid={`button-tech-complete-${workOrderId}`}
        >
          <CheckCircle className="mr-2" size={16} />
          Job Complete
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Mark Job Complete</DialogTitle>
          <DialogDescription>
            Mark "{jobTitle}" as complete. This will send the job to inspection for final approval.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="completion-notes">Completion Notes *</Label>
            <Textarea
              id="completion-notes"
              placeholder="Describe the work completed and any important details..."
              value={completionNotes}
              onChange={(e) => setCompletionNotes(e.target.value)}
              className="mt-1"
              rows={4}
              data-testid="textarea-completion-notes"
            />
          </div>

          <div>
            <Label>Photos (Optional)</Label>
            <div className="mt-2 p-4 border-2 border-dashed border-gray-300 rounded-lg text-center">
              <Camera className="mx-auto h-8 w-8 text-gray-400" />
              <p className="mt-2 text-sm text-gray-500">
                Photo upload functionality would be implemented here
              </p>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              data-testid="button-cancel-completion"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={markTechCompleteMutation.isPending}
              data-testid="button-submit-completion"
            >
              {markTechCompleteMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Mark Complete
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}